from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from database import SessionLocal
from models import DailyActivity

router = APIRouter(prefix="/activity", tags=["Activity"])

# TEMP user_id (REMOVE LATER)
TEMP_USER_ID = "temp-user-001"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/steps")
def submit_steps(
    steps: int,
    db: Session = Depends(get_db)
):
    activity = DailyActivity(
        user_id=TEMP_USER_ID,
        activity_date=date.today(),
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
