from fastapi import APIRouter
from app.db import get_connection, USE_POSTGRES
from app.schemas import QuoteRequestCreate

router = APIRouter(prefix="/quote-requests", tags=["quote-requests"])
PH = "%s" if USE_POSTGRES else "?"

@router.post("")
def create_quote_request(payload: QuoteRequestCreate):
    conn = get_connection(); c = conn.cursor()
    if USE_POSTGRES:
        c.execute(f"INSERT INTO quote_requests (name,phone,vehicle,issue) VALUES ({PH},{PH},{PH},{PH}) RETURNING id,name,phone,vehicle,issue,created_at",
            (payload.name,payload.phone,payload.vehicle,payload.issue))
        row = c.fetchone()
    else:
        c.execute(f"INSERT INTO quote_requests (name,phone,vehicle,issue) VALUES ({PH},{PH},{PH},{PH})",
            (payload.name,payload.phone,payload.vehicle,payload.issue))
        c.execute(f"SELECT id,name,phone,vehicle,issue,created_at FROM quote_requests WHERE id={PH}", (c.lastrowid,))
        row = c.fetchone()
    conn.commit(); c.close(); conn.close(); return dict(row)

@router.get("")
def list_quote_requests():
    conn = get_connection(); c = conn.cursor()
    c.execute("SELECT id,name,phone,vehicle,issue,created_at FROM quote_requests ORDER BY id DESC")
    rows = c.fetchall(); c.close(); conn.close(); return [dict(r) for r in rows]