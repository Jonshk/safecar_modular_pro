from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db import init_db
from app.routers.quote_requests import router as quote_router
from app.routers.parts import router as parts_router
from app.routers.orders import router as orders_router
from app.routers.training import router as training_router
from app.routers.auth import router as auth_router
from app.routers.upload import router as upload_router
# ── Nuevos routers ────────────────────────────────────────
from app.routers.tow_requests import router as tow_router
from app.routers.service_bookings import router as bookings_router
from app.routers.notifications import router as notifications_router
# ── Migración temporal (BORRAR después de usarla una vez) ──
from app.routers.admin_migrate import router as admin_migrate_router
import os

app = FastAPI(title="Safe Car API", version="5.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(__file__), "static", "images")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static/images", StaticFiles(directory=static_dir), name="images")

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {"message": "Safe Car API v5.0.0 running"}

@app.get("/health")
def health():
    return {"ok": True}

# ── Routers existentes ────────────────────────────────────
app.include_router(auth_router)
app.include_router(quote_router)
app.include_router(parts_router)
app.include_router(orders_router)
app.include_router(training_router)
app.include_router(upload_router)

# ── Routers nuevos ────────────────────────────────────────
app.include_router(tow_router)
app.include_router(bookings_router)
app.include_router(notifications_router)

# ── Migración temporal (BORRAR después de usarla una vez) ──
app.include_router(admin_migrate_router)