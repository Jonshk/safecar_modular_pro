from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.db import get_connection
from app.schemas import PartCreate, PartUpdate, PartOut
from datetime import datetime

router = APIRouter(prefix="/parts", tags=["parts"])

# ── PUBLIC: list active parts (catalog) ──────────────────
@router.get("/", response_model=List[PartOut])
def list_parts(
    category: Optional[str] = Query(None),
    search:   Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    in_stock:  Optional[bool] = Query(None),
    skip: int = 0,
    limit: int = 50,
):
    conn = get_connection()
    c = conn.cursor()

    query = "SELECT * FROM parts WHERE is_active = 1"
    params = []

    if category:
        query += " AND category = ?"
        params.append(category)
    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)"
        params += [f"%{search}%"] * 3
    if min_price is not None:
        query += " AND price >= ?"
        params.append(min_price)
    if max_price is not None:
        query += " AND price <= ?"
        params.append(max_price)
    if in_stock:
        query += " AND stock > 0"

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params += [limit, skip]

    rows = c.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── PUBLIC: get single part ───────────────────────────────
@router.get("/{part_id}", response_model=PartOut)
def get_part(part_id: int):
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM parts WHERE id = ? AND is_active = 1", (part_id,)
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Part not found")
    return dict(row)

# ── PUBLIC: list categories ───────────────────────────────
@router.get("/meta/categories")
def list_categories():
    conn = get_connection()
    rows = conn.execute(
        "SELECT DISTINCT category FROM parts WHERE is_active = 1 ORDER BY category"
    ).fetchall()
    conn.close()
    return [r["category"] for r in rows]

# ── ADMIN: create part ────────────────────────────────────
@router.post("/admin/create", response_model=PartOut, status_code=201)
def create_part(part: PartCreate):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO parts (name, description, category, brand, sku, price, stock,
                           image_url, compatible_vehicles, is_active)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    """, (
        part.name, part.description, part.category, part.brand, part.sku,
        part.price, part.stock, part.image_url, part.compatible_vehicles,
        int(part.is_active)
    ))
    conn.commit()
    row = conn.execute(
        "SELECT * FROM parts WHERE id = ?", (c.lastrowid,)
    ).fetchone()
    conn.close()
    return dict(row)

# ── ADMIN: update part ────────────────────────────────────
@router.patch("/admin/{part_id}", response_model=PartOut)
def update_part(part_id: int, data: PartUpdate):
    conn = get_connection()
    existing = conn.execute(
        "SELECT * FROM parts WHERE id = ?", (part_id,)
    ).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(404, "Part not found")

    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        conn.close()
        return dict(existing)

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [part_id]
    conn.execute(f"UPDATE parts SET {set_clause} WHERE id = ?", values)
    conn.commit()
    row = conn.execute("SELECT * FROM parts WHERE id = ?", (part_id,)).fetchone()
    conn.close()
    return dict(row)

# ── ADMIN: delete (soft) ──────────────────────────────────
@router.delete("/admin/{part_id}")
def delete_part(part_id: int):
    conn = get_connection()
    conn.execute("UPDATE parts SET is_active = 0 WHERE id = ?", (part_id,))
    conn.commit()
    conn.close()
    return {"deleted": True}