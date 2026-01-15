from datetime import date, timedelta
from models.streak import Streak

def update_streak(
    streak: Streak,
    activity_date: date,
    is_active: bool
):
    if not is_active:
        streak.current_streak = 0
        streak.last_active_date = activity_date
        return

    if streak.last_active_date is None:
        streak.current_streak = 1
    elif activity_date == streak.last_active_date + timedelta(days=1):
        streak.current_streak += 1
    elif activity_date > streak.last_active_date:
        streak.current_streak = 1

    streak.longest_streak = max(
        streak.longest_streak,
        streak.current_streak
    )
    streak.last_active_date = activity_date
