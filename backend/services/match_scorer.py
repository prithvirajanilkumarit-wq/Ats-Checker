"""
Resume Match Scorer — Sentence Transformers cosine similarity + rule-based matching
"""
from typing import Dict, Any, List, Tuple
from backend.utils.nlp_utils import extract_skills, extract_tech_skills
from backend.utils.logger import get_logger
import math

logger = get_logger(__name__)

# Lazy-loaded model
_model = None


def _get_model():
    """Lazy load Sentence Transformer model with fast fallback handling."""
    global _model
    if _model is None:
        try:
            import os
            if os.environ.get("TRANSFORMERS_OFFLINE") == "1":
                _model = "fallback"
                return _model
            os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
            from sentence_transformers import SentenceTransformer
            try:
                _model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
            except Exception:
                _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer model loaded successfully.")
        except Exception as e:
            logger.warning(f"SentenceTransformer unavailable ({e}). Using TF-IDF similarity fallback.")
            _model = "fallback"
    return _model


def _cosine_similarity_numpy(a, b) -> float:
    """Cosine similarity between two vectors."""
    import numpy as np
    a = np.array(a)
    b = np.array(b)
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def calculate_match_score(
    resume_text: str,
    jd_text: str,
    ats_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Calculate Resume Match Score using:
      - Semantic similarity (Sentence Transformers)
      - ATS component scores (weighted)
      - Skills overlap
    """
    # 1. Semantic similarity
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
    """Calculate semantic similarity using SentenceTransformer or TF-IDF fallback."""
    model = _get_model()

    if model == "fallback":
        return _tfidf_similarity(text1, text2)

    try:
        emb1 = model.encode(text1[:3000], convert_to_tensor=False)
        emb2 = model.encode(text2[:3000], convert_to_tensor=False)
        sim = _cosine_similarity_numpy(emb1, emb2)
        return sim * 100
    except Exception as e:
        logger.warning(f"Semantic similarity error: {e}. Using TF-IDF fallback.")
        return _tfidf_similarity(text1, text2)


def _tfidf_similarity(text1: str, text2: str) -> float:
    """TF-IDF cosine similarity as fallback."""
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
        matrix = vectorizer.fit_transform([text1[:5000], text2[:5000]])
        sim = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
        return float(sim) * 100
    except Exception as e:
        logger.error(f"TF-IDF fallback also failed: {e}")
        return 50.0


def _score_to_category(score: float) -> str:
    """Convert numeric score to categorical label."""
    if score >= 80:
        return "Very High"
    elif score >= 60:
        return "High"
    elif score >= 40:
        return "Medium"
    else:
        return "Low"


def _generate_reasons(
    ats_data: Dict[str, Any],
    final_score: float,
) -> Tuple[List[str], List[str], List[str]]:
    """
    Generate human-readable match reasons, strengths, and weaknesses.
    """
    reasons = []
    strengths = []
    weaknesses = []

    # Skills
    matched_skills = ats_data.get("matched_skills", [])
    missing_skills = ats_data.get("missing_skills", [])

    if matched_skills:
        top_matched = matched_skills[:5]
        strengths.append(f"Strong skill match: {', '.join(top_matched)}")
        reasons.append(f"✅ Matched skills: {', '.join(top_matched)}")

    if missing_skills:
        top_missing = missing_skills[:5]
        weaknesses.append(f"Missing skills: {', '.join(top_missing)}")
        reasons.append(f"❌ Missing skills: {', '.join(top_missing)}")

    # Experience
    exp_score = ats_data.get("experience_match_score", 0)
    if exp_score >= 80:
        strengths.append("Experience level meets job requirements")
        reasons.append("✅ Relevant experience detected")
    elif exp_score < 50:
        weaknesses.append("Experience level may not meet requirements")
        reasons.append("⚠️ Limited relevant experience")

    # Education
    edu_score = ats_data.get("education_match_score", 0)
    if edu_score >= 80:
        strengths.append("Education qualification matches requirements")
    elif edu_score < 50:
        weaknesses.append("Education may not fully match requirements")

    # Keywords
    keyword_score = ats_data.get("keyword_match_score", 0)
    if keyword_score >= 70:
        strengths.append(f"High keyword alignment ({keyword_score:.0f}%)")
    elif keyword_score < 40:
        weaknesses.append("Low keyword alignment with job description")

    # Formatting
    fmt_score = ats_data.get("formatting_score", 0)
    if fmt_score >= 80:
        strengths.append("Resume formatting is ATS-friendly")
    elif fmt_score < 60:
        weaknesses.append("Resume formatting needs improvement for ATS")

    # Missing keywords
    missing_kws = ats_data.get("missing_keywords", [])[:4]
    if missing_kws:
        reasons.append(f"❌ Missing keywords: {', '.join(missing_kws)}")

    return reasons, strengths, weaknesses
