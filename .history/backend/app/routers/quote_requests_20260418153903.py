from fastapi import APIRouter
from app.db import get_connection
from app.schemas import QuoteRequestCreate

router = APIRouter(prefix="/quote-requests", tags=["quote-requests"])

@router.post("")
def create_quote_request(payload: QuoteRequestCreate):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO quote_requests (name, phone, vehicle, issue) VALUES (?, ?, ?, ?)",
        (payload.name, payload.phone, payload.vehicle, payload.issue),
    )
    conn.commit()
    new_id = cur.lastrowid
    row = cur.execute(
        "SELECT id, name, phone, vehicle, issue, created_at FROM quote_requests WHERE id = ?",
        (new_id,),
    ).fetchone()
    conn.close()
    return dict(row)

@router.get("")
def list_quote_requests():
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, name, phone, vehicle, issue, created_at FROM quote_requests ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]