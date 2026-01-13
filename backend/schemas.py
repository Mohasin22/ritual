from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional
from typing import Dict, List
# -------------------------
# AUTH SCHEMAS
# -------------------------
class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if '@' not in v or '.' not in v.split('@')[1]:
            raise ValueError('Invalid email address')
        return v.lower()


class LoginRequest(BaseModel):
    email: str
    password: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if '@' not in v or '.' not in v.split('@')[1]:
            raise ValueError('Invalid email address')
        return v.lower()


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: str
    username: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# -------------------------
# USER PROFILE SCHEMAS
# -------------------------
class UserProfileUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    user_id: str
    username: str
    email: str
    bio: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    total_points: int
    current_streak: int
    longest_streak: int

    class Config:
        from_attributes = True


# -------------------------
# JUNK LIMIT SCHEMAS
# -------------------------
class JunkLimitCreate(BaseModel):
    junk_type: str
    max_quantity: int

# -------------------------
# DAILY ACTIVITY SCHEMAS
# -------------------------
class ActivityCreate(BaseModel):
    activity_date: date
    steps: int
    junk_type: Optional[str] = None
    junk_quantity: int = 0

# -------------------------
# RESPONSE SCHEMAS
# -------------------------
class ProfileResponse(BaseModel):
    user_id: str
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



class WorkoutDaySchema(BaseModel):
    name: str
    exercises: List[str]

class WorkoutPlanUpdate(BaseModel):
    workout_plan: Dict[str, WorkoutDaySchema]

class WorkoutPlanResponse(BaseModel):
    workout_plan: Dict[str, WorkoutDaySchema]

class WorkoutCompletionUpdate(BaseModel):
    completed_exercises: Dict[str, bool]

class WorkoutCompletionResponse(BaseModel):
    completed_exercises: Dict[str, bool]

class LeaderboardUser(BaseModel):
    user_id: str
    username: str
    avatar_url: Optional[str]
    points: int
    highest_streak: int

class LeaderboardResponse(BaseModel):
    leaderboard: list[LeaderboardUser]