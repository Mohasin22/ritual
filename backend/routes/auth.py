from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from database import SessionLocal
from models.user import User
from models.activity import DailyActivity
from models.streak import Streak
from schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserProfileResponse,
    UserProfileUpdate
)
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])

# -------------------------
# DATABASE DEPENDENCY
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# CURRENT USER DEPENDENCY
# -------------------------
def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)

    if not payload or payload.get("type") == "refresh":
        raise HTTPException(status_code=401, detail="Invalid access token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

# -------------------------
# REGISTER
# -------------------------
@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password),
        bio="",
        avatar_url=None
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize streak
    db.add(
        Streak(
            user_id=user.id,
            current_streak=0,
            longest_streak=0,
            last_active_date=None
        )
    )
    db.commit()

    logger.info(f"User registered: {user.username}")

    return {
        "access_token": create_access_token({"sub": user.id}),
        "refresh_token": create_refresh_token({"sub": user.id}),
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

# -------------------------
# LOGIN
# -------------------------
@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.info(f"User logged in: {user.username}")

    return {
        "access_token": create_access_token({"sub": user.id}),
        "refresh_token": create_refresh_token({"sub": user.id}),
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

# -------------------------
# REFRESH TOKEN
# -------------------------
@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    payload = decode_token(data.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "access_token": create_access_token({"sub": user.id}),
        "refresh_token": create_refresh_token({"sub": user.id}),
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

# -------------------------
# GET PROFILE
# -------------------------
@router.get("/profile", response_model=UserProfileResponse)
def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_points = (
        db.query(func.sum(DailyActivity.points))
        .filter(DailyActivity.user_id == user.id)
        .scalar()
        or 0
    )

    streak = db.query(Streak).filter(Streak.user_id == user.id).first()

    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": user.bio or "",
        "avatar_url": user.avatar_url,
        "created_at": user.created_at,
        "total_points": total_points,
        "current_streak": streak.current_streak if streak else 0,
        "longest_streak": streak.longest_streak if streak else 0
    }

# -------------------------
# UPDATE PROFILE
# -------------------------
@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    data: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.bio is not None:
        user.bio = data.bio

    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    db.commit()
    db.refresh(user)

    total_points = (
        db.query(func.sum(DailyActivity.points))
        .filter(DailyActivity.user_id == user.id)
        .scalar()
        or 0
    )

    streak = db.query(Streak).filter(Streak.user_id == user.id).first()

    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": user.bio or "",
        "avatar_url": user.avatar_url,
        "created_at": user.created_at,
        "total_points": total_points,
        "current_streak": streak.current_streak if streak else 0,
        "longest_streak": streak.longest_streak if streak else 0
    }
