"""
ATS Analyzer Service — calculates ATS score components
"""
from typing import Dict, Any, List, Tuple
from backend.utils.nlp_utils import (
    extract_skills, extract_tech_skills, extract_soft_skills,
    extract_keywords, check_resume_formatting,
)
from backend.utils.logger import get_logger
import re

logger = get_logger(__name__)


ATS_COMPONENT_WEIGHTS = {
    "keyword": 0.30,
    "skills": 0.25,
    "experience": 0.20,
    "education": 0.10,
    "formatting": 0.10,
    "soft_skills": 0.05,
}


def analyze_ats(resume_text: str, jd_text: str, resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Full ATS analysis pipeline.

    Returns comprehensive ATS score breakdown with named component contributions.
    """
    logger.info("Starting ATS analysis...")

    # 1. Keyword match
    keyword_score, matched_kws, missing_kws = _keyword_match_score(resume_text, jd_text)

    # 2. Skills match
    skills_score, matched_skills, missing_skills = _skills_match_score(resume_text, jd_text)

    # 3. Soft skills
    soft_score = _soft_skills_score(resume_text, jd_text)

    # 4. Hard skills
    hard_score = _hard_skills_score(resume_text, jd_text)

    # 5. Experience match
    exp_score = _experience_match_score(resume_text, jd_text, resume_data.get("experience_years", 0))

    # 6. Education match
    edu_score = _education_match_score(resume_text, jd_text, resume_data.get("education", []))

    # 7. Formatting
    fmt_score, fmt_issues = check_resume_formatting(resume_text)

    # 8. Named Components Breakdown & Authoritative Overall ATS Score
    score_breakdown = {
        "keyword": {
            "raw_score": round(keyword_score, 1),
            "weight": ATS_COMPONENT_WEIGHTS["keyword"],
            "weighted_contribution": round(keyword_score * ATS_COMPONENT_WEIGHTS["keyword"], 2),
        },
        "skills": {
            "raw_score": round(skills_score, 1),
            "weight": ATS_COMPONENT_WEIGHTS["skills"],
            "weighted_contribution": round(skills_score * ATS_COMPONENT_WEIGHTS["skills"], 2),
        },
        "experience": {
            "raw_score": round(exp_score, 1),
            "weight": ATS_COMPONENT_WEIGHTS["experience"],
            "weighted_contribution": round(exp_score * ATS_COMPONENT_WEIGHTS["experience"], 2),
        },
        "education": {
            "raw_score": round(edu_score, 1),
            "weight": ATS_COMPONENT_WEIGHTS["education"],
            "weighted_contribution": round(edu_score * ATS_COMPONENT_WEIGHTS["education"], 2),
        },
        "formatting": {
            "raw_score": round(fmt_score, 1),
            "weight": ATS_COMPONENT_WEIGHTS["formatting"],
            "weighted_contribution": round(fmt_score * ATS_COMPONENT_WEIGHTS["formatting"], 2),
        },
        "soft_skills": {
            "raw_score": round(soft_score, 1),
            "weight": ATS_COMPONENT_WEIGHTS["soft_skills"],
            "weighted_contribution": round(soft_score * ATS_COMPONENT_WEIGHTS["soft_skills"], 2),
        },
    }

    overall_ats = sum(c["weighted_contribution"] for c in score_breakdown.values())
    overall_ats = round(min(100.0, max(0.0, overall_ats)), 1)

    result = {
        "overall_ats_score": overall_ats,
        "skills_match_score": round(skills_score, 1),
        "experience_match_score": round(exp_score, 1),
        "education_match_score": round(edu_score, 1),
        "keyword_match_score": round(keyword_score, 1),
        "formatting_score": round(fmt_score, 1),
        "soft_skills_score": round(soft_score, 1),
        "hard_skills_score": round(hard_score, 1),
        "matched_keywords": matched_kws[:20],
        "missing_keywords": missing_kws[:20],
        "matched_skills": matched_skills[:20],
        "missing_skills": missing_skills[:20],
        "formatting_issues": fmt_issues,
        "score_breakdown": score_breakdown,
    }

    logger.info(f"ATS Analysis complete. Overall: {overall_ats}")
    return result


def _keyword_match_score(resume_text: str, jd_text: str) -> Tuple[float, List[str], List[str]]:
    """
    Calculate keyword overlap between resume and JD.
    """
    jd_keywords = set(extract_keywords(jd_text, top_n=60))
    resume_keywords = set(extract_keywords(resume_text, top_n=100))

    matched = list(jd_keywords & resume_keywords)
    missing = list(jd_keywords - resume_keywords)

    score = (len(matched) / max(len(jd_keywords), 1)) * 100
    return round(score, 1), sorted(matched), sorted(missing)


def _skills_match_score(resume_text: str, jd_text: str) -> Tuple[float, List[str], List[str]]:
    """Skills overlap analysis."""
    jd_skills = set(extract_skills(jd_text))
    resume_skills = set(extract_skills(resume_text))

    if not jd_skills:
        return 50.0, list(resume_skills), []

    matched = list(jd_skills & resume_skills)
    missing = list(jd_skills - resume_skills)

    score = (len(matched) / max(len(jd_skills), 1)) * 100
    return round(score, 1), sorted(matched), sorted(missing)


def _soft_skills_score(resume_text: str, jd_text: str) -> float:
    """Soft skills match."""
    jd_soft = set(extract_soft_skills(jd_text))
    resume_soft = set(extract_soft_skills(resume_text))

    if not jd_soft:
        return 60.0

    matched = jd_soft & resume_soft
    return round((len(matched) / max(len(jd_soft), 1)) * 100, 1)


def _hard_skills_score(resume_text: str, jd_text: str) -> float:
    """Hard/technical skills match."""
    jd_hard = set(extract_tech_skills(jd_text))
    resume_hard = set(extract_tech_skills(resume_text))

    if not jd_hard:
        return 50.0

    matched = jd_hard & resume_hard
    return round((len(matched) / max(len(jd_hard), 1)) * 100, 1)


def _experience_match_score(resume_text: str, jd_text: str, resume_exp: float) -> float:
    """Match candidate's experience against JD requirements."""
    try:
        resume_exp = float(resume_exp) if resume_exp is not None else 0.0
    except (ValueError, TypeError):
        resume_exp = 0.0

    # Extract required experience from JD
    patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
        r'(\d+)\s*to\s*(\d+)\s*years?',
        r'minimum\s+(\d+)\s*years?',
        r'at\s+least\s+(\d+)\s*years?',
    ]
    required_min = 0
    required_max = 10

    for pattern in patterns:
        matches = re.findall(pattern, jd_text.lower())
        if matches:
            try:
                if isinstance(matches[0], tuple):
                    required_min = int(matches[0][0])
                    required_max = int(matches[0][1]) if len(matches[0]) > 1 else required_min + 2
                else:
                    required_min = int(matches[0])
                    required_max = required_min + 2
                break
            except (ValueError, IndexError):
                continue

    if required_min == 0:
        return 75.0  # No requirement stated — assume okay

    if resume_exp == 0:
        return 40.0  # Unknown experience

    if resume_exp >= required_min:
        if resume_exp <= required_max + 5:  # Some buffer
            return 100.0
        else:
            return 85.0  # Overqualified
    else:
        ratio = resume_exp / max(required_min, 1)
        return round(ratio * 80, 1)


def _education_match_score(resume_text: str, jd_text: str, education: list) -> float:
    """Match education level."""
    import re
    jd_lower = jd_text.lower()
    resume_lower = resume_text.lower()

    # Check if JD requires specific degree (using word boundaries to prevent matching 'mastery')
    degree_map = {
        "phd": 4, "doctorate": 4,
        "master": 3, "m.tech": 3, "m.sc": 3, "mba": 3, "mca": 3,
        "bachelor": 2, "b.tech": 2, "b.sc": 2, "bca": 2, "b.e": 2,
        "diploma": 1,
    }

    jd_max_level = 0
    for deg, level in degree_map.items():
        pattern = rf"\b{re.escape(deg)}s?\b"
        if re.search(pattern, jd_lower):
            jd_max_level = max(jd_max_level, level)

    resume_max_level = 0
    for deg, level in degree_map.items():
        pattern = rf"\b{re.escape(deg)}s?\b"
        if re.search(pattern, resume_lower):
            resume_max_level = max(resume_max_level, level)

    if jd_max_level == 0:
        return 80.0  # No specific requirement

    if resume_max_level >= jd_max_level:
        return 100.0
    elif resume_max_level == jd_max_level - 1:
        return 70.0
    else:
        return 40.0
