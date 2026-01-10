from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from database import SessionLocal
from schemas import ActivityCreate
from crud.activity import log_daily_activity

router = APIRouter(prefix="/activity")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/log")
def log_activity(user_id: UUID, data: ActivityCreate, db: Session = Depends(get_db)):
    try:
        activity = log_daily_activity(db, user_id, data)
    except ValueError as e:
        raise HTTPException(400, str(e))

    return {"points": activity.points}
