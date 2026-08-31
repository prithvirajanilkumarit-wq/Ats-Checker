"""
SQLAlchemy ORM Models
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base


class Resume(Base):
    """Stores uploaded resume metadata and extracted text."""
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(10), nullable=False)   # pdf | docx
    file_size_kb = Column(Float, default=0.0)

    # Extracted fields
    candidate_name = Column(String(200), nullable=True)
    email = Column(String(200), nullable=True)
    phone = Column(String(50), nullable=True)
    raw_text = Column(Text, nullable=True)
    extracted_skills = Column(JSON, default=list)
    experience_years = Column(Float, default=0.0)
    education = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    work_experience = Column(JSON, default=list)
    languages = Column(JSON, default=list)
    summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")


class JobDescription(Base):
    """Stores job descriptions — pasted text or scraped from URL."""
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=True)
    company = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    source_url = Column(String(1000), nullable=True)
    source_type = Column(String(50), default="manual")  # manual | linkedin | naukri | indeed
    raw_text = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    experience_required = Column(String(100), nullable=True)
    education_required = Column(String(200), nullable=True)
    salary_range = Column(String(200), nullable=True)
    job_type = Column(String(100), nullable=True)  # full-time | part-time | contract

    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("ResumeAnalysis", back_populates="job_description", cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    """Stores complete analysis results for a resume + JD pair."""
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)

    # Scores (0-100)
    ats_score = Column(Float, default=0.0)
    match_score = Column(Float, default=0.0)
    skills_match_score = Column(Float, default=0.0)
    experience_match_score = Column(Float, default=0.0)
    education_match_score = Column(Float, default=0.0)
    keyword_match_score = Column(Float, default=0.0)
    formatting_score = Column(Float, default=0.0)
    soft_skills_score = Column(Float, default=0.0)
    hard_skills_score = Column(Float, default=0.0)

    # Match category
    match_category = Column(String(20), default="Low")  # Low | Medium | High | Very High

    # Matched / Missing
    matched_keywords = Column(JSON, default=list)
    missing_keywords = Column(JSON, default=list)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)

    # Analysis details
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    match_reasons = Column(JSON, default=list)

    # AI Suggestions
    suggested_skills = Column(JSON, default=list)
    recommended_certifications = Column(JSON, default=list)
    suggested_projects = Column(JSON, default=list)
    resume_rewrite_suggestions = Column(JSON, default=list)
    action_verb_suggestions = Column(JSON, default=list)
    grammar_suggestions = Column(JSON, default=list)
    keyword_suggestions = Column(JSON, default=list)
    quantify_suggestions = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    resume = relationship("Resume", back_populates="analyses")
    job_description = relationship("JobDescription", back_populates="analyses")
    report = relationship("SavedReport", back_populates="analysis", uselist=False, cascade="all, delete-orphan")


class CompanyAnalysis(Base):
    """Stores company analysis results."""
    __tablename__ = "company_analyses"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(300), nullable=False)
    industry = Column(String(200), nullable=True)
    founded_year = Column(String(20), nullable=True)
    headquarters = Column(String(300), nullable=True)
    company_size = Column(String(100), nullable=True)
    employee_count = Column(String(100), nullable=True)
    website = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    # Ratings (0-10)
    overall_rating = Column(Float, default=0.0)
    work_life_balance = Column(Float, default=0.0)
    salary_satisfaction = Column(Float, default=0.0)
    career_growth = Column(Float, default=0.0)
    culture_rating = Column(Float, default=0.0)
    interview_difficulty = Column(Float, default=0.0)

    # Review summaries
    pros = Column(JSON, default=list)
    cons = Column(JSON, default=list)
    overall_recommendation = Column(Text, nullable=True)

    # Salary info
    salary_range = Column(String(200), nullable=True)
    average_salary = Column(String(200), nullable=True)

    # Sources
    sources = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)


class SavedReport(Base):
    """Stores exported report file paths."""
    __tablename__ = "saved_reports"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id", ondelete="CASCADE"), nullable=False)
    report_type = Column(String(20), nullable=False)   # pdf | excel
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("ResumeAnalysis", back_populates="report")
