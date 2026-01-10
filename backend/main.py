from fastapi import FastAPI

from database import Base, engine
from routes.auth import router as auth_router
from routes.activity import router as activity_router

# -------------------------
# APP INIT
# -------------------------
app = FastAPI(title="Ritual")

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
