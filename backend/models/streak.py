from sqlalchemy import Column, String, Integer, Date, ForeignKey
from database import Base

class Streak(Base):
    __tablename__ = "streaks"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)

    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)
