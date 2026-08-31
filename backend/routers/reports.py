"""
Reports Router — download PDF and Excel reports
"""
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models.models import ResumeAnalysis, SavedReport
from backend.services.report_exporter import generate_pdf_report, generate_excel_report
from backend.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/generate", summary="Generate a PDF or Excel report")
async def generate_report(
    analysis_id: int,
    report_type: str = "pdf",
    db: AsyncSession = Depends(get_db),
):
    """
    Generate and return a downloadable analysis report.
    report_type: 'pdf' or 'excel'
    """
    if report_type not in ("pdf", "excel"):
        raise HTTPException(status_code=400, detail="report_type must be 'pdf' or 'excel'")

    # Load analysis
    result = await db.execute(select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Build data dict
    analysis_data = {
        "ats_score": {
            "overall_ats_score": analysis.ats_score,
            "skills_match_score": analysis.skills_match_score,
            "experience_match_score": analysis.experience_match_score,
            "education_match_score": analysis.education_match_score,
            "keyword_match_score": analysis.keyword_match_score,
            "formatting_score": analysis.formatting_score,
            "soft_skills_score": analysis.soft_skills_score,
            "hard_skills_score": analysis.hard_skills_score,
            "matched_skills": analysis.matched_skills or [],
            "missing_skills": analysis.missing_skills or [],
            "matched_keywords": analysis.matched_keywords or [],
            "missing_keywords": analysis.missing_keywords or [],
        },
        "match_score": {
            "match_score": analysis.match_score,
            "match_category": analysis.match_category,
            "match_reasons": analysis.match_reasons or [],
            "strengths": analysis.strengths or [],
            "weaknesses": analysis.weaknesses or [],
        },
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
    }

    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    if report_type == "pdf":
        filename = f"report_{analysis_id}_{ts}.pdf"
        file_path = generate_pdf_report(analysis_data, filename)
        media_type = "application/pdf"
    else:
        filename = f"report_{analysis_id}_{ts}.xlsx"
        file_path = generate_excel_report(analysis_data, filename)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    if not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="Report generation failed")

    # Save record
    report = SavedReport(
        analysis_id=analysis_id,
        report_type=report_type,
        file_path=file_path,
        file_name=filename,
    )
    db.add(report)
    await db.commit()

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename,
    )
