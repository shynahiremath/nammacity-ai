from fastapi import FastAPI, HTTPException
from database import database
from models import UserSignup, UserLogin
from auth import hash_password, verify_password

app = FastAPI()

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