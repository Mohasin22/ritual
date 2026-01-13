import uuid
from sqlalchemy import Column, String, Integer, Date, ForeignKey
from database import Base

class DailyActivity(Base):
    __tablename__ = "daily_activity"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)

    activity_date = Column(Date, nullable=False)
    steps = Column(Integer, default=0)

    # Calculated by backend only
    points = Column(Integer, default=0)
