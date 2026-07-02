from fastapi import APIRouter
from app.db import get_connection

router = APIRouter(prefix="/admin-migrate", tags=["admin_migrate"])

@router.get("/run-chat-table")
def run_chat_migration():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS tow_messages (
            id SERIAL PRIMARY KEY,
            tow_id INTEGER NOT NULL,
            sender TEXT NOT NULL,
            sender_name TEXT NOT NULL DEFAULT '',
            text TEXT NOT NULL,
            created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
        )
    """)
    conn.commit()
    c.close(); conn.close()
    return {"ok": True, "message": "Tabla tow_messages creada (o ya existía)."}