from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://app:app@localhost:5432/docanalyzer"
    JWT_SECRET: str = "dev-change-me"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 15

    class Config:
        env_file = ".env"

settings = Settings()
