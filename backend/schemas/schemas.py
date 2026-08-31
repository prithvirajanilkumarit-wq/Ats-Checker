"""
Pydantic Schemas for all API request/response models
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ── Resume Schemas ────────────────────────────────────────────────────────────

class ResumeUploadResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size_kb: float
    candidate_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    extracted_skills: List[str]
    experience_years: float
    education: List[Dict[str, Any]]
    certifications: List[str]
    projects: List[Dict[str, Any]]
    work_experience: List[Dict[str, Any]]
    summary: Optional[str]
    raw_text: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Job Description Schemas ───────────────────────────────────────────────────

class JobDescriptionCreate(BaseModel):
    raw_text: Optional[str] = None
    source_url: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "raw_text": "We are looking for a Data Analyst with Python, SQL, and Power BI skills...",
                "source_url": None
            }
        }


class JobDescriptionResponse(BaseModel):
    id: int
    title: Optional[str]
    company: Optional[str]
    location: Optional[str]
    source_url: Optional[str]
    source_type: str
    raw_text: str
    required_skills: List[str]
    preferred_skills: List[str]
    experience_required: Optional[str]
    education_required: Optional[str]
    salary_range: Optional[str]
    job_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Analysis Schemas ──────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    resume_id: int
    job_description_id: int


class SourceCitation(BaseModel):
    name: str
    url: str
    date_retrieved: str
    description: Optional[str] = None


class ATSScoreDetail(BaseModel):
    overall_ats_score: float
    skills_match_score: float
    experience_match_score: float
    education_match_score: float
    keyword_match_score: float
    formatting_score: float
    soft_skills_score: float
    hard_skills_score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    matched_skills: List[str]
    missing_skills: List[str]


class MatchScoreDetail(BaseModel):
    match_score: float
    match_category: str   # Low | Medium | High | Very High
    match_reasons: List[str]
    strengths: List[str]
    weaknesses: List[str]


class AISuggestions(BaseModel):
    suggested_skills: List[str]
    recommended_certifications: List[str]
    suggested_projects: List[str]
    resume_rewrite_suggestions: List[str]
    action_verb_suggestions: List[str]
    grammar_suggestions: List[str]
    keyword_suggestions: List[str]
    quantify_suggestions: List[str]


class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    job_description_id: int
    ats_score: ATSScoreDetail
    match_score: MatchScoreDetail
    suggestions: AISuggestions
    created_at: datetime

    class Config:
        from_attributes = True


# ── Company Schemas ───────────────────────────────────────────────────────────

class CompanyAnalysisRequest(BaseModel):
    company_name: Optional[str] = None
    job_url: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "Google",
                "job_url": None
            }
        }


class CompanyRating(BaseModel):
    overall_rating: float
    work_life_balance: float
    salary_satisfaction: float
    career_growth: float
    culture_rating: float
    interview_difficulty: float


class CompanyAnalysisResponse(BaseModel):
    id: int
    company_name: str
    industry: Optional[str]
    founded_year: Optional[str]
    headquarters: Optional[str]
    company_size: Optional[str]
    employee_count: Optional[str]
    website: Optional[str]
    description: Optional[str]
    ratings: CompanyRating
    pros: List[str]
    cons: List[str]
    overall_recommendation: Optional[str]
    salary_range: Optional[str]
    average_salary: Optional[str]
    sources: List[SourceCitation]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Report Schemas ────────────────────────────────────────────────────────────

class ReportRequest(BaseModel):
    analysis_id: int
    report_type: str = Field(..., pattern="^(pdf|excel)$")


class ReportResponse(BaseModel):
    file_name: str
    download_url: str
    report_type: str
    created_at: datetime


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardData(BaseModel):
    ats_score: float
    match_score: float
    match_category: str
    skills_match: float
    experience_match: float
    education_match: float
    keyword_match: float
    formatting_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    matched_keywords: List[str]
    missing_keywords: List[str]
    strengths: List[str]
    weaknesses: List[str]
    suggestions: AISuggestions
    company_rating: Optional[float]
    radar_data: List[Dict[str, Any]]
    bar_data: List[Dict[str, Any]]
