import os
from typing import List

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application configuration settings."""

    API_TITLE: str = "Ethara AI Dashboard API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "FastAPI backend for Ethara AI Dashboard"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ethara.db")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    SQLALCHEMY_ECHO: bool = os.getenv("SQLALCHEMY_ECHO", "False").lower() == "true"


settings = Settings()
