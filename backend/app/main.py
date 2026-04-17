from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routers.quote_requests import router as quote_router
from app.routers.parts    import router as parts_router
from app.routers.orders   import router as orders_router
from app.routers.training import router as training_router
from app.routers.auth     import router as auth_router

app = FastAPI(title="Safe Car API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {"message": "Safe Car API v4.0 running"}

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(auth_router)
app.include_router(quote_router)
app.include_router(parts_router)
app.include_router(orders_router)
app.include_router(training_router)