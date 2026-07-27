import joblib
import os

ML_DIR = os.path.join(os.path.dirname(__file__), "ml")

zone_encoder = joblib.load(os.path.join(ML_DIR, "zone_encoder.pkl"))

congestion_model = joblib.load(os.path.join(ML_DIR, "congestion_model.pkl"))
pollution_model = joblib.load(os.path.join(ML_DIR, "pollution_model.pkl"))
infra_model = joblib.load(os.path.join(ML_DIR, "infra_model.pkl"))

def _build_features(zone: str, day_of_week: int, hour: int):
    zone_encoded = zone_encoder.transform([zone])[0]
    is_weekday = 1 if day_of_week < 5 else 0
    is_rush_hour = 1 if hour in [8, 9, 10, 17, 18, 19, 20] else 0
    return [[zone_encoded, day_of_week, hour, is_weekday, is_rush_hour]]

def _predict_with_model(model, features):
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = round(float(max(probabilities)), 3)
    return prediction, confidence

def predict_all(zone: str, day_of_week: int, hour: int):
    features = _build_features(zone, day_of_week, hour)

    congestion_pred, congestion_conf = _predict_with_model(congestion_model, features)
    pollution_pred, pollution_conf = _predict_with_model(pollution_model, features)
    infra_pred, infra_conf = _predict_with_model(infra_model, features)

    return {
        "zone": zone,
        "day_of_week": day_of_week,
        "hour": hour,
        "congestion": {"level": congestion_pred, "confidence": congestion_conf},
        "pollution": {"level": pollution_pred, "confidence": pollution_conf},
        "infrastructure_stress": {"level": infra_pred, "confidence": infra_conf},
    }