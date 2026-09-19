from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional
from app.db import get_connection, generate_reference
from pydantic import BaseModel
import os

router = APIRouter(prefix="/training", tags=["training"])

class ModuleCreate(BaseModel):
    title: str
    title_es: str
    description: str
    description_es: str
    duration_weeks: int
    price: float
    mode: str = "hybrid"
    max_students: int = 20
    schedule: Optional[str] = ""
    image_url: Optional[str] = ""
    is_active: bool = True
    sort_order: int = 0

class ModuleOut(ModuleCreate):
    id: int
    enrolled_count: int = 0
    created_at: str
    class Config:
        from_attributes = True

class EnrollmentCreate(BaseModel):
    module_id: int
    student_name: str
    student_email: str
    student_phone: str
    payment_method: str

class EnrollmentOut(BaseModel):
    id: int
    reference: str
    module_id: int
    module_title: str
    student_name: str
    student_email: str
    student_phone: str
    payment_method: str
    payment_status: str
    amount: float
    stripe_payment_intent: Optional[str] = None
    created_at: str
    class Config:
        from_attributes = True

class StudentPortalIn(BaseModel):
    email: str
    reference: str

@router.get("/modules", response_model=List[ModuleOut])
def list_modules():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT m.*, COUNT(e.id) as enrolled_count
        FROM training_modules m
        LEFT JOIN enrollments e ON e.module_id = m.id AND e.payment_status = 'paid'
        WHERE m.is_active = 1
        GROUP BY m.id
        ORDER BY m.sort_order, m.id
    """)
    rows = c.fetchall()
    c.close(); conn.close()
    return [dict(r) for r in rows]

@router.get("/modules/{module_id}", response_model=ModuleOut)
def get_module(module_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT m.*, COUNT(e.id) as enrolled_count
        FROM training_modules m
        LEFT JOIN enrollments e ON e.module_id = m.id AND e.payment_status = 'paid'
        WHERE m.id = %s AND m.is_active = 1
        GROUP BY m.id
    """, (module_id,))
    row = c.fetchone()
    c.close(); conn.close()
    if not row:
        raise HTTPException(404, "Module not found")
    return dict(row)

@router.post("/enroll", response_model=EnrollmentOut, status_code=201)
def enroll(data: EnrollmentCreate):
    if data.payment_method not in ("card", "zelle", "bank_transfer"):
        raise HTTPException(400, "Invalid payment_method")

    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM training_modules WHERE id = %s AND is_active = 1", (data.module_id,))
    module = c.fetchone()
    if not module:
        c.close(); conn.close()
        raise HTTPException(404, "Module not found")

    c.execute("""
        SELECT id FROM enrollments
        WHERE module_id = %s AND student_email = %s
        AND payment_status IN ('paid','awaiting_verification','pending')
    """, (data.module_id, data.student_email))
    if c.fetchone():
        c.close(); conn.close()
        raise HTTPException(400, "Already enrolled in this module")

    c.execute("SELECT COUNT(*) as cnt FROM enrollments WHERE module_id = %s AND payment_status = 'paid'", (data.module_id,))
    if c.fetchone()["cnt"] >= module["max_students"]:
        c.close(); conn.close()
        raise HTTPException(400, "Module is full")

    initial_status = "pending" if data.payment_method == "card" else "awaiting_verification"
    reference = generate_reference()

    c.execute("""
        INSERT INTO enrollments
          (reference, module_id, module_title, student_name, student_email,
           student_phone, payment_method, payment_status, amount)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *
    """, (reference, data.module_id, module["title"],
          data.student_name, data.student_email, data.student_phone,
          data.payment_method, initial_status, module["price"]))
    row = c.fetchone()
    conn.commit()
    c.close(); conn.close()
    return dict(row)

@router.post("/enroll/{enrollment_id}/payment-intent")
def create_enrollment_payment_intent(enrollment_id: int):
    key = os.getenv("STRIPE_SECRET_KEY", "")
    if not key:
        raise HTTPException(503, "Stripe not configured")
    import stripe
    stripe.api_key = key

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM enrollments WHERE id = %s", (enrollment_id,))
    e = c.fetchone()
    c.close(); conn.close()
    if not e:
        raise HTTPException(404, "Enrollment not found")
    if e["payment_status"] == "paid":
        raise HTTPException(400, "Already paid")

    intent = stripe.PaymentIntent.create(
        amount=int(e["amount"] * 100), currency="usd",
        metadata={"enrollment_id": str(enrollment_id), "reference": e["reference"]},
    )

    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE enrollments SET stripe_payment_intent = %s WHERE id = %s", (intent.id, enrollment_id))
    conn.commit()
    c.close(); conn.close()
    return {"client_secret": intent.client_secret, "enrollment_id": enrollment_id, "reference": e["reference"], "total": e["amount"]}

@router.get("/enroll/{enrollment_id}/payment-instructions")
def enrollment_payment_instructions(enrollment_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM enrollments WHERE id = %s", (enrollment_id,))
    e = c.fetchone()
    c.close(); conn.close()
    if not e:
        raise HTTPException(404, "Enrollment not found")
    ref = e["reference"]; total = e["amount"]
    if e["payment_method"] == "zelle":
        return {"method":"zelle","reference":ref,"total":total,
                "zelle_email":os.getenv("ZELLE_EMAIL","payments@safecar.com"),
                "zelle_phone":os.getenv("ZELLE_PHONE","+1 (872) 354-5706"),
                "instructions":[f"Send ${total:.2f} to {os.getenv('ZELLE_EMAIL','payments@safecar.com')}",f"Use reference: {ref}","Take a screenshot and email it to us"]}
    return {"method":"bank_transfer","reference":ref,"total":total,
            "bank_name":os.getenv("BANK_NAME","Chase Bank"),
            "account":os.getenv("BANK_ACCOUNT","****1234"),
            "routing":os.getenv("BANK_ROUTING","021000021"),
            "holder":os.getenv("BANK_HOLDER","Safe Car LLC"),
            "instructions":[f"Wire ${total:.2f}",f"Memo: {ref}","Email proof to payments@safecar.com"]}

@router.post("/webhook")
async def training_webhook(request: Request):
    key = os.getenv("STRIPE_SECRET_KEY", "")
    if not key:
        raise HTTPException(503, "Stripe not configured")
    import stripe
    stripe.api_key = key
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, os.getenv("STRIPE_WEBHOOK_SECRET",""))
    except Exception as e:
        raise HTTPException(400, str(e))
    if event["type"] == "payment_intent.succeeded":
        eid = event["data"]["object"]["metadata"].get("enrollment_id")
        if eid:
            conn = get_connection()
            c = conn.cursor()
            c.execute("UPDATE enrollments SET payment_status = 'paid' WHERE id = %s", (int(eid),))
            conn.commit()
            c.close(); conn.close()
    return {"received": True}

@router.post("/portal")
def student_portal(data: StudentPortalIn):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT e.*, m.title, m.title_es, m.description, m.description_es, m.schedule, m.mode, m.duration_weeks
        FROM enrollments e
        JOIN training_modules m ON m.id = e.module_id
        WHERE e.student_email = %s AND e.reference = %s
    """, (data.email, data.reference))
    rows = c.fetchall()
    c.close(); conn.close()
    if not rows:
        raise HTTPException(404, "No enrollment found with those credentials")
    row = dict(rows[0])
    if row["payment_status"] != "paid":
        return {"access":False,"status":row["payment_status"],"message":"Payment pending."}
    return {"access":True,"student_name":row["student_name"],"module_title":row["title"],
            "schedule":row["schedule"],"mode":row["mode"],"duration_weeks":row["duration_weeks"],"reference":row["reference"]}

@router.post("/admin/modules", response_model=ModuleOut, status_code=201)
def create_module(m: ModuleCreate):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO training_modules
          (title, title_es, description, description_es, duration_weeks,
           price, mode, max_students, schedule, image_url, is_active, sort_order)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *
    """, (m.title, m.title_es, m.description, m.description_es, m.duration_weeks,
          m.price, m.mode, m.max_students, m.schedule, m.image_url, int(m.is_active), m.sort_order))
    new_id = c.fetchone()["id"]
    conn.commit()
    c.execute("SELECT m.*, 0 as enrolled_count FROM training_modules m WHERE m.id = %s", (new_id,))
    row = c.fetchone()
    c.close(); conn.close()
    return dict(row)

@router.patch("/admin/modules/{module_id}")
def update_module(module_id: int, data: dict):
    conn = get_connection()
    c = conn.cursor()
    allowed = {"title","title_es","description","description_es","duration_weeks",
               "price","mode","max_students","schedule","image_url","is_active","sort_order"}
    updates = {k: v for k, v in data.items() if k in allowed}
    if updates:
        set_clause = ", ".join(f"{k}=%s" for k in updates)
        c.execute(f"UPDATE training_modules SET {set_clause} WHERE id=%s", list(updates.values()) + [module_id])
        conn.commit()
    c.close(); conn.close()
    return {"updated": True}

@router.delete("/admin/modules/{module_id}", status_code=204)
def delete_module(module_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM training_modules WHERE id = %s", (module_id,))
    conn.commit()
    c.close(); conn.close()

@router.get("/admin/enrollments")
def list_enrollments(skip: int = 0, limit: int = 100):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM enrollments ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, skip))
    rows = c.fetchall()
    c.close(); conn.close()
    return [dict(r) for r in rows]

@router.post("/admin/enrollments/{enrollment_id}/confirm")
def confirm_enrollment(enrollment_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE enrollments SET payment_status='paid' WHERE id=%s", (enrollment_id,))
    conn.commit()
    c.close(); conn.close()
    return {"confirmed": True}