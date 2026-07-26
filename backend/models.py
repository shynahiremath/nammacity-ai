from pydantic import BaseModel, EmailStr

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TrafficZone(BaseModel):
    name: str
    latitude: float
    longitude: float
    level: str