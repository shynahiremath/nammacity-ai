import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml", "congestion_model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "ml", "zone_encoder.pkl")

model = joblib.load(MODEL_PATH)
zone_encoder = joblib.load(ENCODER_PATH)

def predict_congestion(zone: str, day_of_week: int, hour: int):
    zone_encoded = zone_encoder.transform([zone])[0]

    is_weekday = 1 if day_of_week < 5 else 0
    is_rush_hour = 1 if hour in [8, 9, 10, 17, 18, 19, 20] else 0

    features = [[zone_encoded, day_of_week, hour, is_weekday, is_rush_hour]]

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    confidence = max(probabilities)

    return {
        "zone": zone,
        "day_of_week": day_of_week,
        "hour": hour,
        "predicted_level": prediction,
        "confidence": round(float(confidence), 3),
    }