def calculate_points(
    steps: int,
    junk_quantity: int,
    max_allowed: int
) -> int:
    points = 0

    # Steps points
    if steps >= 10000:
        points += 30
    elif steps >= 8000:
        points += 20
    elif steps >= 5000:
        points += 10

    # Junk penalty
    if junk_quantity > max_allowed:
        excess = junk_quantity - max_allowed
        points -= excess * 5

    return points
