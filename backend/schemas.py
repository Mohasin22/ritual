from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from uuid import UUID

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class JunkLimitCreate(BaseModel):
    junk_type: str
    max_quantity: int

class ActivityCreate(BaseModel):
    activity_date: date
    steps: int
    junk_type: Optional[str] = None
    junk_quantity: int = 0

class ProfileResponse(BaseModel):
    user_id: UUID
    username: str
    total_points: int
    current_streak: int
    longest_streak: int

class ActivityResponse(BaseModel):
    activity_date: date
    steps: int
    junk_type: Optional[str]
    junk_quantity: int
    points: int

    