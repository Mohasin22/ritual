from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from database import SessionLocal
from models import User, DailyActivity, Streak
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse, 
    RefreshTokenRequest, UserProfileResponse, UserProfileUpdate
)
from utils.security import (
    hash_password, verify_password, create_access_token, 
    create_refresh_token, decode_token
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
# GET CURRENT USER
# -------------------------
def get_current_user(token: str, db: Session = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    
    payload = decode_token(token)
    if not payload or payload.get("type") == "refresh":
        raise HTTPException(status_code=401, detail="Invalid token")
    
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
    try:
        logger.info(f"Registration attempt for email: {data.email}, username: {data.username}")
        
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            logger.warning(f"Email already exists: {data.email}")
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )
        
        # Check if username already exists
        existing_username = db.query(User).filter(User.username == data.username).first()
        if existing_username:
            logger.warning(f"Username already exists: {data.username}")
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        # Create user
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

        # Initialize streak for user
        streak = Streak(
            user_id=user.id,
            current_streak=0,
            longest_streak=0,
            last_active_date=None
        )
        db.add(streak)
        db.commit()

        # Create tokens
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})

        logger.info(f"User registered successfully: {data.username}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user.id,
            "username": user.username
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=f"Registration failed: {str(e)}"
        )


# -------------------------
# LOGIN
# -------------------------
@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }


# -------------------------
# REFRESH TOKEN
# -------------------------
@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Create new tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }


# -------------------------
# GET PROFILE
# -------------------------
@router.get("/profile", response_model=UserProfileResponse)
def get_profile(
    authorization: str = None,
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    
    # Calculate total points
    total_points = db.query(func.sum(DailyActivity.points)).filter(
        DailyActivity.user_id == user.id
    ).scalar() or 0
    
    # Get streak info
    streak = db.query(Streak).filter(Streak.user_id == user.id).first()
    current_streak = streak.current_streak if streak else 0
    longest_streak = streak.longest_streak if streak else 0

    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": user.bio or "",
        "avatar_url": user.avatar_url,
        "created_at": user.created_at,
        "total_points": total_points,
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }


# -------------------------
# UPDATE PROFILE
# -------------------------
@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    data: UserProfileUpdate,
    authorization: str = None,
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    
    if data.bio is not None:
        user.bio = data.bio
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    
    db.commit()
    db.refresh(user)
    
    # Calculate total points
    total_points = db.query(func.sum(DailyActivity.points)).filter(
        DailyActivity.user_id == user.id
    ).scalar() or 0
    
    # Get streak info
    streak = db.query(Streak).filter(Streak.user_id == user.id).first()
    current_streak = streak.current_streak if streak else 0
    longest_streak = streak.longest_streak if streak else 0

    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": user.bio or "",
        "avatar_url": user.avatar_url,
        "created_at": user.created_at,
        "total_points": total_points,
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }
