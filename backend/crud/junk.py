from sqlalchemy.orm import Session
from models import UserJunkLimit

def get_max_allowed_junk(
    db: Session,
    user_id,
    junk_type: str | None
) -> int:
    if not junk_type:
        return 0

    limit = db.query(UserJunkLimit).filter_by(
        user_id=user_id,
        junk_type=junk_type
    ).first()

    return limit.max_quantity if limit else 0
