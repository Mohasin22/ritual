from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from models.workout import WorkoutPlan, WorkoutCompletion
from models.user import User 
from schemas import WorkoutPlanUpdate, WorkoutPlanResponse, WorkoutCompletionUpdate, WorkoutCompletionResponse
from routes.auth import get_current_user
from database import SessionLocal

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

# -------------------------
# GET TODAY'S WORKOUT COMPLETION
# -------------------------
@router.get("/workout-completion", response_model=WorkoutCompletionResponse)
def get_workout_completion(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    completion = db.query(WorkoutCompletion).filter(
        WorkoutCompletion.user_id == user.id,
        WorkoutCompletion.completion_date == today
    ).first()

    if not completion:
        return {"completed_exercises": {}}

    return {"completed_exercises": completion.completed_exercises}

# -------------------------
# SAVE TODAY'S WORKOUT COMPLETION
# -------------------------
@router.put("/workout-completion")
def save_workout_completion(
    data: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()

    completed = data.get("completed_exercises", {})

    # ---- POINTS LOGIC (BACKEND ONLY) ----
    workout_points = sum(1 for v in completed.values() if v) * 20

    record = db.query(WorkoutCompletion).filter_by(
        user_id=user.id,
        completion_date=today
    ).first()

    if record:
        record.completed_exercises = completed
        record.points_awarded = workout_points
    else:
        record = WorkoutCompletion(
            user_id=user.id,
            completion_date=today,
            completed_exercises=completed,
            points_awarded=workout_points
        )
        db.add(record)

    db.commit()

    return {
        "points_awarded": workout_points
    }


@router.get("/points-summary")
def get_points_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(func.sum(WorkoutCompletion.points_awarded))\
              .filter(WorkoutCompletion.user_id == user.id)\
              .scalar() or 0

    return {
        "total_points": total,
        "today_points": 0  # extend later
    }