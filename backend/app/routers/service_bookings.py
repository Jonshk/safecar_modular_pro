from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.db import get_connection, generate_reference
from app.routers.notifications import send_push_to_all_admins

router = APIRouter(prefix="/bookings", tags=["service_bookings"])

# ── Schemas ───────────────────────────────────────────────

SERVICE_TYPES = {
    "oil_change", "brake_service", "diagnostics",
    "tire_rotation", "general_repair", "tow_followup", "other"
}

class BookingCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    vehicle_make: Optional[str] = ""
    vehicle_model: Optional[str] = ""
    vehicle_year: Optional[str] = ""
    service_type: str
    preferred_date: str        # "2024-07-15"
    preferred_time: Optional[str] = ""
    notes: Optional[str] = ""

class BookingStatusUpdate(BaseModel):
    status: str               # pending | confirmed | in_progress | completed | cancelled
    admin_notes: Optional[str] = ""

class BookingOut(BaseModel):
    id: int
    reference: str
    customer_name: str
    customer_email: str
    customer_phone: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: str
    service_type: str
    preferred_date: str
    preferred_time: str
    notes: str
    status: str
    admin_notes: str
    created_at: str
    updated_at: str
    class Config:
        from_attributes = True

# ── Endpoints ─────────────────────────────────────────────

@router.post("/", response_model=BookingOut, status_code=201)
def create_booking(data: BookingCreate):
    if data.service_type not in SERVICE_TYPES:
        raise HTTPException(400, f"service_type debe ser uno de: {', '.join(SERVICE_TYPES)}")

    reference = generate_reference()
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO service_bookings
          (reference, customer_name, customer_email, customer_phone,
           vehicle_make, vehicle_model, vehicle_year,
           service_type, preferred_date, preferred_time, notes)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
    """, (
        reference, data.customer_name, data.customer_email, data.customer_phone,
        data.vehicle_make or "", data.vehicle_model or "", data.vehicle_year or "",
        data.service_type, data.preferred_date,
        data.preferred_time or "", data.notes or ""
    ))
    row_id = c.fetchone()["id"]
    conn.commit()
    result = _get_booking(c, row_id)
    c.close(); conn.close()

    # Notificar al admin
    service_label = _service_label(data.service_type)
    vehicle_str = f"{data.vehicle_year} {data.vehicle_make} {data.vehicle_model}".strip()
    send_push_to_all_admins(
        event_type="service_booking",
        reference_id=row_id,
        reference_code=reference,
        title=f"🔧 Nueva reserva: {service_label}",
        body=f"{data.customer_name} · {vehicle_str} · {data.preferred_date}"
    )
    return result

@router.get("/", response_model=List[BookingOut])
def list_bookings(skip: int = 0, limit: int = 50, status: Optional[str] = None):
    conn = get_connection()
    c = conn.cursor()
    if status:
        c.execute(
            "SELECT * FROM service_bookings WHERE status=%s ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (status, limit, skip)
        )
    else:
        c.execute("SELECT * FROM service_bookings ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, skip))
    rows = [dict(r) for r in c.fetchall()]
    c.close(); conn.close()
    return rows

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int):
    conn = get_connection()
    c = conn.cursor()
    result = _get_booking(c, booking_id)
    c.close(); conn.close()
    return result

@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(booking_id: int, data: BookingStatusUpdate):
    valid = {"pending", "confirmed", "in_progress", "completed", "cancelled"}
    if data.status not in valid:
        raise HTTPException(400, f"status debe ser uno de: {', '.join(valid)}")
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        """UPDATE service_bookings
           SET status=%s, admin_notes=%s,
               updated_at=to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
           WHERE id=%s""",
        (data.status, data.admin_notes or "", booking_id)
    )
    if c.rowcount == 0:
        c.close(); conn.close()
        raise HTTPException(404, "Reserva no encontrada")
    conn.commit()
    result = _get_booking(c, booking_id)
    c.close(); conn.close()
    return result

@router.delete("/{booking_id}")
def delete_booking(booking_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM service_bookings WHERE id=%s", (booking_id,))
    if c.rowcount == 0:
        c.close(); conn.close()
        raise HTTPException(404, "No encontrado")
    conn.commit()
    c.close(); conn.close()
    return {"deleted": True}

def _get_booking(c, booking_id: int) -> dict:
    c.execute("SELECT * FROM service_bookings WHERE id=%s", (booking_id,))
    row = c.fetchone()
    if not row:
        raise HTTPException(404, "Reserva no encontrada")
    return dict(row)

def _service_label(service_type: str) -> str:
    labels = {
        "oil_change": "Cambio de aceite",
        "brake_service": "Servicio de frenos",
        "diagnostics": "Diagnóstico",
        "tire_rotation": "Rotación de neumáticos",
        "general_repair": "Reparación general",
        "tow_followup": "Seguimiento de grúa",
        "other": "Otro servicio",
    }
    return labels.get(service_type, service_type)
