from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import database
from models import UserSignup, UserLogin, TrafficZone
from auth import hash_password, verify_password, create_access_token
from ml_predictor import predict_all

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to NammaCity AI Backend"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/db-check")
async def db_check():
    collections = await database.list_collection_names()
    return {"connected": True, "collections": collections}

@app.post("/signup")
async def signup(user: UserSignup):
    existing_user = await database.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw
    }

    result = await database.users.insert_one(new_user)

    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }

@app.post("/login")
async def login(user: UserLogin):
    db_user = await database.users.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": db_user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "name": db_user["name"]
    }

@app.get("/traffic-zones")
async def get_traffic_zones():
    zones = []
    cursor = database.traffic_zones.find()
    async for zone in cursor:
        zones.append({
            "id": str(zone["_id"]),
            "name": zone["name"],
            "latitude": zone["latitude"],
            "longitude": zone["longitude"],
            "level": zone["level"],
        })
    return zones

@app.post("/traffic-zones")
async def create_traffic_zone(zone: TrafficZone):
    new_zone = zone.dict()
    result = await database.traffic_zones.insert_one(new_zone)
    return {"message": "Zone created", "id": str(result.inserted_id)}

@app.get("/predict")
async def predict(zone: str, day_of_week: int, hour: int):
    try:
        result = predict_all(zone, day_of_week, hour)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))