from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import WorkoutPlan, User
from schemas import WorkoutPlanUpdate, WorkoutPlanResponse
from routes.auth import get_current_user

router = APIRouter(prefix="/user", tags=["User"])

# -------------------------
# DB DEPENDENCY
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# GET WORKOUT PLAN
# -------------------------
@router.get("/workout-plan", response_model=WorkoutPlanResponse)
def get_workout_plan(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == user.id
    ).first()

    if not plan:
        return {"workout_plan": {}}

    return {"workout_plan": plan.plan}

# -------------------------
# SAVE / UPDATE WORKOUT PLAN
# -------------------------
@router.put("/workout-plan")
def save_workout_plan(
    data: WorkoutPlanUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    serialized_plan = {
        day: workout.model_dump()
        for day, workout in data.workout_plan.items()
    }

    existing = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == user.id
    ).first()

    if existing:
        existing.plan = serialized_plan
    else:
        db.add(
            WorkoutPlan(
                user_id=user.id,
                plan=serialized_plan
            )
        )

    db.commit()

    return {"message": "Workout plan saved successfully"}