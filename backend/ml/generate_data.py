import pandas as pd
import numpy as np
import random

random.seed(42)
np.random.seed(42)

zones = ["MG Road", "Whitefield", "Koramangala", "Electronic City", "Indiranagar"]

zone_base_congestion = {
    "MG Road": 0.7,
    "Whitefield": 0.5,
    "Koramangala": 0.3,
    "Electronic City": 0.65,
    "Indiranagar": 0.5,
}

rows = []

for day_offset in range(180):
    for hour in range(24):
        for zone in zones:
            weekday = (day_offset % 7) < 5

            is_rush_hour = hour in [8, 9, 10, 17, 18, 19, 20]

            base = zone_base_congestion[zone]

            score = base

            if weekday and is_rush_hour:
                score += 0.35
            elif weekday:
                score += 0.1
            else:
                score -= 0.15

            if hour in [0, 1, 2, 3, 4]:
                score -= 0.3

            score += np.random.normal(0, 0.08)

            score = max(0, min(1, score))

            if score >= 0.65:
                level = "high"
            elif score >= 0.35:
                level = "medium"
            else:
                level = "low"

            rows.append({
                "zone": zone,
                "day_of_week": day_offset % 7,
                "hour": hour,
                "is_weekday": int(weekday),
                "is_rush_hour": int(is_rush_hour),
                "congestion_score": round(score, 3),
                "level": level,
            })

df = pd.DataFrame(rows)

df.to_csv("traffic_data.csv", index=False)

print(f"Generated {len(df)} rows")
print(df.head(10))
print("\nLevel distribution:")
print(df["level"].value_counts())