from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.db import get_connection, generate_reference
from app.routers.notifications import send_push_to_all_admins, send_push_to_token

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
    fcm_token: Optional[str] = ""  # token del cliente, para poder notificarle cambios de estado

class TowStatusUpdate(BaseModel):
    status: str           # pending | confirmed | in_progress | completed | cancelled
    admin_notes: Optional[str] = ""

class TechnicianLocationUpdate(BaseModel):
    technician_lat: float
    technician_lng: float

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
    technician_lat: float
    technician_lng: float
    technician_updated_at: str
    created_at: str
    updated_at: str
    class Config:
        from_attributes = True

# Versión pública para /tow/track/{reference} — no expone el teléfono
# completo del cliente ni las notas internas del admin, solo lo que el
# cliente necesita ver de su propia solicitud.
class TowTrackOut(BaseModel):
    id: int
    reference: str
    customer_name: str
    vehicle_description: str
    pickup_address: str
    pickup_lat: float
    pickup_lng: float
    destination_address: str
    status: str
    technician_lat: float
    technician_lng: float
    technician_updated_at: str
    created_at: str
    updated_at: str
    class Config:
        from_attributes = True

# Labels que ve el cliente según el estado interno. "in_progress" en
# grúas se traduce como "En camino" (implica GPS), distinto de
# reservas/pedidos donde sería "En curso".
STATUS_LABELS_TOW = {
    "pending": "Solicitud recibida",
    "confirmed": "Confirmado, asignando técnico",
    "in_progress": "En camino hacia ti",
    "arrived":     "¡Tu técnico llegó!",
    "completed": "Servicio completado",
    "cancelled": "Cancelado",
}

# ── Endpoints ─────────────────────────────────────────────

@router.post("/", response_model=TowRequestOut, status_code=201)
def create_tow_request(data: TowRequestCreate):
    reference = generate_reference()
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO tow_requests
          (reference, customer_name, customer_phone, vehicle_description,
           pickup_address, pickup_lat, pickup_lng, destination_address, notes,
           fcm_token)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
    """, (
        reference, data.customer_name, data.customer_phone,
        data.vehicle_description, data.pickup_address,
        data.pickup_lat or 0.0, data.pickup_lng or 0.0,
        data.destination_address or "", data.notes or "",
        data.fcm_token or ""
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

# IMPORTANTE: esta ruta debe ir ANTES de "/{tow_id}" porque FastAPI
# resuelve las rutas en orden de declaración — si "/{tow_id}" fuera
# primero, "track" se interpretaría como un tow_id inválido.
@router.get("/track/{reference}", response_model=TowTrackOut)
def track_by_reference(reference: str):
    """Endpoint público (sin auth) para que el cliente consulte el
    estado de su solicitud con la referencia que recibió al crearla."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM tow_requests WHERE reference=%s", (reference,))
    row = c.fetchone()
    c.close(); conn.close()
    if not row:
        raise HTTPException(404, "No encontramos una solicitud con esa referencia")
    return dict(row)

@router.get("/{tow_id}", response_model=TowRequestOut)
def get_tow_request(tow_id: int):
    conn = get_connection()
    c = conn.cursor()
    result = _get_tow(c, tow_id)
    c.close(); conn.close()
    return result

@router.patch("/{tow_id}/status", response_model=TowRequestOut)
def update_tow_status(tow_id: int, data: TowStatusUpdate):
    valid = {"pending", "confirmed", "in_progress", "arrived", "completed", "cancelled"}
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

    # Notificar al cliente del cambio de estado, si tenemos su token.
    fcm_token = result.get("fcm_token") or ""
    if fcm_token:
        label = STATUS_LABELS_TOW.get(data.status, data.status)
        send_push_to_token(
            token=fcm_token,
            event_type="tow_status_update",
            title="Actualización de tu grúa",
            body=f"{label} · Ref: {result['reference']}",
            reference=result['reference'],
            status=data.status,
        )

    c.close(); conn.close()
    return result

import math

def _haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distancia en metros entre dos coordenadas GPS."""
    R = 6_371_000
    φ1, φ2 = math.radians(lat1), math.radians(lat2)
    dφ = math.radians(lat2 - lat1)
    dλ = math.radians(lng2 - lng1)
    a = math.sin(dφ/2)**2 + math.cos(φ1)*math.cos(φ2)*math.sin(dλ/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

@router.patch("/{tow_id}/location", response_model=TowRequestOut)
def update_technician_location(tow_id: int, data: TechnicianLocationUpdate):
    """Llamado por la app Admin cada ~30s mientras status=in_progress.
    Si el técnico está a menos de 75m del cliente, cambia automáticamente
    el estado a 'arrived' y manda push al cliente."""
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        """UPDATE tow_requests
           SET technician_lat=%s, technician_lng=%s,
               technician_updated_at=to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
           WHERE id=%s""",
        (data.technician_lat, data.technician_lng, tow_id)
    )
    if c.rowcount == 0:
        c.close(); conn.close()
        raise HTTPException(404, "Solicitud de grúa no encontrada")
    conn.commit()
    result = _get_tow(c, tow_id)

    # ── Detección automática de llegada ──────────────────────
    if result.get("status") == "in_progress":
        pick_lat = result.get("pickup_lat", 0) or 0
        pick_lng = result.get("pickup_lng", 0) or 0
        if pick_lat != 0 and pick_lng != 0:
            dist = _haversine_meters(
                data.technician_lat, data.technician_lng,
                pick_lat, pick_lng
            )
            if dist <= 75:
                c2 = conn.cursor()
                c2.execute(
                    """UPDATE tow_requests
                       SET status='arrived',
                           updated_at=to_char(now(),'YYYY-MM-DD HH24:MI:SS')
                       WHERE id=%s""",
                    (tow_id,)
                )
                conn.commit()
                result = _get_tow(c2, tow_id)
                # Push al cliente
                fcm_token = result.get("fcm_token", "")
                if fcm_token:
                    send_push_to_token(
                        token=fcm_token,
                        event_type="tow_status_update",
                        title="¡Tu técnico llegó!",
                        body=f"El técnico está en tu ubicación · Ref: {result['reference']}",
                        reference=result["reference"],
                        status="arrived",
                    )
                c2.close()

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