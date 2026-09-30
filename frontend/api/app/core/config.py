from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import secrets

class Settings(BaseSettings):
    APP_NAME: str = "PackSmart AI Backend"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str = "sqlite:////tmp/packsmart.db"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: List[str] = ["*"]
    LLM_API_KEY: str | None = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
