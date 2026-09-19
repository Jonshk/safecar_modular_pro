from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ─── QUOTE REQUESTS ───────────────────────────────────────
class QuoteRequestCreate(BaseModel):
    name: str
    phone: str
    vehicle: str
    issue: str

class QuoteRequestOut(QuoteRequestCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# ─── PARTS ────────────────────────────────────────────────
class PartCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    category: str
    brand: Optional[str] = ""
    sku: Optional[str] = ""
    price: float
    stock: int = 0
    image_url: Optional[str] = ""
    compatible_vehicles: Optional[str] = ""
    is_active: bool = True

class PartUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    compatible_vehicles: Optional[str] = None
    is_active: Optional[bool] = None

class PartOut(PartCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# ─── ORDER ────────────────────────────────────────────────
class OrderItemIn(BaseModel):
    part_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    payment_method: str   # "card" | "bank_transfer" | "zelle"
    items: List[OrderItemIn]

class OrderItemOut(BaseModel):
    part_id: int
    part_name: str
    quantity: int
    unit_price: float
    subtotal: float
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    reference: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    payment_method: str
    payment_status: str
    total: float
    stripe_payment_intent: Optional[str] = None
    items: List[OrderItemOut]
    created_at: datetime
    class Config:
        from_attributes = True

# ─── PAYMENT ──────────────────────────────────────────────
class CardIntentCreate(BaseModel):
    order_id: int

class CardIntentOut(BaseModel):
    client_secret: str
    order_id: int
    reference: str
    total: float

class TransferConfirmIn(BaseModel):
    order_id: int
    confirmation_note: Optional[str] = ""