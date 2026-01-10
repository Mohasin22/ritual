from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.activity import router as activity_router

app = FastAPI(title="ritual")

app.include_router(auth_router)
app.include_router(activity_router)

@app.get("/health")
def health():
    return {"status": "ok"}
