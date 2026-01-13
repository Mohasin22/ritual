from sqlalchemy.orm import Session
from models.user import User
from models.streak import Streak

def create_user(db: Session, email: str, username: str, password_hash: str):
    user = User(
        email=email,
        username=username,
        password_hash=password_hash
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

    return user
