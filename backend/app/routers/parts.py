from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.db import get_connection
from app.schemas import PartCreate, PartUpdate, PartOut

router = APIRouter(prefix="/parts", tags=["parts"])

@router.get("/meta/categories")
def list_categories():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT DISTINCT category FROM parts WHERE is_active = 1 ORDER BY category")
    rows = c.fetchall()
    c.close(); conn.close()
    return [r["category"] for r in rows]

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
        query += " AND category = %s"
        params.append(category)
    if search:
        query += " AND (name ILIKE %s OR description ILIKE %s OR brand ILIKE %s)"
        params += [f"%{search}%"] * 3
    if min_price is not None:
        query += " AND price >= %s"
        params.append(min_price)
    if max_price is not None:
        query += " AND price <= %s"
        params.append(max_price)
    if in_stock:
        query += " AND stock > 0"

    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params += [limit, skip]

    c.execute(query, params)
    rows = c.fetchall()
    c.close(); conn.close()
    return [dict(r) for r in rows]

@router.get("/{part_id}", response_model=PartOut)
def get_part(part_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM parts WHERE id = %s AND is_active = 1", (part_id,))
    row = c.fetchone()
    c.close(); conn.close()
    if not row:
        raise HTTPException(404, "Part not found")
    return dict(row)

@router.post("/admin/create", response_model=PartOut, status_code=201)
def create_part(part: PartCreate):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO parts (name, description, category, brand, sku, price, stock,
                           image_url, compatible_vehicles, is_active)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *
    """, (
        part.name, part.description, part.category, part.brand, part.sku,
        part.price, part.stock, part.image_url, part.compatible_vehicles,
        int(part.is_active)
    ))
    row = c.fetchone()
    conn.commit()
    c.close(); conn.close()
    return dict(row)

@router.patch("/admin/{part_id}", response_model=PartOut)
def update_part(part_id: int, data: PartUpdate):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM parts WHERE id = %s", (part_id,))
    existing = c.fetchone()
    if not existing:
        c.close(); conn.close()
        raise HTTPException(404, "Part not found")

    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        c.close(); conn.close()
        return dict(existing)

    # PostgreSQL integer columns don't accept Python booleans
    if "is_active" in updates:
        updates["is_active"] = int(updates["is_active"])

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [part_id]
    c.execute(f"UPDATE parts SET {set_clause} WHERE id = %s RETURNING *", values)
    row = c.fetchone()
    conn.commit()
    c.close(); conn.close()
    return dict(row)

@router.delete("/admin/{part_id}")
def delete_part(part_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE parts SET is_active = 0 WHERE id = %s", (part_id,))
    conn.commit()
    c.close(); conn.close()
    return {"deleted": True}