from fastapi import APIRouter, HTTPException, Request
from typing import List
from app.db import get_connection, generate_reference
from app.schemas import OrderCreate, OrderOut, CardIntentCreate, CardIntentOut, TransferConfirmIn
import os

router = APIRouter(prefix="/orders", tags=["orders"])

ZELLE_EMAIL  = os.getenv("ZELLE_EMAIL",  "payments@safecar.com")
ZELLE_PHONE  = os.getenv("ZELLE_PHONE",  "+1 (872) 354-5706")
BANK_NAME    = os.getenv("BANK_NAME",    "Chase Bank")
BANK_ACCOUNT = os.getenv("BANK_ACCOUNT", "****1234")
BANK_ROUTING = os.getenv("BANK_ROUTING", "021000021")
BANK_HOLDER  = os.getenv("BANK_HOLDER",  "Safe Car LLC")

def get_stripe():
    key = os.getenv("STRIPE_SECRET_KEY", "")
    if not key:
        return None
    import stripe
    stripe.api_key = key
    return stripe

@router.post("/", response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate):
    if data.payment_method not in ("card", "bank_transfer", "zelle"):
        raise HTTPException(400, "Invalid payment_method")

    conn = get_connection()
    c = conn.cursor()
    total = 0.0
    items_data = []

    for item in data.items:
        c.execute("SELECT * FROM parts WHERE id = %s AND is_active = 1", (item.part_id,))
        part = c.fetchone()
        if not part:
            c.close(); conn.close()
            raise HTTPException(400, f"Part {item.part_id} not found")
        if part["stock"] < item.quantity:
            c.close(); conn.close()
            raise HTTPException(400, f"Not enough stock for '{part['name']}'")
        subtotal = part["price"] * item.quantity
        total += subtotal
        items_data.append({"part_id":item.part_id,"part_name":part["name"],"quantity":item.quantity,"unit_price":part["price"],"subtotal":subtotal})

    initial_status = "pending" if data.payment_method == "card" else "awaiting_verification"
    reference = generate_reference()

    c.execute("""
        INSERT INTO orders
          (reference, customer_name, customer_email, customer_phone,
           shipping_address, payment_method, payment_status, total)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
    """, (reference, data.customer_name, data.customer_email,
          data.customer_phone, data.shipping_address,
          data.payment_method, initial_status, round(total, 2)))
    order_id = c.fetchone()["id"]

    for it in items_data:
        c.execute("""
            INSERT INTO order_items (order_id, part_id, part_name, quantity, unit_price, subtotal)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (order_id, it["part_id"], it["part_name"], it["quantity"], it["unit_price"], it["subtotal"]))
        c.execute("UPDATE parts SET stock = stock - %s WHERE id = %s", (it["quantity"], it["part_id"]))

    conn.commit()
    result = _get_order(c, order_id)
    c.close(); conn.close()
    return result

@router.post("/payment-intent", response_model=CardIntentOut)
def create_payment_intent(data: CardIntentCreate):
    stripe = get_stripe()
    if not stripe:
        raise HTTPException(503, "Stripe not configured. Set STRIPE_SECRET_KEY.")

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders WHERE id = %s", (data.order_id,))
    order = c.fetchone()
    if not order:
        c.close(); conn.close()
        raise HTTPException(404, "Order not found")
    if order["payment_status"] == "paid":
        c.close(); conn.close()
        raise HTTPException(400, "Already paid")

    intent = stripe.PaymentIntent.create(
        amount=int(order["total"] * 100), currency="usd",
        payment_method_types=["card"],
        metadata={"order_id": str(order["id"]), "reference": order["reference"]},
    )

    c.execute("UPDATE orders SET stripe_payment_intent = %s WHERE id = %s", (intent.id, data.order_id))
    conn.commit()
    c.close(); conn.close()
    return {"client_secret":intent.client_secret,"order_id":data.order_id,"reference":order["reference"],"total":order["total"]}

@router.post("/webhook")
async def stripe_webhook(request: Request):
    stripe = get_stripe()
    if not stripe:
        raise HTTPException(503, "Stripe not configured")
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, os.getenv("STRIPE_WEBHOOK_SECRET",""))
    except Exception as e:
        raise HTTPException(400, str(e))

    conn = get_connection()
    c = conn.cursor()
    if event["type"] == "payment_intent.succeeded":
        order_id = event["data"]["object"]["metadata"].get("order_id")
        if order_id:
            c.execute("UPDATE orders SET payment_status = 'paid' WHERE id = %s", (int(order_id),))
            conn.commit()
    elif event["type"] == "payment_intent.payment_failed":
        order_id = event["data"]["object"]["metadata"].get("order_id")
        if order_id:
            c.execute("UPDATE orders SET payment_status = 'failed' WHERE id = %s", (int(order_id),))
            conn.commit()
    c.close(); conn.close()
    return {"received": True}

@router.get("/{order_id}/payment-instructions")
def get_payment_instructions(order_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
    order = c.fetchone()
    c.close(); conn.close()
    if not order:
        raise HTTPException(404, "Order not found")
    method = order["payment_method"]; ref = order["reference"]; total = order["total"]
    if method == "zelle":
        return {"method":"zelle","reference":ref,"total":total,"zelle_email":ZELLE_EMAIL,"zelle_phone":ZELLE_PHONE,
                "instructions":[f"Open Zelle and send ${total:.2f} to {ZELLE_EMAIL}",f"Reference: {ref}","Email screenshot to us","Confirmed within 2 hours"]}
    if method == "bank_transfer":
        return {"method":"bank_transfer","reference":ref,"total":total,"bank_name":BANK_NAME,"account":BANK_ACCOUNT,"routing":BANK_ROUTING,"holder":BANK_HOLDER,
                "instructions":[f"Wire ${total:.2f}",f"Bank: {BANK_NAME}",f"Holder: {BANK_HOLDER}",f"Routing: {BANK_ROUTING}",f"Account: {BANK_ACCOUNT}",f"Memo: {ref}","Email proof to payments@safecar.com"]}
    raise HTTPException(400, "Use /payment-intent for card payments")

@router.post("/{order_id}/confirm-manual")
def confirm_manual(order_id: int, data: TransferConfirmIn):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM orders WHERE id = %s", (order_id,))
    if not c.fetchone():
        c.close(); conn.close()
        raise HTTPException(404, "Order not found")
    c.execute("UPDATE orders SET payment_status='paid', confirmation_note=%s WHERE id=%s", (data.confirmation_note, order_id))
    conn.commit()
    c.close(); conn.close()
    return {"confirmed": True}

@router.get("/admin/all", response_model=List[OrderOut])
def list_orders(skip: int = 0, limit: int = 50):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM orders ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, skip))
    ids = [r["id"] for r in c.fetchall()]
    result = [_get_order(c, oid) for oid in ids]
    c.close(); conn.close()
    return result

@router.get("/{order_id}", response_model=OrderOut)
def get_order_endpoint(order_id: int):
    conn = get_connection()
    c = conn.cursor()
    result = _get_order(c, order_id)
    c.close(); conn.close()
    return result

def _get_order(c, order_id: int) -> dict:
    c.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
    order = c.fetchone()
    if not order:
        raise HTTPException(404, "Order not found")
    c.execute("SELECT * FROM order_items WHERE order_id = %s", (order_id,))
    items = c.fetchall()
    d = dict(order)
    d["items"] = [dict(i) for i in items]
    return d