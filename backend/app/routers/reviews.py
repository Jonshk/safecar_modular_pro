from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.db import get_connection, USE_POSTGRES
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/reviews", tags=["reviews"])
PH = "%s" if USE_POSTGRES else "?"

class ReviewCreate(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    rating: int  # 1-5
    comment: str
    service_type: Optional[str] = None  # parts, training, repair

class ReviewOut(BaseModel):
    id: int
    customer_name: str
    rating: int
    comment: str
    service_type: Optional[str]
    created_at: str
    is_approved: bool

    class Config:
        from_attributes = True

@router.post("/", response_model=ReviewOut, status_code=201)
def create_review(data: ReviewCreate):
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(400, "Rating must be between 1 and 5")
    if len(data.comment.strip()) < 10:
        raise HTTPException(400, "Comment too short")

    conn = get_connection()
    c = conn.cursor()

    if USE_POSTGRES:
        c.execute(f"""
            INSERT INTO reviews (customer_name, customer_email, rating, comment, service_type, is_approved)
            VALUES ({PH},{PH},{PH},{PH},{PH},{PH}) RETURNING *
        """, (data.customer_name, data.customer_email, data.rating,
              data.comment.strip(), data.service_type, False))
        row = c.fetchone()
    else:
        c.execute(f"""
            INSERT INTO reviews (customer_name, customer_email, rating, comment, service_type, is_approved)
            VALUES ({PH},{PH},{PH},{PH},{PH},{PH})
        """, (data.customer_name, data.customer_email, data.rating,
              data.comment.strip(), data.service_type, 0))
        c.execute(f"SELECT * FROM reviews WHERE id = {PH}", (c.lastrowid,))
        row = c.fetchone()

    conn.commit()
    c.close()
    conn.close()
    return dict(row)

@router.get("/", response_model=List[ReviewOut])
def list_reviews(skip: int = 0, limit: int = 20):
    conn = get_connection()
    c = conn.cursor()
    c.execute(f"""
        SELECT * FROM reviews WHERE is_approved = {'true' if USE_POSTGRES else '1'}
        ORDER BY created_at DESC LIMIT {PH} OFFSET {PH}
    """, (limit, skip))
    rows = c.fetchall()
    c.close()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/stats")
def review_stats():
    conn = get_connection()
    c = conn.cursor()
    c.execute(f"""
        SELECT COUNT(*) as total, AVG(rating) as avg_rating,
               SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
               SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
               SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
               SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
               SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM reviews WHERE is_approved = {'true' if USE_POSTGRES else '1'}
    """)
    row = c.fetchone()
    c.close()
    conn.close()
    d = dict(row)
    d['avg_rating'] = round(float(d['avg_rating'] or 0), 1)
    return d

# Admin endpoints
@router.get("/admin/pending")
def pending_reviews():
    conn = get_connection()
    c = conn.cursor()
    c.execute(f"SELECT * FROM reviews WHERE is_approved = {'false' if USE_POSTGRES else '0'} ORDER BY created_at DESC")
    rows = c.fetchall()
    c.close()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/admin/{review_id}/approve")
def approve_review(review_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute(f"UPDATE reviews SET is_approved = {'true' if USE_POSTGRES else '1'} WHERE id = {PH}", (review_id,))
    conn.commit()
    c.close()
    conn.close()
    return {"approved": True}

@router.delete("/admin/{review_id}")
def delete_review(review_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute(f"DELETE FROM reviews WHERE id = {PH}", (review_id,))
    conn.commit()
    c.close()
    conn.close()
    return {"deleted": True}