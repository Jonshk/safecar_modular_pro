from fastapi import APIRouter, HTTPException, Request
from typing import List
from app.db import get_connection, generate_reference
from app.schemas import OrderCreate, OrderOut, CardIntentCreate, CardIntentOut, TransferConfirmIn
import os

router = APIRouter(prefix="/orders", tags=["orders"])

ZELLE_EMAIL   = os.getenv("ZELLE_EMAIL",   "payments@safecar.com")
ZELLE_PHONE   = os.getenv("ZELLE_PHONE",   "+1 (872) 354-5706")
BANK_NAME     = os.getenv("BANK_NAME",     "Chase Bank")
BANK_ACCOUNT  = os.getenv("BANK_ACCOUNT",  "****1234")
BANK_ROUTING  = os.getenv("BANK_ROUTING",  "021000021")
BANK_HOLDER   = os.getenv("BANK_HOLDER",   "Safe Car LLC")

def get_stripe():
    key = os.getenv("STRIPE_SECRET_KEY", "")
    if not key:
        return None
    import stripe
    stripe.api_key = key
    return stripe

# ── Create order ──────────────────────────────────────────
@router.post("/", response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate):
    if data.payment_method not in ("card", "bank_transfer", "zelle"):
        raise HTTPException(400, "Invalid payment_method")

    conn = get_connection()
    c = conn.cursor()
    total = 0.0
    items_data = []

    for item in data.items:
        part = conn.execute(
            "SELECT * FROM parts WHERE id = ? AND is_active = 1", (item.part_id,)
        ).fetchone()
        if not part:
            conn.close()
            raise HTTPException(400, f"Part {item.part_id} not found")
        if part["stock"] < item.quantity:
            conn.close()
            raise HTTPException(400, f"Not enough stock for '{part['name']}'")
        subtotal = part["price"] * item.quantity
        total += subtotal
        items_data.append({
            "part_id":    item.part_id,
            "part_name":  part["name"],
            "quantity":   item.quantity,
            "unit_price": part["price"],
            "subtotal":   subtotal,
        })

    # Initial status depends on method
    initial_status = "pending" if data.payment_method == "card" else "awaiting_verification"
    reference = generate_reference()

    c.execute("""
        INSERT INTO orders
          (reference, customer_name, customer_email, customer_phone,
           shipping_address, payment_method, payment_status, total)
        VALUES (?,?,?,?,?,?,?,?)
    """, (
        reference, data.customer_name, data.customer_email,
        data.customer_phone, data.shipping_address,
        data.payment_method, initial_status, round(total, 2)
    ))
    order_id = c.lastrowid

    for it in items_data:
        c.execute("""
            INSERT INTO order_items
              (order_id, part_id, part_name, quantity, unit_price, subtotal)
            VALUES (?,?,?,?,?,?)
        """, (order_id, it["part_id"], it["part_name"],
              it["quantity"], it["unit_price"], it["subtotal"]))
        c.execute(
            "UPDATE parts SET stock = stock - ? WHERE id = ?",
            (it["quantity"], it["part_id"])
        )

    conn.commit()
    return _get_order(conn, order_id)

# ── Stripe: create payment intent (card / Apple Pay / Google Pay) ──
@router.post("/payment-intent", response_model=CardIntentOut)
def create_payment_intent(data: CardIntentCreate):
    stripe = get_stripe()
    if not stripe:
        raise HTTPException(503, "Stripe not configured. Set STRIPE_SECRET_KEY.")

    conn = get_connection()
    order = conn.execute(
        "SELECT * FROM orders WHERE id = ?", (data.order_id,)
    ).fetchone()
    conn.close()

    if not order:
        raise HTTPException(404, "Order not found")
    if order["payment_status"] == "paid":
        raise HTTPException(400, "Already paid")
    if order["payment_method"] != "card":
        raise HTTPException(400, "Order payment method is not card")

    intent = stripe.PaymentIntent.create(
        amount=int(order["total"] * 100),
        currency="usd",
        payment_method_types=["card"],
        metadata={
            "order_id":  str(order["id"]),
            "reference": order["reference"],
        },
    )

    conn = get_connection()
    conn.execute(
        "UPDATE orders SET stripe_payment_intent = ? WHERE id = ?",
        (intent.id, data.order_id)
    )
    conn.commit()
    conn.close()

    return {
        "client_secret": intent.client_secret,
        "order_id":      data.order_id,
        "reference":     order["reference"],
        "total":         order["total"],
    }

# ── Stripe webhook ─────────────────────────────────────────
@router.post("/webhook")
async def stripe_webhook(request: Request):
    stripe = get_stripe()
    if not stripe:
        raise HTTPException(503, "Stripe not configured")

    payload = await request.body()
    sig     = request.headers.get("stripe-signature", "")
    secret  = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig, secret)
    except Exception as e:
        raise HTTPException(400, str(e))

    if event["type"] == "payment_intent.succeeded":
        pi = event["data"]["object"]
        order_id = pi["metadata"].get("order_id")
        if order_id:
            conn = get_connection()
            conn.execute(
                "UPDATE orders SET payment_status = 'paid' WHERE id = ?",
                (int(order_id),)
            )
            conn.commit()
            conn.close()

    elif event["type"] == "payment_intent.payment_failed":
        pi = event["data"]["object"]
        order_id = pi["metadata"].get("order_id")
        if order_id:
            conn = get_connection()
            conn.execute(
                "UPDATE orders SET payment_status = 'failed' WHERE id = ?",
                (int(order_id),)
            )
            conn.commit()
            conn.close()

    return {"received": True}

# ── Get payment instructions (bank / Zelle) ────────────────
@router.get("/{order_id}/payment-instructions")
def get_payment_instructions(order_id: int):
    conn = get_connection()
    order = conn.execute(
        "SELECT * FROM orders WHERE id = ?", (order_id,)
    ).fetchone()
    conn.close()

    if not order:
        raise HTTPException(404, "Order not found")

    method = order["payment_method"]
    ref    = order["reference"]
    total  = order["total"]

    if method == "zelle":
        return {
            "method":    "zelle",
            "reference": ref,
            "total":     total,
            "zelle_email": ZELLE_EMAIL,
            "zelle_phone": ZELLE_PHONE,
            "instructions": [
                f"Open your bank app and go to Zelle",
                f"Send ${total:.2f} to {ZELLE_EMAIL} or {ZELLE_PHONE}",
                f"Use reference code: {ref}",
                "Take a screenshot and email it to us",
                "Your order will be confirmed within 2 hours",
            ],
        }

    if method == "bank_transfer":
        return {
            "method":      "bank_transfer",
            "reference":   ref,
            "total":       total,
            "bank_name":   BANK_NAME,
            "account":     BANK_ACCOUNT,
            "routing":     BANK_ROUTING,
            "holder":      BANK_HOLDER,
            "instructions": [
                f"Make a wire/ACH transfer of ${total:.2f}",
                f"Bank: {BANK_NAME}",
                f"Account holder: {BANK_HOLDER}",
                f"Routing number: {BANK_ROUTING}",
                f"Account number: {BANK_ACCOUNT}",
                f"Memo / Reference: {ref}",
                "Send proof of transfer to payments@safecar.com",
                "Allow 1–2 business days for confirmation",
            ],
        }

    raise HTTPException(400, "Use /payment-intent for card payments")

# ── Admin: confirm manual payment ─────────────────────────
@router.post("/{order_id}/confirm-manual")
def confirm_manual(order_id: int, data: TransferConfirmIn):
    conn = get_connection()
    order = conn.execute(
        "SELECT * FROM orders WHERE id = ?", (order_id,)
    ).fetchone()
    if not order:
        conn.close()
        raise HTTPException(404, "Order not found")

    conn.execute("""
        UPDATE orders
        SET payment_status = 'paid',
            confirmation_note = ?
        WHERE id = ?
    """, (data.confirmation_note, order_id))
    conn.commit()
    conn.close()
    return {"confirmed": True}

# ── Admin: list all orders ─────────────────────────────────
@router.get("/admin/all", response_model=List[OrderOut])
def list_orders(skip: int = 0, limit: int = 50):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (limit, skip)
    ).fetchall()
    result = [_get_order(conn, r["id"]) for r in rows]
    conn.close()
    return result

# ── Get single order ───────────────────────────────────────
@router.get("/{order_id}", response_model=OrderOut)
def get_order_endpoint(order_id: int):
    conn = get_connection()
    order = _get_order(conn, order_id)
    conn.close()
    return order

def _get_order(conn, order_id: int) -> dict:
    order = conn.execute(
        "SELECT * FROM orders WHERE id = ?", (order_id,)
    ).fetchone()
    if not order:
        raise HTTPException(404, "Order not found")
    items = conn.execute(
        "SELECT * FROM order_items WHERE order_id = ?", (order_id,)
    ).fetchall()
    d = dict(order)
    d["items"] = [dict(i) for i in items]
    return d