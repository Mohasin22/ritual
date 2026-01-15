import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, Integer, ForeignKey, JSON , DateTime
from database import Base

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True)

    """
    plan format (JSON):
    {
      "monday": { "name": "Chest", "exercises": ["Bench Press", "Push Ups"] },
      "tuesday": { "name": "Legs", "exercises": [] },
      ...
    }
    """
    plan = Column(JSON, nullable=False)


class WorkoutCompletion(Base):
    __tablename__ = "workout_completions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)

    completion_date = Column(Date, nullable=False)
    day_of_week = Column(String, nullable=False)

    """
    completed_exercises format:
    {
      "monday-0": true,
      "monday-1": false
    }
    """
    completed_exercises = Column(JSON, nullable=False)

    points_awarded = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
