import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib

df = pd.read_csv("traffic_data.csv")

zone_encoder = LabelEncoder()
df["zone_encoded"] = zone_encoder.fit_transform(df["zone"])

features = ["zone_encoded", "day_of_week", "hour", "is_weekday", "is_rush_hour"]

def train_and_save(target_column, model_filename, label):
    print(f"\n{'='*50}")
    print(f"Training model for: {label}")
    print(f"{'='*50}")

    X = df[features]
    y = df[target_column]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"Accuracy: {accuracy:.2%}")
    print(classification_report(y_test, y_pred))

    joblib.dump(model, model_filename)
    print(f"Saved as {model_filename}")

train_and_save("congestion_level", "congestion_model.pkl", "Traffic Congestion")
train_and_save("pollution_level", "pollution_model.pkl", "Pollution")
train_and_save("infra_level", "infra_model.pkl", "Infrastructure Stress")

joblib.dump(zone_encoder, "zone_encoder.pkl")
print("\nAll models trained and saved successfully!")