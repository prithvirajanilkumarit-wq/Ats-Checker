import math
from backend.services.ats_analyzer import analyze_ats, ATS_COMPONENT_WEIGHTS
from backend.services.match_scorer import calculate_match_score, _semantic_similarity
from backend.utils.nlp_utils import extract_skills, extract_tech_skills

def test_weights_sum_to_100():
    """Verify that all component weights sum to exactly 1.00 (100%)."""
    total = sum(ATS_COMPONENT_WEIGHTS.values())
    assert math.isclose(total, 1.0, rel_tol=1e-5), f"Weights do not sum to 1.0: {total}"

def test_named_component_mathematical_accuracy():
    """Verify exact mathematical formula with explicit values."""
    raw_scores = {
        "keyword": 57.1,
        "skills": 85.7,
        "experience": 75.0,
        "education": 80.0,
        "formatting": 85.0,
        "soft_skills": 60.0,
    }
    
    expected_sum = (
        57.1 * 0.30 +
        85.7 * 0.25 +
        75.0 * 0.20 +
        80.0 * 0.10 +
        85.0 * 0.10 +
        60.0 * 0.05
    ) # 17.13 + 21.425 + 15.0 + 8.0 + 8.5 + 3.0 = 73.055 -> rounded to 73.1

    computed = sum(raw_scores[k] * ATS_COMPONENT_WEIGHTS[k] for k in ATS_COMPONENT_WEIGHTS)
    assert round(computed, 1) == round(expected_sum, 1)
    assert round(computed, 1) == 73.1

def test_category_order_invariance():
    """Verify that named components prevent positional reordering errors."""
    resume_text = "ADARSH P ANIL. QA/QC Piping Inspector. ASME B31.3, ASME Section IX, AWS D1.1, CSWIP 3.1, NDT, PT, MT, RT, UT, Hydro Test, ITP."
    jd_text = "Looking for QA/QC Inspector with ASME B31.3, AWS D1.1, NDT, Hydro Test."

    res1 = analyze_ats(resume_text, jd_text, {"experience_years": 5.0, "education": []})
    
    assert "score_breakdown" in res1
    breakdown = res1["score_breakdown"]
    
    # Calculate weighted sum independently from breakdown
    independent_sum = sum(v["weighted_contribution"] for v in breakdown.values())
    assert round(independent_sum, 1) == res1["overall_ats_score"]

def test_aws_proximity_and_context_awareness():
    """Verify AWS Cloud and AWS D1.1 contextual coexistence."""
    # Case 1: Welding standard only
    welding_only = "Certified Welding Inspector. Experienced in AWS D1.1 structural welding code and ASME Section IX."
    skills_welding = extract_skills(welding_only)
    assert "AWS D1.1" in skills_welding
    assert "AWS" not in skills_welding  # Standalone cloud AWS must NOT be detected

    # Case 2: Cloud only
    cloud_only = "Senior DevOps Engineer. Deployed microservices on AWS using EC2, S3, and Lambda."
    skills_cloud = extract_skills(cloud_only)
    assert "AWS" in skills_cloud
    assert "AWS D1.1" not in skills_cloud

    # Case 3: Both Welding and Cloud present in resume
    both = "Dual-domain engineer. Certified in AWS D1.1 welding inspection, and also built cloud telemetry on AWS with Python."
    skills_both = extract_skills(both)
    assert "AWS D1.1" in skills_both
    assert "AWS" in skills_both  # Both must be detected cleanly

def test_short_jd_guard_match_score():
    """Verify that short JDs do not artificially depress match score due to sparse text."""
    resume_text = "Python developer with 5 years experience in FastAPI, PostgreSQL, and Docker."
    
    short_jd = "Python developer"
    ats_data = {"overall_ats_score": 85.0, "skills_match_score": 100.0}
    
    match_res = calculate_match_score(resume_text, short_jd, ats_data)
    # Match score should remain strong because short-JD guard protects the candidate
    assert match_res["match_score"] >= 60.0
    assert match_res["semantic_weight"] < 0.40  # Semantic weight was dynamically adjusted
    assert match_res["ats_weight"] > 0.60
