"""
AI Suggestions Service — OpenAI GPT powered with rule-based fallback
"""
from typing import Dict, Any, List
from backend.config import settings
from backend.utils.logger import get_logger
from tenacity import retry, stop_after_attempt, wait_exponential

logger = get_logger(__name__)


async def generate_suggestions(
    resume_text: str,
    jd_text: str,
    ats_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate AI-powered resume improvement suggestions.
    Prioritizes Gemini Pro (with 4.5s timeout protection), then falls back to rule-based suggestions.
    """
    if not settings.ENABLE_AI_SUGGESTIONS:
        return _rule_based_suggestions(ats_data)

    if settings.has_gemini:
        try:
            logger.info("Generating AI suggestions via Google Gemini Pro...")
            import asyncio
            return await asyncio.wait_for(_gemini_suggestions(resume_text, jd_text, ats_data), timeout=2.5)
        except Exception as e:
            logger.warning(f"Gemini Pro note: {e}. Returning fast rule-based suggestions.")
            return _rule_based_suggestions(ats_data)

    if settings.has_openai:
        try:
            logger.info("Generating AI suggestions via OpenAI GPT-4...")
            import asyncio
            return await asyncio.wait_for(_openai_suggestions(resume_text, jd_text, ats_data), timeout=4.5)
        except Exception as e:
            logger.warning(f"OpenAI suggestions note: {e}. Using fast rule-based suggestions.")

    logger.info("Using rule-based suggestions engine.")
    return _rule_based_suggestions(ats_data)


async def _gemini_suggestions(
    resume_text: str,
    jd_text: str,
    ats_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Call Google Gemini Pro API for detailed resume suggestions with fast fallback."""
    import httpx
    import json

    missing_skills = ", ".join(ats_data.get("missing_skills", [])[:10])
    matched_skills = ", ".join(ats_data.get("matched_skills", [])[:10])

    prompt = f"""You are an expert career coach and ATS specialist.

RESUME TEXT (first 1500 chars):
{resume_text[:1500]}

JOB DESCRIPTION (first 1000 chars):
{jd_text[:1000]}

ANALYSIS CONTEXT:
- ATS Score: {ats_data.get('overall_ats_score', 0):.1f}/100
- Matched Skills: {matched_skills}
- Missing Skills: {missing_skills}

Please provide actionable resume improvement suggestions in this EXACT JSON format:
{{
  "suggested_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "recommended_certifications": ["cert1", "cert2", "cert3"],
  "suggested_projects": ["project idea 1", "project idea 2", "project idea 3"],
  "resume_rewrite_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"],
  "action_verb_suggestions": ["Led", "Developed", "Implemented", "Achieved", "Optimized"],
  "grammar_suggestions": ["suggestion 1", "suggestion 2"],
  "keyword_suggestions": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "quantify_suggestions": ["suggestion 1 with specific example", "suggestion 2 with specific example"]
}}

Return ONLY valid JSON. No markdown, no explanation."""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2,
            "maxOutputTokens": 1500,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                logger.warning(f"Gemini API status {response.status_code}. Using fast rule-based suggestions.")
                return _rule_based_suggestions(ats_data)
            res_json = response.json()
            raw_content = res_json["candidates"][0]["content"]["parts"][0]["text"].strip()
            if raw_content.startswith("```"):
                parts = raw_content.split("```")
                if len(parts) >= 2:
                    raw_content = parts[1]
                    if raw_content.startswith("json"):
                        raw_content = raw_content[4:]
                    raw_content = raw_content.strip()
            data = json.loads(raw_content)
            return _validate_suggestions(data)
    except Exception as e:
        logger.warning(f"Gemini API error: {e}. Using fast rule-based suggestions.")
        return _rule_based_suggestions(ats_data)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def _openai_suggestions(
    resume_text: str,
    jd_text: str,
    ats_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Call OpenAI API for detailed resume suggestions."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    missing_skills = ", ".join(ats_data.get("missing_skills", [])[:10])
    matched_skills = ", ".join(ats_data.get("matched_skills", [])[:10])

    prompt = f"""You are an expert career coach and ATS specialist.

RESUME TEXT (first 1500 chars):
{resume_text[:1500]}

JOB DESCRIPTION (first 1000 chars):
{jd_text[:1000]}

ANALYSIS CONTEXT:
- ATS Score: {ats_data.get('overall_ats_score', 0):.1f}/100
- Matched Skills: {matched_skills}
- Missing Skills: {missing_skills}

Please provide actionable resume improvement suggestions in this EXACT JSON format:
{{
  "suggested_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "recommended_certifications": ["cert1", "cert2", "cert3"],
  "suggested_projects": ["project idea 1", "project idea 2", "project idea 3"],
  "resume_rewrite_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"],
  "action_verb_suggestions": ["Led", "Developed", "Implemented", "Achieved", "Optimized"],
  "grammar_suggestions": ["suggestion 1", "suggestion 2"],
  "keyword_suggestions": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "quantify_suggestions": ["suggestion 1 with specific example", "suggestion 2 with specific example"]
}}

Return ONLY valid JSON. No markdown, no explanation."""

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=settings.OPENAI_MAX_TOKENS,
        temperature=settings.OPENAI_TEMPERATURE,
        response_format={"type": "json_object"},
    )

    import json
    content = response.choices[0].message.content
    data = json.loads(content)
    return _validate_suggestions(data)


def _rule_based_suggestions(ats_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Rule-based suggestions when OpenAI is unavailable.
    Uses analysis data to generate contextually relevant suggestions.
    """
    missing_skills = ats_data.get("missing_skills", [])
    missing_keywords = ats_data.get("missing_keywords", [])
    ats_score = ats_data.get("overall_ats_score", 0)

    # Suggest missing skills
    suggested_skills = missing_skills[:8] if missing_skills else [
        "Python", "SQL", "Data Visualization", "Machine Learning", "Excel"
    ]

    # Certification recommendations
    cert_map = {
        "aws": "AWS Certified Solutions Architect",
        "azure": "Microsoft Azure Fundamentals (AZ-900)",
        "python": "Python for Data Science (Coursera)",
        "machine learning": "Machine Learning Specialization (Coursera)",
        "sql": "SQL for Data Analysis (Udacity)",
        "power bi": "Microsoft Power BI Data Analyst",
        "tableau": "Tableau Desktop Specialist",
        "docker": "Docker Certified Associate",
    }

    certs = []
    for skill in missing_skills[:5]:
        skill_lower = skill.lower()
        for key, cert in cert_map.items():
            if key in skill_lower and cert not in certs:
                certs.append(cert)
    if not certs:
        certs = [
            "Google Data Analytics Certificate",
            "IBM Data Science Professional Certificate",
            "Python for Everybody (Coursera)",
        ]

    # Project suggestions
    project_ideas = [
        "Build an end-to-end data pipeline using Pandas and SQL",
        "Create an interactive dashboard with Power BI / Tableau",
        "Develop a machine learning model for classification or regression",
        "Build a REST API using FastAPI or Flask",
        "Create a data visualization portfolio project",
    ]

    # Rewrite suggestions
    rewrite_suggestions = []
    if ats_score < 50:
        rewrite_suggestions.append(
            "Tailor your resume specifically to this job description by mirroring its language"
        )
    rewrite_suggestions.extend([
        "Start each bullet point with a strong action verb (e.g., 'Developed', 'Achieved', 'Led')",
        "Add quantifiable results to your achievements (e.g., 'Improved performance by 30%')",
        "Include a professional summary tailored to this specific role",
        "Ensure your skills section prominently features keywords from the job description",
    ])

    action_verbs = [
        "Developed", "Implemented", "Designed", "Led", "Achieved",
        "Optimized", "Analyzed", "Delivered", "Built", "Coordinated",
        "Automated", "Collaborated", "Improved", "Managed", "Created",
    ]

    keyword_suggestions = missing_keywords[:10] if missing_keywords else [
        "Data Analysis", "Python", "SQL", "Machine Learning", "Visualization"
    ]

    quantify_suggestions = [
        "Replace 'Worked on data analysis' with 'Analyzed datasets of 100K+ records using Python and SQL'",
        "Replace 'Improved system performance' with 'Improved system performance by 35%, reducing load time from 8s to 5.2s'",
        "Replace 'Managed a team' with 'Led a cross-functional team of 5 engineers delivering 3 projects on time'",
        "Add completion rates, user counts, or business impact to each achievement",
    ]

    grammar_suggestions = [
        "Use consistent tense throughout (past tense for previous jobs, present for current)",
        "Avoid first-person pronouns (I, me, my) — use action verbs directly",
        "Ensure all dates are in consistent format (e.g., Jan 2023 – Present)",
    ]

    return _validate_suggestions({
        "suggested_skills": suggested_skills,
        "recommended_certifications": certs,
        "suggested_projects": project_ideas,
        "resume_rewrite_suggestions": rewrite_suggestions,
        "action_verb_suggestions": action_verbs,
        "grammar_suggestions": grammar_suggestions,
        "keyword_suggestions": keyword_suggestions,
        "quantify_suggestions": quantify_suggestions,
    })


def _validate_suggestions(data: Dict) -> Dict[str, Any]:
    """Ensure suggestion dict has all required keys and correct types."""
    keys = [
        "suggested_skills", "recommended_certifications", "suggested_projects",
        "resume_rewrite_suggestions", "action_verb_suggestions",
        "grammar_suggestions", "keyword_suggestions", "quantify_suggestions",
    ]
    result = {}
    for key in keys:
        val = data.get(key, [])
        if isinstance(val, list):
            result[key] = [str(item) for item in val]
        elif isinstance(val, str):
            result[key] = [val]
        else:
            result[key] = []
    return result
