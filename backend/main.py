from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models  # Import models to register them with Base
from routes.auth import router as auth_router
from routes.activity import router as activity_router

# -------------------------
# APP INIT
# -------------------------
app = FastAPI(title="Ritual")

# -------------------------
# CORS MIDDLEWARE
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

# -------------------------
# DATABASE INIT (SQLite)
# -------------------------
# This creates all tables on startup
Base.metadata.create_all(bind=engine)

# -------------------------
# ROUTES
# -------------------------
app.include_router(auth_router)
app.include_router(activity_router)

# -------------------------
# HEALTH CHECK
# -------------------------
@app.get("/health")
def health():
    return {"status": "ok"}
