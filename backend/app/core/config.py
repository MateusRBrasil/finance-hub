"""
Application Configuration
"""
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Controle Financeiro SaaS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:8080").split(",")

settings = Settings()
