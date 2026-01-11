import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Date,
    DateTime,
    ForeignKey
)
from database import Base
from sqlalchemy import Column, String, ForeignKey, JSON
from database import Base
# -------------------------
# USERS TABLE
# -------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    bio = Column(String, nullable=True, default="")
    avatar_url = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

# -------------------------
# DAILY ACTIVITY TABLE
# -------------------------
class DailyActivity(Base):
    __tablename__ = "daily_activity"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    activity_date = Column(Date, nullable=False)
    steps = Column(Integer, default=0)
    junk_type = Column(String, nullable=True)
    junk_quantity = Column(Integer, default=0)
    points = Column(Integer, default=0)

# -------------------------
# USER JUNK LIMITS TABLE
# -------------------------
class UserJunkLimit(Base):
    __tablename__ = "user_junk_limits"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    junk_type = Column(String, nullable=False)
    max_quantity = Column(Integer, nullable=False)

# -------------------------
# STREAKS TABLE
# -------------------------
class Streak(Base):
    __tablename__ = "streaks"

    user_id = Column(
        String,
        ForeignKey("users.id"),
        primary_key=True
    )
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    user_id = Column(
        String,
        ForeignKey("users.id"),
        primary_key=True
    )

    plan = Column(JSON, nullable=False)