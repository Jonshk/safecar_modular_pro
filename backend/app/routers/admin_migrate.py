"""
Router TEMPORAL para correr la migración de columnas de tracking sin
necesitar el Shell pago de Render. Es seguro porque usa "IF NOT EXISTS"
en cada columna — si lo visitas dos veces por accidente, no rompe nada.

IMPORTANTE: después de usarlo UNA VEZ, borra este archivo y quítalo
del import en main.py, para no dejar un endpoint abierto sin uso.
"""
from fastapi import APIRouter
from app.db import get_connection

router = APIRouter(prefix="/admin-migrate", tags=["admin_migrate"])

@router.get("/run-tow-tracking-columns")
def run_migration():
    conn = get_connection()
    c = conn.cursor()
    statements = [
        "ALTER TABLE tow_requests ADD COLUMN IF NOT EXISTS fcm_token TEXT DEFAULT ''",
        "ALTER TABLE tow_requests ADD COLUMN IF NOT EXISTS technician_lat DOUBLE PRECISION DEFAULT 0",
        "ALTER TABLE tow_requests ADD COLUMN IF NOT EXISTS technician_lng DOUBLE PRECISION DEFAULT 0",
        "ALTER TABLE tow_requests ADD COLUMN IF NOT EXISTS technician_updated_at TEXT DEFAULT ''",
    ]
    for stmt in statements:
        c.execute(stmt)
    conn.commit()
    c.close(); conn.close()
    return {"ok": True, "message": "Columnas agregadas (o ya existían). Ahora borra este archivo."}