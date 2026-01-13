from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from models.workout import WorkoutPlan, WorkoutCompletion
from models.user import User 
from models.streak import Streak
from schemas import WorkoutPlanUpdate, WorkoutPlanResponse, WorkoutCompletionUpdate, WorkoutCompletionResponse, LeaderboardResponse
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
    points = data.get("points", 0)
    # Always set day_of_week
    day_of_week = today.strftime("%A").lower()  # e.g. 'monday'
    record = db.query(WorkoutCompletion).filter_by(
        user_id=user.id,
        completion_date=today
    ).first()
    if record:
        record.completed_exercises = completed
        record.points_awarded = points
        record.day_of_week = day_of_week
    else:
        record = WorkoutCompletion(
            user_id=user.id,
            completion_date=today,
            day_of_week=day_of_week,
            completed_exercises=completed,
            points_awarded=points
        )
        db.add(record)
    db.commit()
    return {
        "points_awarded": points
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

@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    streaks = {s.user_id: s for s in db.query(Streak).all()}
    points = dict(
        db.query(WorkoutCompletion.user_id, func.sum(WorkoutCompletion.points_awarded))
        .group_by(WorkoutCompletion.user_id)
        .all()
    )
    leaderboard = []
    for user in users:
        user_points = points.get(user.id, 0)
        user_streak = streaks.get(user.id)
        leaderboard.append({
            "user_id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "points": user_points,
            "highest_streak": user_streak.longest_streak if user_streak else 0
        })
    leaderboard.sort(key=lambda x: x["points"], reverse=True)
    return {"leaderboard": leaderboard}

@router.get("/streak-calendar")
def get_streak_calendar(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all completions for this user, ordered by date
    completions = db.query(WorkoutCompletion).filter_by(user_id=user.id).order_by(WorkoutCompletion.completion_date).all()
    calendar = []
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    total_active_days = 0
    total_points = 0
    last_completed = None
    for c in completions:
        is_active = c.points_awarded > 0
        calendar.append({
            "date": c.completion_date.isoformat(),
            "points": c.points_awarded,
            "completed": is_active
        })
        if is_active:
            total_active_days += 1
            total_points += c.points_awarded
            if last_completed is None or (c.completion_date - last_completed).days == 1:
                temp_streak += 1
            else:
                temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)
            last_completed = c.completion_date
        else:
            temp_streak = 0
    # Calculate current streak from the end
    current_streak = 0
    for c in reversed(completions):
        if c.points_awarded > 0:
            if last_completed and (last_completed - c.completion_date).days <= 1:
                current_streak += 1
                last_completed = c.completion_date
            elif last_completed is None:
                current_streak += 1
                last_completed = c.completion_date
            else:
                break
    return {
        "calendar": calendar,
        "currentStreak": current_streak,
        "longestStreak": longest_streak,
        "totalActiveDays": total_active_days,
        "totalPoints": total_points
    }

@router.get("/dashboard-summary")
def get_dashboard_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    # Profile (minimal)
    profile = {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
    }
    # Workout plan
    plan_obj = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user.id).first()
    workout_plan = plan_obj.plan if plan_obj else {}
    # Today's completion
    completion = db.query(WorkoutCompletion).filter(
        WorkoutCompletion.user_id == user.id,
        WorkoutCompletion.completion_date == today
    ).first()
    completed_exercises = completion.completed_exercises if completion else {}
    today_points = completion.points_awarded if completion else 0
    # Points summary
    total_points = db.query(func.sum(WorkoutCompletion.points_awarded))\
        .filter(WorkoutCompletion.user_id == user.id)\
        .scalar() or 0
    return {
        "profile": profile,
        "workout_plan": workout_plan,
        "completed_exercises": completed_exercises,
        "points_summary": {
            "total_points": total_points,
            "today_points": today_points
        }
    }