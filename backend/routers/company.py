"""
Company Router — company analysis endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models.models import CompanyAnalysis
from backend.schemas.schemas import CompanyAnalysisRequest
from backend.services.company_analyzer import analyze_company
from backend.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/analyze", summary="Analyze a company")
async def analyze_company_endpoint(
    body: CompanyAnalysisRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze a company using AI + web summarization.
    Accepts company name or job URL.
    """
    if not body.company_name and not body.job_url:
        raise HTTPException(
            status_code=400,
            detail="Provide either 'company_name' or 'job_url'",
        )

    company_name = body.company_name or "Unknown Company"
    data = await analyze_company(company_name, body.job_url)

    # Save to DB
    ratings = data.get("ratings", {})
    company_record = CompanyAnalysis(
        company_name=data.get("company_name", company_name),
        industry=data.get("industry"),
        founded_year=data.get("founded_year"),
        headquarters=data.get("headquarters"),
        company_size=data.get("company_size"),
        employee_count=data.get("employee_count"),
        website=data.get("website"),
        description=data.get("description"),
        overall_rating=ratings.get("overall_rating", 0.0),
        work_life_balance=ratings.get("work_life_balance", 0.0),
        salary_satisfaction=ratings.get("salary_satisfaction", 0.0),
        career_growth=ratings.get("career_growth", 0.0),
        culture_rating=ratings.get("culture_rating", 0.0),
        interview_difficulty=ratings.get("interview_difficulty", 0.0),
        pros=data.get("pros", []),
        cons=data.get("cons", []),
        overall_recommendation=data.get("overall_recommendation"),
        salary_range=data.get("salary_range"),
        average_salary=data.get("average_salary"),
        sources=data.get("sources", []),
    )

    db.add(company_record)
    await db.commit()
    await db.refresh(company_record)

    # Return enriched response
    return {
        "id": company_record.id,
        "company_name": company_record.company_name,
        "industry": company_record.industry,
        "founded_year": company_record.founded_year,
        "headquarters": company_record.headquarters,
        "company_size": company_record.company_size,
        "employee_count": company_record.employee_count,
        "website": company_record.website,
        "description": company_record.description,
        "ratings": {
            "overall_rating": company_record.overall_rating,
            "work_life_balance": company_record.work_life_balance,
            "salary_satisfaction": company_record.salary_satisfaction,
            "career_growth": company_record.career_growth,
            "culture_rating": company_record.culture_rating,
            "interview_difficulty": company_record.interview_difficulty,
        },
        "pros": company_record.pros,
        "cons": company_record.cons,
        "overall_recommendation": company_record.overall_recommendation,
        "salary_range": company_record.salary_range,
        "average_salary": company_record.average_salary,
        "sources": company_record.sources,
        "created_at": company_record.created_at.isoformat(),
    }


@router.get("/{company_id}", summary="Get saved company analysis")
async def get_company_analysis(company_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompanyAnalysis).where(CompanyAnalysis.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company analysis not found")

    return {
        "id": company.id,
        "company_name": company.company_name,
        "industry": company.industry,
        "founded_year": company.founded_year,
        "headquarters": company.headquarters,
        "company_size": company.company_size,
        "employee_count": company.employee_count,
        "website": company.website,
        "description": company.description,
        "ratings": {
            "overall_rating": company.overall_rating,
            "work_life_balance": company.work_life_balance,
            "salary_satisfaction": company.salary_satisfaction,
            "career_growth": company.career_growth,
            "culture_rating": company.culture_rating,
            "interview_difficulty": company.interview_difficulty,
        },
        "pros": company.pros or [],
        "cons": company.cons or [],
        "overall_recommendation": company.overall_recommendation,
        "salary_range": company.salary_range,
        "average_salary": company.average_salary,
        "sources": company.sources or [],
        "created_at": company.created_at.isoformat(),
    }


@router.get("/", summary="List all company analyses")
async def list_company_analyses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CompanyAnalysis).order_by(CompanyAnalysis.created_at.desc()).limit(20)
    )
    companies = result.scalars().all()
    return [
        {
            "id": c.id,
            "company_name": c.company_name,
            "overall_rating": c.overall_rating,
            "industry": c.industry,
            "created_at": c.created_at.isoformat(),
        }
        for c in companies
    ]
