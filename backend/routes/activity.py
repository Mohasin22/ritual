from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from database import SessionLocal
from models.activity import DailyActivity
from routes.auth import get_current_user
from models.user import User
from models.junk import UserJunkLimit 

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


@router.get("/junk-limits")
def get_user_junk_limits(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    limits = (
        db.query(UserJunkLimit)
        .filter(UserJunkLimit.user_id == user.id)
        .all()
    )

    
    if not limits:
        defaults = [
            UserJunkLimit(user_id=user.id, junk_type="low", max_quantity=2),
            UserJunkLimit(user_id=user.id, junk_type="medium", max_quantity=1),
            UserJunkLimit(user_id=user.id, junk_type="high", max_quantity=1),
        ]
        db.add_all(defaults)
        db.commit()
        limits = defaults
    return {
        "limits": [
            {
                "junk_type": l.junk_type,
                "max_quantity": l.max_quantity,
            }
            for l in limits
        ]
    }
