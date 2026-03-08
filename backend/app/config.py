from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    MONGO_URL: str = "mongodb://localhost:27017"
    API_KEY: str = "restaurant-secret-key-2024"
    ALLOWED_ORIGINS: str = "http://localhost:3000,https://restaurant-app.cloudfront.net"
    ENVIRONMENT: str = "development"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
