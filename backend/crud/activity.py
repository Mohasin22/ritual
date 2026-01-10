from sqlalchemy.orm import Session
from models import DailyActivity, Streak
from schemas import ActivityCreate
from crud.junk import get_max_allowed_junk
from utils.points import calculate_points
from utils.streaks import update_streak

def log_daily_activity(
    db: Session,
    user_id,
    data: ActivityCreate
):
    # Prevent duplicate entry
    existing = db.query(DailyActivity).filter_by(
        user_id=user_id,
        activity_date=data.activity_date
    ).first()

    if existing:
        raise ValueError("Activity already logged for this date")

    max_allowed = get_max_allowed_junk(
        db, user_id, data.junk_type
    )

    points = calculate_points(
        steps=data.steps,
        junk_quantity=data.junk_quantity,
        max_allowed=max_allowed
    )

    activity = DailyActivity(
        user_id=user_id,
        activity_date=data.activity_date,
        steps=data.steps,
        junk_type=data.junk_type,
        junk_quantity=data.junk_quantity,
        points=points
    )
    db.add(activity)

    streak = db.query(Streak).filter_by(
        user_id=user_id
    ).first()

    is_active = data.steps >= 5000 or data.junk_quantity <= max_allowed
    update_streak(streak, data.activity_date, is_active)

    db.commit()
    db.refresh(activity)

    return activity
