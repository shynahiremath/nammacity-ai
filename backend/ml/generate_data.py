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

zone_base_infra_age = {
    "MG Road": 0.6,
    "Whitefield": 0.3,
    "Koramangala": 0.4,
    "Electronic City": 0.35,
    "Indiranagar": 0.55,
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
                congestion_level = "high"
            elif score >= 0.35:
                congestion_level = "medium"
            else:
                congestion_level = "low"

            pollution_score = score * 0.7 + np.random.normal(0, 0.1)
            pollution_score = max(0, min(1, pollution_score))

            if pollution_score >= 0.6:
                pollution_level = "high"
            elif pollution_score >= 0.3:
                pollution_level = "medium"
            else:
                pollution_level = "low"

            infra_base = zone_base_infra_age[zone]
            infra_score = infra_base * 0.5 + score * 0.4 + np.random.normal(0, 0.1)
            infra_score = max(0, min(1, infra_score))

            if infra_score >= 0.6:
                infra_level = "high"
            elif infra_score >= 0.3:
                infra_level = "medium"
            else:
                infra_level = "low"

            rows.append({
                "zone": zone,
                "day_of_week": day_offset % 7,
                "hour": hour,
                "is_weekday": int(weekday),
                "is_rush_hour": int(is_rush_hour),
                "congestion_score": round(score, 3),
                "congestion_level": congestion_level,
                "pollution_score": round(pollution_score, 3),
                "pollution_level": pollution_level,
                "infra_score": round(infra_score, 3),
                "infra_level": infra_level,
            })

df = pd.DataFrame(rows)
df.to_csv("traffic_data.csv", index=False)

print(f"Generated {len(df)} rows")
print("\nCongestion distribution:")
print(df["congestion_level"].value_counts())
print("\nPollution distribution:")
print(df["pollution_level"].value_counts())
print("\nInfrastructure stress distribution:")
print(df["infra_level"].value_counts())