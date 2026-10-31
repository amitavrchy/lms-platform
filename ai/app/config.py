from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str = ""
    openai_model: str = "gpt-4.1-mini"
    chroma_path: str = "./chroma"
    client_origin: str = "http://localhost:3000"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/lms_platform"
    nest_api_url: str = "http://127.0.0.1:4000"

    @property
    def mock_mode(self) -> bool:
        """True when no OpenAI key is configured — return structured demo responses."""
        return not bool(self.openai_api_key and self.openai_api_key.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
