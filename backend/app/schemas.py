from pydantic import BaseModel

class QuoteRequestIn(BaseModel):
    name: str
    phone: str
    vehicle: str
    issue: str
