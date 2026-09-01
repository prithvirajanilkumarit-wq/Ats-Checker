"""
Resume Router — upload and parse resumes
"""
import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db, MEMORY_STORE
from backend.models.models import Resume, JobDescription
from backend.schemas.schemas import ResumeUploadResponse, JobDescriptionCreate, JobDescriptionResponse
from backend.services.resume_parser import parse_resume
from backend.services.job_scraper import extract_job_from_url
from backend.config import settings
from backend.utils.logger import get_logger
from backend.utils.nlp_utils import extract_skills

logger = get_logger(__name__)
router = APIRouter()


@router.post("/upload", response_model=ResumeUploadResponse, summary="Upload and parse a resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a PDF or DOCX resume. Extracts and returns all resume fields.
    """
    # Validate file type
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    # Check file size
    content = await file.read()
    size_kb = len(content) / 1024
    if size_kb > settings.MAX_FILE_SIZE_MB * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed: {settings.MAX_FILE_SIZE_MB} MB",
        )

    # Save file
    safe_name = f"{os.urandom(8).hex()}_{file.filename}"
    file_path = os.path.join(settings.upload_path, safe_name)
    with open(file_path, "wb") as f:
        f.write(content)

    logger.info(f"Resume uploaded: {file.filename} ({size_kb:.1f} KB)")

    # Parse resume
    try:
        file_type = ext.lstrip(".")
        parsed = parse_resume(file_path, file_type)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=422, detail=f"Could not parse resume: {str(e)}")

    from datetime import datetime
    now = datetime.utcnow()

    # Store in DB
    resume = Resume(
        filename=file.filename,
        file_path=file_path,
        file_type=file_type,
        file_size_kb=round(size_kb, 2),
        candidate_name=parsed.get("candidate_name"),
        email=parsed.get("email"),
        phone=parsed.get("phone"),
        raw_text=parsed.get("raw_text"),
        extracted_skills=parsed.get("extracted_skills", []),
        experience_years=parsed.get("experience_years", 0.0),
        education=parsed.get("education", []),
        certifications=parsed.get("certifications", []),
        projects=parsed.get("projects", []),
        work_experience=parsed.get("work_experience", []),
        languages=parsed.get("languages", []),
        summary=parsed.get("summary"),
        created_at=now,
    )

    try:
        db.add(resume)
        await db.commit()
    except Exception as e:
        logger.warning(f"Resume DB commit note: {e}")
        try:
            await db.rollback()
        except Exception:
            pass

    resume_id = getattr(resume, "id", None) or len(MEMORY_STORE["resumes"]) + 1
    resume.id = resume_id
    MEMORY_STORE["resumes"][resume_id] = resume
    logger.info(f"Resume uploaded and parsed with ID {resume_id}")
    return resume


@router.get("/{resume_id}", response_model=ResumeUploadResponse, summary="Get resume by ID")
async def get_resume(resume_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a previously uploaded resume."""
    if resume_id in MEMORY_STORE["resumes"]:
        return MEMORY_STORE["resumes"][resume_id]
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    MEMORY_STORE["resumes"][resume_id] = resume
    return resume


@router.get("/", summary="List all uploaded resumes")
async def list_resumes(db: AsyncSession = Depends(get_db)):
    """List all resumes (for history/dashboard)."""
    result = await db.execute(select(Resume).order_by(Resume.created_at.desc()).limit(50))
    resumes = result.scalars().all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "candidate_name": r.candidate_name,
            "email": r.email,
            "created_at": r.created_at.isoformat(),
        }
        for r in resumes
    ]


# ── Job Description ────────────────────────────────────────────────────────────

@router.post("/job-description", response_model=JobDescriptionResponse, summary="Submit a job description")
async def create_job_description(
    body: JobDescriptionCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Accept a job description as pasted text OR a URL.
    If a URL is provided, attempts to scrape the JD from the page.
    """
    raw_text = body.raw_text or ""
    source_type = "manual"
    title = company = location = ""
    source_url = body.source_url

    if source_url and not raw_text:
        logger.info(f"Scraping JD from URL: {source_url}")
        scraped = await extract_job_from_url(source_url)
        raw_text = scraped.get("raw_text", "")
        title = scraped.get("title", "")
        company = scraped.get("company", "")
        source_type = scraped.get("source_type", "url")

        if not raw_text:
            raise HTTPException(
                status_code=422,
                detail="Could not extract job description from provided URL. Please paste the JD text manually.",
            )

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Job description text is required.")

    # Extract skills from JD
    required_skills = extract_skills(raw_text)

    from datetime import datetime
    now = datetime.utcnow()

    jd = JobDescription(
        title=title,
        company=company,
        location=location,
        source_url=source_url,
        source_type=source_type,
        raw_text=raw_text,
        required_skills=required_skills,
        preferred_skills=[],
        created_at=now,
    )

    try:
        db.add(jd)
        await db.commit()
    except Exception as e:
        logger.warning(f"JD DB commit note: {e}")
        try:
            await db.rollback()
        except Exception:
            pass

    jd_id = getattr(jd, "id", None) or len(MEMORY_STORE["job_descriptions"]) + 1
    jd.id = jd_id
    MEMORY_STORE["job_descriptions"][jd_id] = jd
    logger.info(f"Job description stored with ID {jd_id}")
    return jd


@router.get("/job-description/{jd_id}", response_model=JobDescriptionResponse)
async def get_job_description(jd_id: int, db: AsyncSession = Depends(get_db)):
    if jd_id in MEMORY_STORE["job_descriptions"]:
        return MEMORY_STORE["job_descriptions"][jd_id]
    result = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    MEMORY_STORE["job_descriptions"][jd_id] = jd
    return jd
