def calculate_points(
    steps: int,
    junk_quantity: int,
    max_allowed: int
) -> int:
    points = 0

    # Steps points logic
    # 0 points for steps below 6k
    # 30 points at 6k steps
    # 5 points for each 1k steps after 6k (up to 10k)
    # Maximum 50 points at 10k steps
    if steps >= 6000:
        # Base 30 points for reaching 6k
        points += 30
        
        # Additional 5 points for each 1k steps between 6k and 10k
        if steps > 6000:
            additional_steps = min(steps, 10000) - 6000
            # For each complete 1k steps, add 5 points
            points += (additional_steps // 1000) * 5
    
    # Cap at maximum 50 points for steps
    points = min(points, 50)

    # Junk penalty
    if junk_quantity > max_allowed:
        excess = junk_quantity - max_allowed
        points -= excess * 5

    return points
