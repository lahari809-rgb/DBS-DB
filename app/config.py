import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Sign Language Translator API"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    # MongoDB connection
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "sign_language_db")
    
    # Storage Fallback
    USE_IN_MEMORY_FALLBACK: bool = True
    DATA_STORAGE_DIR: str = os.path.join(os.path.dirname(__file__), "storage")
    
    # JWT & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-sign-language-ai-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

settings = Settings()
