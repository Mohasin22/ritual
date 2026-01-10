from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from schemas import RegisterRequest, LoginRequest
from utils.security import hash_password, verify_password

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
# REGISTER
# -------------------------
@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Create user
    user = User(
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "username": user.username
    }

# -------------------------
# LOGIN
# -------------------------
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
        "user_id": user.id,
        "username": user.username
    }
