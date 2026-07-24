from fastapi import FastAPI
from database import database

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