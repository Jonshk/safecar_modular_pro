from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.db import get_connection

router = APIRouter(prefix="/chat", tags=["chat"])

class MessageCreate(BaseModel):
    tow_id: int
    sender: str        # "client" | "technician"
    sender_name: str
    text: str

class MessageOut(BaseModel):
    id: int
    tow_id: int
    sender: str
    sender_name: str
    text: str
    created_at: str
    class Config:
        from_attributes = True

@router.post("/", response_model=MessageOut, status_code=201)
def send_message(data: MessageCreate):
    if not data.text.strip():
        raise HTTPException(400, "El mensaje no puede estar vacío")
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO tow_messages (tow_id, sender, sender_name, text)
        VALUES (%s, %s, %s, %s) RETURNING *
    """, (data.tow_id, data.sender, data.sender_name, data.text.strip()))
    row = dict(c.fetchone())
    conn.commit()
    c.close(); conn.close()
    return row

@router.get("/{tow_id}", response_model=List[MessageOut])
def get_messages(tow_id: int, after_id: int = 0):
    """
    Devuelve los mensajes de una grúa.
    Usa after_id para polling incremental — solo trae mensajes
    más nuevos que el último que el cliente ya tiene.
    """
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM tow_messages
        WHERE tow_id = %s AND id > %s
        ORDER BY id ASC
    """, (tow_id, after_id))
    rows = [dict(r) for r in c.fetchall()]
    c.close(); conn.close()
    return rows