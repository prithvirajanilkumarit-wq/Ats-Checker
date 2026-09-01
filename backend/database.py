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
    """Create all database tables on startup."""
    # Import all models to register them with Base.metadata
    from backend.models.models import Resume, JobDescription, ResumeAnalysis, CompanyAnalysis, SavedReport  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured.")



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
