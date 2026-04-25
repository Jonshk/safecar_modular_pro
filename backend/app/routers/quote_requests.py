from fastapi import APIRouter
from app.db import get_connection
from app.schemas import QuoteRequestCreate

router = APIRouter(prefix="/quote-requests", tags=["quote-requests"])

@router.post("")
def create_quote_request(payload: QuoteRequestCreate):
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO quote_requests (name, phone, vehicle, issue) VALUES (%s, %s, %s, %s) RETURNING id, name, phone, vehicle, issue, created_at",
        (payload.name, payload.phone, payload.vehicle, payload.issue),
    )
    row = c.fetchone()
    conn.commit()
    c.close(); conn.close()
    return dict(row)

@router.get("")
def list_quote_requests():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, name, phone, vehicle, issue, created_at FROM quote_requests ORDER BY id DESC")
    rows = c.fetchall()
    c.close(); conn.close()
    return [dict(row) for row in rows]