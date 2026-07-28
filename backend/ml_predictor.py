import joblib
import os

ML_DIR = os.path.join(os.path.dirname(__file__), "ml")

zone_encoder = joblib.load(os.path.join(ML_DIR, "zone_encoder.pkl"))
weather_encoder = joblib.load(os.path.join(ML_DIR, "weather_encoder.pkl"))

congestion_model = joblib.load(os.path.join(ML_DIR, "congestion_model.pkl"))
pollution_model = joblib.load(os.path.join(ML_DIR, "pollution_model.pkl"))
infra_model = joblib.load(os.path.join(ML_DIR, "infra_model.pkl"))

FEATURE_NAMES = [
    "zone", "day_of_week", "hour", "is_weekday",
    "is_rush_hour", "weather", "is_event",
]

FRIENDLY_NAMES = {
    "zone": "Zone",
    "day_of_week": "Day of week",
    "hour": "Time of day",
    "is_weekday": "Weekday/weekend",
    "is_rush_hour": "Rush hour",
    "weather": "Weather",
    "is_event": "Local event",
}


def _build_features(zone: str, day_of_week: int, hour: int, weather: str, is_event: bool):
    zone_encoded = zone_encoder.transform([zone])[0]
    weather_encoded = weather_encoder.transform([weather])[0]
    is_weekday = 1 if day_of_week < 5 else 0
    is_rush_hour = 1 if hour in [8, 9, 10, 17, 18, 19, 20] else 0
    return [[zone_encoded, day_of_week, hour, is_weekday, is_rush_hour, weather_encoded, int(is_event)]]


def _predict_with_model(model, features):
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = round(float(max(probabilities)), 3)
    return prediction, confidence


def _explain(model, zone, day_of_week, hour, weather, is_event, level):
    """Return the top contributing factors for this prediction, using the
    model's global feature importances plus the specific input values,
    so the explanation is grounded in what actually drove this instance."""
    importances = model.feature_importances_
    ranked = sorted(zip(FEATURE_NAMES, importances), key=lambda x: -x[1])

    is_weekday = day_of_week < 5
    is_rush_hour = hour in [8, 9, 10, 17, 18, 19, 20]

    context = {
        "zone": zone,
        "day_of_week": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][day_of_week],
        "hour": f"{hour}:00",
        "is_weekday": "Weekday" if is_weekday else "Weekend",
        "is_rush_hour": "Rush hour" if is_rush_hour else "Off-peak",
        "weather": weather.replace("_", " ").title(),
        "is_event": "Event nearby" if is_event else "No local event",
    }

    reasons = []
    for name, importance in ranked[:3]:
        if importance < 0.02:
            continue
        reasons.append({
            "factor": FRIENDLY_NAMES[name],
            "value": context[name],
            "influence": round(float(importance), 3),
        })

    # rule-based override note: events are rare in training data, so the
    # model may underweight them even when relevant - flag explicitly
    if is_event and level in ("high",):
        reasons.insert(0, {
            "factor": "Local event",
            "value": "Event nearby",
            "influence": None,
            "note": "Flagged by rule: local events sharply increase short-term risk regardless of model weighting.",
        })

    return reasons


def predict_all(zone: str, day_of_week: int, hour: int, weather: str = "clear", is_event: bool = False):
    features = _build_features(zone, day_of_week, hour, weather, is_event)

    congestion_pred, congestion_conf = _predict_with_model(congestion_model, features)
    pollution_pred, pollution_conf = _predict_with_model(pollution_model, features)
    infra_pred, infra_conf = _predict_with_model(infra_model, features)

    return {
        "zone": zone,
        "day_of_week": day_of_week,
        "hour": hour,
        "weather": weather,
        "is_event": is_event,
        "congestion": {
            "level": congestion_pred,
            "confidence": congestion_conf,
            "reasons": _explain(congestion_model, zone, day_of_week, hour, weather, is_event, congestion_pred),
        },
        "pollution": {
            "level": pollution_pred,
            "confidence": pollution_conf,
            "reasons": _explain(pollution_model, zone, day_of_week, hour, weather, is_event, pollution_pred),
        },
        "infrastructure_stress": {
            "level": infra_pred,
            "confidence": infra_conf,
            "reasons": _explain(infra_model, zone, day_of_week, hour, weather, is_event, infra_pred),
        },
    }