"""
Resume Match Scorer — High-speed TF-IDF Cosine Similarity + Rule-based matching
"""
from typing import Dict, Any, List, Tuple
from backend.utils.nlp_utils import extract_skills, extract_tech_skills
from backend.utils.logger import get_logger
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import math

logger = get_logger(__name__)


def calculate_match_score(
    resume_text: str,
    jd_text: str,
    ats_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Calculate Resume Match Score using:
      - High-speed TF-IDF Cosine Similarity (ultra-lightweight memory footprint)
      - ATS component scores (weighted)
      - Skills overlap & gap analysis
    """
    # 1. Semantic TF-IDF similarity
    semantic_score = _semantic_similarity(resume_text, jd_text)

    # 2. Weighted score from ATS components
    ats_weighted = (
        ats_data.get("skills_match_score", 0) * 0.30 +
        ats_data.get("experience_match_score", 0) * 0.25 +
        ats_data.get("keyword_match_score", 0) * 0.20 +
        ats_data.get("education_match_score", 0) * 0.10 +
        ats_data.get("soft_skills_score", 0) * 0.10 +
        ats_data.get("formatting_score", 0) * 0.05
    )

    # 3. Combine
    final_score = (semantic_score * 0.40 + ats_weighted * 0.60)
    final_score = round(min(100.0, max(0.0, final_score)), 1)

    # 4. Category
    category = _score_to_category(final_score)

    # 5. Reasons
    reasons, strengths, weaknesses = _generate_reasons(ats_data, final_score)

    return {
        "match_score": final_score,
        "match_category": category,
        "match_reasons": reasons,
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


def _semantic_similarity(text1: str, text2: str) -> float:
    """Calculate semantic similarity using high-speed TF-IDF cosine similarity (1ms execution)."""
    if not text1.strip() or not text2.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
        tfidf_matrix = vectorizer.fit_transform([text1[:2000], text2[:2000]])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(sim) * 100, 1)
    except Exception as e:
        logger.warning(f"Semantic similarity fallback error: {e}")
        return 50.0


def _score_to_category(score: float) -> str:
    if score >= 80:
        return "Very High Match"
    elif score >= 60:
        return "High Match"
    elif score >= 40:
        return "Medium Match"
    else:
        return "Low Match"


def _generate_reasons(
    ats: Dict[str, Any],
    final_score: float,
) -> Tuple[List[str], List[str], List[str]]:
    reasons = []
    strengths = []
    weaknesses = []

    skills_score = ats.get("skills_match_score", 0)
    exp_score = ats.get("experience_match_score", 0)
    fmt_score = ats.get("formatting_score", 0)
    matched = ats.get("matched_skills", [])
    missing = ats.get("missing_skills", [])

    if skills_score >= 70:
        strengths.append(f"Strong skill alignment — {len(matched)} key skills matched.")
    else:
        weaknesses.append(f"Missing {len(missing)} required skills specified in the job posting.")

    if exp_score >= 80:
        strengths.append("Experience matches or exceeds job requirements.")
    elif exp_score >= 50:
        strengths.append("Partial experience overlap with requirement.")
    else:
        weaknesses.append("Experience duration appears lower than required.")

    if fmt_score >= 80:
        strengths.append("Resume is well-structured and easy for ATS parsers to scan.")
    else:
        weaknesses.append("Resume formatting could be improved for ATS readability.")

    if final_score >= 75:
        reasons.append("Your resume is highly competitive for this role.")
    elif final_score >= 50:
        reasons.append("Moderate match. Adding missing skills will significantly boost your score.")
    else:
        reasons.append("Significant gaps identified. Consider tailoring your resume to highlight relevant keywords.")

    return reasons, strengths, weaknesses
