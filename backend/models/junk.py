import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from database import Base

class UserJunkLimit(Base):
    __tablename__ = "user_junk_limits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)

    junk_type = Column(String, nullable=False)
    max_quantity = Column(Integer, nullable=False)
