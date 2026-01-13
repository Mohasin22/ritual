from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from database import SessionLocal
from models.activity import DailyActivity
from routes.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/activity", tags=["Activity"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/steps")
def submit_steps(
    steps: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if activity for today exists, update if so
    today = date.today()
    activity = db.query(DailyActivity).filter_by(user_id=user.id, activity_date=today).first()
    if activity:
        activity.steps = steps
    else:
        activity = DailyActivity(
            user_id=user.id,
            activity_date=today,
            steps=steps
        )
        db.add(activity)
    db.commit()
    db.refresh(activity)
    return {
        "message": "Steps saved",
        "steps": activity.steps,
        "date": activity.activity_date
    }
