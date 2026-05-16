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
import os

app = FastAPI(title="Safe Car API", version="4.1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # debe ser False cuando allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files
static_dir = os.path.join(os.path.dirname(__file__), "static", "images")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static/images", StaticFiles(directory=static_dir), name="images")

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {"message": "Safe Car API v4.1.1 running"}

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(auth_router)
app.include_router(quote_router)
app.include_router(parts_router)
app.include_router(orders_router)
app.include_router(training_router)
app.include_router(upload_router)