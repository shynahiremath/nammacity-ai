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
target = "level"

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel Accuracy: {accuracy:.2%}")
print("\nDetailed Report:")
print(classification_report(y_test, y_pred))

joblib.dump(model, "congestion_model.pkl")
joblib.dump(zone_encoder, "zone_encoder.pkl")

print("\nModel saved as congestion_model.pkl")