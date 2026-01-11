"""
User Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    nome: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
