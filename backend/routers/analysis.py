"""
Analysis Router — ATS scoring, match scoring, AI suggestions, dashboard data
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models.models import Resume, JobDescription, ResumeAnalysis
from backend.schemas.schemas import (
    AnalysisRequest, AnalysisResponse,
    ATSScoreDetail, MatchScoreDetail, AISuggestions, DashboardData,
)
from backend.services.ats_analyzer import analyze_ats
from backend.services.match_scorer import calculate_match_score
from backend.services.ai_suggestions import generate_suggestions
from backend.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/run", summary="Run full resume analysis")
async def run_analysis(body: AnalysisRequest, db: AsyncSession = Depends(get_db)):
    """
    Run complete analysis pipeline:
    1. Load resume and job description from DB
    2. Run ATS analysis
    3. Calculate match score
    4. Generate AI suggestions
    5. Save and return all results
    """
    # Load resume
    result = await db.execute(select(Resume).where(Resume.id == body.resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail=f"Resume {body.resume_id} not found")

    # Load JD
    result = await db.execute(select(JobDescription).where(JobDescription.id == body.job_description_id))
    jd = result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail=f"Job description {body.job_description_id} not found")

    resume_text = resume.raw_text or ""
    jd_text = jd.raw_text or ""

    if not resume_text:
        raise HTTPException(status_code=422, detail="Resume text is empty. Please re-upload.")

    logger.info(f"Running analysis: Resume {resume.id} vs JD {jd.id}")

    import asyncio

    # 1. ATS Analysis (Fast rule-based matching, ~0.05s)
    ats_data = analyze_ats(resume_text, jd_text, {
        "experience_years": resume.experience_years or 0,
        "education": resume.education or [],
    })

    # 2 & 3. Run Match Scoring and AI Suggestions concurrently in parallel with safety timeout
    try:
        match_task = asyncio.to_thread(calculate_match_score, resume_text, jd_text, ats_data)
        suggestions_task = generate_suggestions(resume_text, jd_text, ats_data)
        match_data, suggestions_data = await asyncio.wait_for(asyncio.gather(match_task, suggestions_task), timeout=5.0)
    except Exception as e:
        logger.warning(f"Analysis gather warning: {e}. Using fast fallback scoring.")
        from backend.services.ai_suggestions import _rule_based_suggestions
        match_data = calculate_match_score(resume_text, jd_text, ats_data)
        suggestions_data = _rule_based_suggestions(ats_data)

    # 4. Save to DB
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        job_description_id=jd.id,
        ats_score=ats_data["overall_ats_score"],
        match_score=match_data["match_score"],
        skills_match_score=ats_data["skills_match_score"],
        experience_match_score=ats_data["experience_match_score"],
        education_match_score=ats_data["education_match_score"],
        keyword_match_score=ats_data["keyword_match_score"],
        formatting_score=ats_data["formatting_score"],
        soft_skills_score=ats_data["soft_skills_score"],
        hard_skills_score=ats_data["hard_skills_score"],
        match_category=match_data["match_category"],
        matched_keywords=ats_data["matched_keywords"],
        missing_keywords=ats_data["missing_keywords"],
        matched_skills=ats_data["matched_skills"],
        missing_skills=ats_data["missing_skills"],
        strengths=match_data["strengths"],
        weaknesses=match_data["weaknesses"],
        match_reasons=match_data["match_reasons"],
        suggested_skills=suggestions_data["suggested_skills"],
        recommended_certifications=suggestions_data["recommended_certifications"],
        suggested_projects=suggestions_data["suggested_projects"],
        resume_rewrite_suggestions=suggestions_data["resume_rewrite_suggestions"],
        action_verb_suggestions=suggestions_data["action_verb_suggestions"],
        grammar_suggestions=suggestions_data["grammar_suggestions"],
        keyword_suggestions=suggestions_data["keyword_suggestions"],
        quantify_suggestions=suggestions_data["quantify_suggestions"],
    )

    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    logger.info(f"Analysis complete. ID: {analysis.id}. ATS: {analysis.ats_score} Match: {analysis.match_score}")

    return _build_response(analysis, ats_data, match_data, suggestions_data)


@router.get("/{analysis_id}", summary="Get saved analysis by ID")
async def get_analysis(analysis_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a previously run analysis."""
    result = await db.execute(select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    ats_data = {
        "overall_ats_score": analysis.ats_score,
        "skills_match_score": analysis.skills_match_score,
        "experience_match_score": analysis.experience_match_score,
        "education_match_score": analysis.education_match_score,
        "keyword_match_score": analysis.keyword_match_score,
        "formatting_score": analysis.formatting_score,
        "soft_skills_score": analysis.soft_skills_score,
        "hard_skills_score": analysis.hard_skills_score,
        "matched_keywords": analysis.matched_keywords or [],
        "missing_keywords": analysis.missing_keywords or [],
        "matched_skills": analysis.matched_skills or [],
        "missing_skills": analysis.missing_skills or [],
    }
    match_data = {
        "match_score": analysis.match_score,
        "match_category": analysis.match_category,
        "match_reasons": analysis.match_reasons or [],
        "strengths": analysis.strengths or [],
        "weaknesses": analysis.weaknesses or [],
    }
    suggestions_data = {
        "suggested_skills": analysis.suggested_skills or [],
        "recommended_certifications": analysis.recommended_certifications or [],
        "suggested_projects": analysis.suggested_projects or [],
        "resume_rewrite_suggestions": analysis.resume_rewrite_suggestions or [],
        "action_verb_suggestions": analysis.action_verb_suggestions or [],
        "grammar_suggestions": analysis.grammar_suggestions or [],
        "keyword_suggestions": analysis.keyword_suggestions or [],
        "quantify_suggestions": analysis.quantify_suggestions or [],
    }
    return _build_response(analysis, ats_data, match_data, suggestions_data)


@router.get("/{analysis_id}/dashboard", summary="Get dashboard data")
async def get_dashboard_data(analysis_id: int, db: AsyncSession = Depends(get_db)):
    """Returns formatted data for the dashboard charts."""
    result = await db.execute(select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    radar_data = [
        {"metric": "Skills", "score": analysis.skills_match_score, "fullMark": 100},
        {"metric": "Experience", "score": analysis.experience_match_score, "fullMark": 100},
        {"metric": "Education", "score": analysis.education_match_score, "fullMark": 100},
        {"metric": "Keywords", "score": analysis.keyword_match_score, "fullMark": 100},
        {"metric": "Formatting", "score": analysis.formatting_score, "fullMark": 100},
        {"metric": "Soft Skills", "score": analysis.soft_skills_score, "fullMark": 100},
    ]

    bar_data = [
        {"name": "ATS Score", "value": analysis.ats_score, "fill": "#1E40AF"},
        {"name": "Match Score", "value": analysis.match_score, "fill": "#3B82F6"},
        {"name": "Skills", "value": analysis.skills_match_score, "fill": "#60A5FA"},
        {"name": "Experience", "value": analysis.experience_match_score, "fill": "#93C5FD"},
        {"name": "Education", "value": analysis.education_match_score, "fill": "#BFDBFE"},
        {"name": "Keywords", "value": analysis.keyword_match_score, "fill": "#DBEAFE"},
    ]

    return {
        "ats_score": analysis.ats_score,
        "match_score": analysis.match_score,
        "match_category": analysis.match_category,
        "skills_match": analysis.skills_match_score,
        "experience_match": analysis.experience_match_score,
        "education_match": analysis.education_match_score,
        "keyword_match": analysis.keyword_match_score,
        "formatting_score": analysis.formatting_score,
        "matched_skills": analysis.matched_skills or [],
        "missing_skills": analysis.missing_skills or [],
        "matched_keywords": analysis.matched_keywords or [],
        "missing_keywords": analysis.missing_keywords or [],
        "strengths": analysis.strengths or [],
        "weaknesses": analysis.weaknesses or [],
        "suggestions": {
            "suggested_skills": analysis.suggested_skills or [],
            "recommended_certifications": analysis.recommended_certifications or [],
            "suggested_projects": analysis.suggested_projects or [],
            "resume_rewrite_suggestions": analysis.resume_rewrite_suggestions or [],
            "action_verb_suggestions": analysis.action_verb_suggestions or [],
            "grammar_suggestions": analysis.grammar_suggestions or [],
            "keyword_suggestions": analysis.keyword_suggestions or [],
            "quantify_suggestions": analysis.quantify_suggestions or [],
        },
        "company_rating": None,
        "radar_data": radar_data,
        "bar_data": bar_data,
    }


@router.get("/", summary="List all analyses")
async def list_analyses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).limit(20)
    )
    analyses = result.scalars().all()
    return [
        {
            "id": a.id,
            "resume_id": a.resume_id,
            "job_description_id": a.job_description_id,
            "ats_score": a.ats_score,
            "match_score": a.match_score,
            "match_category": a.match_category,
            "created_at": a.created_at.isoformat(),
        }
        for a in analyses
    ]


def _build_response(analysis, ats_data, match_data, suggestions_data):
    """Build the full analysis response dict."""
    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "job_description_id": analysis.job_description_id,
        "ats_score": {
            "overall_ats_score": ats_data["overall_ats_score"],
            "skills_match_score": ats_data["skills_match_score"],
            "experience_match_score": ats_data["experience_match_score"],
            "education_match_score": ats_data["education_match_score"],
            "keyword_match_score": ats_data["keyword_match_score"],
            "formatting_score": ats_data["formatting_score"],
            "soft_skills_score": ats_data["soft_skills_score"],
            "hard_skills_score": ats_data["hard_skills_score"],
            "matched_keywords": ats_data["matched_keywords"],
            "missing_keywords": ats_data["missing_keywords"],
            "matched_skills": ats_data["matched_skills"],
            "missing_skills": ats_data["missing_skills"],
        },
        "match_score": {
            "match_score": match_data["match_score"],
            "match_category": match_data["match_category"],
            "match_reasons": match_data["match_reasons"],
            "strengths": match_data["strengths"],
            "weaknesses": match_data["weaknesses"],
        },
        "suggestions": suggestions_data,
        "created_at": analysis.created_at.isoformat(),
    }
