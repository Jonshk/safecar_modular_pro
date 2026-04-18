from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt, os, hashlib

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

SECRET   = os.getenv("JWT_SECRET", "safecar-admin-secret-change-in-production")
ALGORITHM = "HS256"
EXPIRE_HOURS = 12

# Admin credentials from env (defaults for dev)
ADMIN_USER = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "safecar2024")

class LoginIn(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=EXPIRE_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except Exception:
        raise HTTPException(401, "Invalid token")

@router.post("/login", response_model=TokenOut)
def login(data: LoginIn):
    if data.username != ADMIN_USER or data.password != ADMIN_PASS:
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_token(data.username)}

@router.get("/me")
def me(user: str = Depends(verify_token)):
    return {"username": user}