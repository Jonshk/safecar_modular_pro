from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.db import get_connection, generate_reference
from app.routers.notifications import send_push_to_all_admins

router = APIRouter(prefix="/tow", tags=["tow_requests"])

# ── Schemas ───────────────────────────────────────────────

class TowRequestCreate(BaseModel):
    customer_name: str
    customer_phone: str
    vehicle_description: str
    pickup_address: str
    pickup_lat: Optional[float] = 0.0
    pickup_lng: Optional[float] = 0.0
    destination_address: Optional[str] = ""
    notes: Optional[str] = ""

class TowStatusUpdate(BaseModel):
    status: str           # pending | confirmed | in_progress | completed | cancelled
    admin_notes: Optional[str] = ""

class TowRequestOut(BaseModel):
    id: int
    reference: str
    customer_name: str
    customer_phone: str
    vehicle_description: str
    pickup_address: str
    pickup_lat: float
    pickup_lng: float
    destination_address: str
    notes: str
    status: str
    admin_notes: str
    created_at: str
    updated_at: str
    class Config:
        from_attributes = True

# ── Endpoints ─────────────────────────────────────────────

@router.post("/", response_model=TowRequestOut, status_code=201)
def create_tow_request(data: TowRequestCreate):
    reference = generate_reference()
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO tow_requests
          (reference, customer_name, customer_phone, vehicle_description,
           pickup_address, pickup_lat, pickup_lng, destination_address, notes)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
    """, (
        reference, data.customer_name, data.customer_phone,
        data.vehicle_description, data.pickup_address,
        data.pickup_lat or 0.0, data.pickup_lng or 0.0,
        data.destination_address or "", data.notes or ""
    ))
    row_id = c.fetchone()["id"]
    conn.commit()
    result = _get_tow(c, row_id)
    c.close(); conn.close()

    # Notificar al admin
    send_push_to_all_admins(
        event_type="tow_request",
        reference_id=row_id,
        reference_code=reference,
        title="🚛 Nueva solicitud de grúa",
        body=f"{data.customer_name} · {data.vehicle_description} · {data.pickup_address}"
    )
    return result

@router.get("/", response_model=List[TowRequestOut])
def list_tow_requests(skip: int = 0, limit: int = 50, status: Optional[str] = None):
    conn = get_connection()
    c = conn.cursor()
    if status:
        c.execute(
            "SELECT * FROM tow_requests WHERE status=%s ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (status, limit, skip)
        )
    else:
        c.execute("SELECT * FROM tow_requests ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, skip))
    rows = [dict(r) for r in c.fetchall()]
    c.close(); conn.close()
    return rows

@router.get("/{tow_id}", response_model=TowRequestOut)
def get_tow_request(tow_id: int):
    conn = get_connection()
    c = conn.cursor()
    result = _get_tow(c, tow_id)
    c.close(); conn.close()
    return result

@router.patch("/{tow_id}/status", response_model=TowRequestOut)
def update_tow_status(tow_id: int, data: TowStatusUpdate):
    valid = {"pending", "confirmed", "in_progress", "completed", "cancelled"}
    if data.status not in valid:
        raise HTTPException(400, f"status debe ser uno de: {', '.join(valid)}")
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        """UPDATE tow_requests
           SET status=%s, admin_notes=%s,
               updated_at=to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
           WHERE id=%s""",
        (data.status, data.admin_notes or "", tow_id)
    )
    if c.rowcount == 0:
        c.close(); conn.close()
        raise HTTPException(404, "Solicitud de grúa no encontrada")
    conn.commit()
    result = _get_tow(c, tow_id)
    c.close(); conn.close()
    return result

@router.delete("/{tow_id}")
def delete_tow_request(tow_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM tow_requests WHERE id=%s", (tow_id,))
    if c.rowcount == 0:
        c.close(); conn.close()
        raise HTTPException(404, "No encontrado")
    conn.commit()
    c.close(); conn.close()
    return {"deleted": True}

def _get_tow(c, tow_id: int) -> dict:
    c.execute("SELECT * FROM tow_requests WHERE id=%s", (tow_id,))
    row = c.fetchone()
    if not row:
        raise HTTPException(404, "Solicitud de grúa no encontrada")
    return dict(row)
