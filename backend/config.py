"""
Application Configuration — loaded from .env file
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List
import os



class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "AI Resume & Job Match Analyzer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./ats_analyzer_v2.db"
    # For PostgreSQL: postgresql+asyncpg://user:password@localhost:5432/ats_db

    # ── Gemini ───────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # ── OpenAI ───────────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.3

    # ── CORS ─────────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, list):
            return ",".join(v)
        # Strip JSON array brackets if present
        v = str(v).strip()
        if v.startswith("["):
            import json
            try:
                parsed = json.loads(v)
                return ",".join(parsed)
            except Exception:
                pass
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        return ["*"]

    # ── File Upload ──────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".doc"]

    # ── NLP ──────────────────────────────────────────────────────────────────
    SENTENCE_TRANSFORMER_MODEL: str = "all-MiniLM-L6-v2"

    # ── Reports ──────────────────────────────────────────────────────────────
    REPORTS_DIR: str = "reports"

    # ── Feature Flags ────────────────────────────────────────────────────────
    ENABLE_WEB_SCRAPING: bool = True
    ENABLE_AI_SUGGESTIONS: bool = True
    AI_FALLBACK_MODE: bool = True   # Use rule-based fallback if OpenAI fails

    @property
    def upload_path(self) -> str:
        path = os.path.join(os.getcwd(), self.UPLOAD_DIR)
        os.makedirs(path, exist_ok=True)
        return path

    @property
    def reports_path(self) -> str:
        path = os.path.join(os.getcwd(), self.REPORTS_DIR)
        os.makedirs(path, exist_ok=True)
        return path

    @property
    def has_gemini(self) -> bool:
        key = self.GEMINI_API_KEY.strip()
        return bool(key) and not key.startswith("your_")

    @property
    def has_openai(self) -> bool:
        key = self.OPENAI_API_KEY.strip()
        return bool(key) and key.startswith("sk-") and not key.startswith("sk-your")

    @property
    def has_ai(self) -> bool:
        return self.has_gemini or self.has_openai


settings = Settings()
