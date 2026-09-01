"""
AI Resume & Job Match Analyzer — FastAPI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from backend.config import settings
from backend.database import create_tables
from backend.routers import resume, analysis, company, reports
from backend.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info("🚀 Starting AI Resume & Job Match Analyzer API...")
    try:
        await create_tables()
        logger.info("✅ Database tables created/verified.")
    except Exception as e:
        logger.error(f"Database setup note: {e}")
    yield
    logger.info("🛑 Shutting down API server.")


app = FastAPI(
    title="AI Resume & Job Match Analyzer",
    description=(
        "A production-quality API for resume analysis, ATS scoring, "
        "job match scoring, AI-powered suggestions, and company analysis."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(company.router, prefix="/api/company", tags=["Company"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


BUILD_ID = "v2.5-lockfree"

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "build_id": BUILD_ID,
        "service": "AI Resume & Job Match Analyzer",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
