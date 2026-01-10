import uuid
from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

class DailyActivity(Base):
    __tablename__ = "daily_activity"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    activity_date = Column(Date, nullable=False)
    steps = Column(Integer, default=0)
    junk_type = Column(String)
    junk_quantity = Column(Integer, default=0)
    points = Column(Integer, default=0)


class UserJunkLimit(Base):
    __tablename__ = "user_junk_limits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    junk_type = Column(String, nullable=False)
    max_quantity = Column(Integer, nullable=False)


class Streak(Base):
    __tablename__ = "streaks"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_active_date = Column(Date)