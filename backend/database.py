"""
Database setup — SQLAlchemy async engine with SQLite (PostgreSQL-ready)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from backend.config import settings
from backend.utils.logger import get_logger

logger = get_logger(__name__)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

# Global in-memory cache for zero-latency lookups and fail-safe persistence
MEMORY_STORE = {
    "resumes": {},
    "job_descriptions": {},
    "analyses": {},
    "companies": {},
}


AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


async def create_tables():
    """Create all database tables on startup and ensure schema migrations."""
    # Import all models to register them with Base.metadata
    from backend.models.models import Resume, JobDescription, ResumeAnalysis, CompanyAnalysis, SavedReport  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Ensure new company_analyses columns exist in SQLite
        if "sqlite" in settings.DATABASE_URL:
            def sync_migrate(sync_conn):
                from sqlalchemy import text
                res = sync_conn.execute(text("PRAGMA table_info(company_analyses);"))
                cols = {row[1] for row in res.fetchall()}
                new_cols = [
                    ("ticker", "VARCHAR(50)"),
                    ("stock_exchange", "VARCHAR(100)"),
                    ("company_type", "VARCHAR(100)"),
                    ("parent_company", "VARCHAR(200)"),
                    ("founders", "JSON"),
                    ("ceo", "VARCHAR(200)"),
                    ("revenue", "VARCHAR(100)"),
                    ("products", "JSON"),
                    ("services", "JSON"),
                    ("careers_url", "VARCHAR(500)"),
                    ("hiring_skills", "JSON"),
                    ("common_roles", "JSON"),
                    ("confidence_metadata", "JSON"),
                    ("data_status", "VARCHAR(50)"),
                ]
                for col_name, col_type in new_cols:
                    if col_name not in cols:
                        try:
                            sync_conn.execute(text(f"ALTER TABLE company_analyses ADD COLUMN {col_name} {col_type};"))
                        except Exception:
                            pass
            await conn.run_sync(sync_migrate)
    logger.info("Database tables ensured and schema migrated.")




async def get_db():
    """FastAPI dependency — yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
