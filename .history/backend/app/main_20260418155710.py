from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db

# Routers
from app.routers.quote_requests import router as quote_router
from app.routers.parts import router as parts_router
from app.routers.orders import router as orders_router
from app.routers.training import router as training_router

# ⚠️ auth es opcional (lo protegemos)
try:
    from app.routers.auth import router as auth_router
    AUTH_AVAILABLE = True
except:
    AUTH_AVAILABLE = False


app = FastAPI(
    title="Safe Car API",
    version="4.1.0"
)

# 🔥 CORS CORREGIDO PARA PRODUCCIÓN
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # PRODUCCIÓN (IMPORTANTE)
        "https://autotecnicasafecar.com",
        "https://www.autotecnicasafecar.com",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 INIT DB
@app.on_event("startup")
def startup_event():
    init_db()


# 🔥 ROOT
@app.get("/")
def root():
    return {
        "message": "Safe Car API v4.1 running",
        "status": "ok"
    }


# 🔥 HEALTH CHECK (IMPORTANTE PARA RENDER)
@app.get("/health")
def health():
    return {"ok": True}


# 🔥 ROUTERS
app.include_router(quote_router)
app.include_router(parts_router)
app.include_router(orders_router)
app.include_router(training_router)

if AUTH_AVAILABLE:
    app.include_router(auth_router)