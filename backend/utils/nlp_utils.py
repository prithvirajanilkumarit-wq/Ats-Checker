"""
NLP Utilities — spaCy-based keyword extraction, NER, skill identification
"""
import re
from typing import List, Dict, Set, Tuple
from backend.utils.logger import get_logger

logger = get_logger(__name__)

# ── Skill libraries ───────────────────────────────────────────────────────────
TECH_SKILLS = {
    # Programming languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "sql", "bash",
    # Data & Analytics
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly", "tableau",
    "power bi", "excel", "google sheets", "looker", "qlik", "metabase",
    # ML / AI
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "sklearn", "nlp", "natural language processing",
    "computer vision", "reinforcement learning", "hugging face", "langchain",
    "openai", "gpt", "bert", "transformers", "xgboost", "lightgbm",
    # Databases
    "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra",
    "elasticsearch", "oracle", "ms sql", "snowflake", "bigquery", "redshift",
    # Cloud
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
    "ansible", "jenkins", "ci/cd", "github actions", "gitlab ci",
    # Web
    "react", "angular", "vue", "node.js", "express", "django", "flask",
    "fastapi", "spring boot", "html", "css", "rest api", "graphql",
    # Data Engineering
    "spark", "hadoop", "kafka", "airflow", "dbt", "etl", "data pipeline",
    "data warehouse", "data lake", "databricks",
    # Other tools
    "git", "jira", "confluence", "figma", "linux", "windows server",
}

SOFT_SKILLS = {
    "communication", "teamwork", "leadership", "problem solving", "critical thinking",
    "time management", "adaptability", "creativity", "collaboration", "analytical",
    "detail-oriented", "organized", "proactive", "self-motivated", "multitasking",
    "presentation", "negotiation", "conflict resolution", "decision making",
    "emotional intelligence", "stakeholder management", "agile", "scrum",
}

CERTIFICATIONS = {
    "aws certified", "azure certified", "google certified", "pmp", "scrum master",
    "csm", "cpa", "cfa", "cissp", "comptia", "cisco", "ccna", "ccnp",
    "tensorflow developer", "deep learning specialization", "coursera", "udemy",
    "microsoft certified", "oracle certified", "salesforce certified",
}

EDUCATION_KEYWORDS = {
    "bachelor", "master", "phd", "doctorate", "b.tech", "m.tech", "bca", "mca",
    "b.sc", "m.sc", "mba", "b.e", "m.e", "b.com", "m.com", "diploma",
    "associate", "degree", "computer science", "information technology",
    "data science", "engineering", "mathematics", "statistics",
}


# Pre-compile regex for skills matching using lookarounds to ensure word/alphanumeric boundaries
_TECH_SKILLS_REGEX = [
    (skill, re.compile(rf'(?<![a-zA-Z0-9]){re.escape(skill)}(?![a-zA-Z0-9])'))
    for skill in TECH_SKILLS
]
_SOFT_SKILLS_REGEX = [
    (skill, re.compile(rf'(?<![a-zA-Z0-9]){re.escape(skill)}(?![a-zA-Z0-9])'))
    for skill in SOFT_SKILLS
]

# Blacklisted candidate names that are common headings
BLACKLISTED_NAMES = {
    "resume", "curriculum vitae", "curriculum-vitae", "cv", "biodata", "bio-data",
    "portfolio", "profile", "summary", "contact", "information"
}


def extract_skills(text: str) -> List[str]:
    """Extract technical and soft skills from text."""
    text_lower = text.lower()
    found_skills = set()

    for skill, rx in _TECH_SKILLS_REGEX:
        if rx.search(text_lower):
            found_skills.add(skill)

    for skill, rx in _SOFT_SKILLS_REGEX:
        if rx.search(text_lower):
            found_skills.add(skill)

    return sorted(list(found_skills))


def extract_tech_skills(text: str) -> List[str]:
    """Extract only technical/hard skills."""
    text_lower = text.lower()
    return sorted([skill for skill, rx in _TECH_SKILLS_REGEX if rx.search(text_lower)])


def extract_soft_skills(text: str) -> List[str]:
    """Extract only soft skills."""
    text_lower = text.lower()
    return sorted([skill for skill, rx in _SOFT_SKILLS_REGEX if rx.search(text_lower)])


def extract_email(text: str) -> str:
    """Extract email address from text."""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(pattern, text)
    return matches[0] if matches else ""


def extract_phone(text: str) -> str:
    """Extract phone number from text."""
    patterns = [
        r'(?:\+91|0)?[-\s]?\(?\d{3,5}\)?[-\s]?\d{3,4}[-\s]?\d{4}',
        r'\b\d{10}\b',
        r'\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            phone = re.sub(r'[^\d+]', '', matches[0])
            if len(phone) >= 10:
                return matches[0].strip()
    return ""


def extract_name(text: str) -> str:
    """Heuristically extract candidate name from top of resume."""
    lines = [l.strip() for l in text.strip().split('\n') if l.strip()]
    for line in lines[:5]:
        line_clean = line.strip().lower()
        if line_clean in BLACKLISTED_NAMES:
            continue
        # Skip lines that look like headings or contain email/phone
        if '@' in line or any(c.isdigit() for c in line[:5]):
            continue
        # Likely a name if 2-4 words, mostly alphabetic
        words = line.split()
        if 1 < len(words) <= 4 and all(w.replace('-', '').isalpha() for w in words):
            return line
    return lines[0] if lines else "Unknown"


def _month_to_num(month_str: str) -> int:
    if not month_str:
        return 1
    month_str = month_str.lower().strip()
    if month_str.isdigit():
        val = int(month_str)
        if 1 <= val <= 12:
            return val
    months = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'june': 6,
        'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
    }
    for k, v in months.items():
        if month_str.startswith(k):
            return v
    return 1


def _extract_work_experience_section(text: str) -> str:
    """Helper to extract only the text within the Work Experience section."""
    lines = text.split('\n')
    start_idx = -1
    
    # Common headers for work experience
    exp_headers = [
        'work experience', 'experience', 'professional experience', 
        'employment history', 'work history', 'career history', 'employment'
    ]
    
    # Other section headers that signify the end of the work experience section
    end_headers = [
        'education', 'skills', 'certifications', 'credentials', 
        'projects', 'languages', 'interests', 'hobbies', 'awards', 
        'publications', 'references'
    ]
    
    for i, line in enumerate(lines):
        line_clean = line.strip().lower()
        if any(h == line_clean or line_clean.startswith(h) for h in exp_headers) and len(line_clean) < 30:
            start_idx = i
            break
            
    if start_idx == -1:
        for i, line in enumerate(lines):
            line_clean = line.strip().lower()
            if any(h in line_clean for h in exp_headers) and len(line_clean) < 30:
                start_idx = i
                break
                
    if start_idx == -1:
        return text
        
    end_idx = len(lines)
    for j in range(start_idx + 1, len(lines)):
        line_clean = lines[j].strip().lower()
        if any(h == line_clean or line_clean.startswith(h) for h in end_headers) and len(line_clean) < 30:
            end_idx = j
            break
            
    return '\n'.join(lines[start_idx:end_idx])


def extract_experience_years(text: str) -> float:
    """Estimate years of experience from resume text."""
    # 1. Look for explicit statements first (e.g. "5+ years of experience")
    patterns = [
        r'(\d+(?:\.\d+)?)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
        r'(\d+(?:\.\d+)?)\s*yr[s]?\s*(?:of\s*)?(?:experience|exp)',
        r'experience\s*(?:of\s*)?(\d+(?:\.\d+)?)\+?\s*years?',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text.lower())
        if matches:
            try:
                val = float(matches[0])
                if val > 0:
                    return val
            except (ValueError, TypeError):
                pass

    # 2. Extract Work Experience section first to avoid capturing education dates
    section_text = _extract_work_experience_section(text)

    # 3. Fallback: Parse job date ranges and calculate sum of merged durations
    import datetime
    now = datetime.datetime.utcnow()
    curr_year = now.year
    curr_month = now.month

    months_pattern = r'(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)'
    numeric_month_pattern = r'(?:0?[1-9]|1[0-2])'
    month_pattern = rf'(?:{months_pattern}|{numeric_month_pattern})'
    year_pattern = r'\b(?:19|20)\d{2}\b'
    sep_pattern = r'\s*(?:[-–—]|to)\s*'
    month_sep = r'[-\/\s]+'

    range_regex = re.compile(
        rf'\b({month_pattern}){month_sep}({year_pattern}){sep_pattern}(?:({month_pattern}){month_sep})?(present|current|now|{year_pattern})'
        rf'|\b({year_pattern}){sep_pattern}({year_pattern})',
        re.IGNORECASE
    )

    matches = range_regex.findall(section_text)
    intervals = []

    for m in matches:
        if m[1]:  # Pattern with month and year
            start_m = _month_to_num(m[0])
            start_y = int(m[1])
            
            end_val = m[3].lower().strip()
            if end_val in ('present', 'current', 'now'):
                end_m = curr_month
                end_y = curr_year
            else:
                end_m = _month_to_num(m[2])
                end_y = int(m[3])
        elif m[4]:  # Pattern with year only (e.g. 2020-2023)
            start_m = 1
            start_y = int(m[4])
            end_m = 12
            end_y = int(m[5])
        else:
            continue

        if start_y > end_y or (start_y == end_y and start_m > end_m):
            continue
        
        start_date = start_y * 12 + start_m
        end_date = end_y * 12 + end_m
        intervals.append((start_date, end_date))

    if intervals:
        # Merge overlapping intervals to get precise experience duration
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                merged[-1] = (merged[-1][0], max(merged[-1][1], interval[1]))
        
        total_months = sum((end - start + 1) for start, end in merged)
        years = total_months / 12.0
        return round(years, 1)

    return 0.0


def extract_keywords(text: str, top_n: int = 50) -> List[str]:
    """Extract important keywords from text using frequency analysis."""
    text_lower = text.lower()
    # Remove stop words
    stop_words = {
        "the", "and", "or", "in", "at", "to", "of", "a", "an", "is", "are",
        "was", "were", "be", "been", "have", "has", "had", "do", "does", "did",
        "with", "for", "on", "by", "from", "this", "that", "they", "we", "you",
        "will", "would", "could", "should", "may", "might", "can", "our", "your",
        "their", "its", "as", "up", "out", "so", "if", "not", "no", "but", "also",
    }
    words = re.findall(r'\b[a-z][a-z\-\.]{2,}\b', text_lower)
    word_freq: Dict[str, int] = {}
    for word in words:
        if word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1

    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    return [w for w, _ in sorted_words[:top_n]]


def check_resume_formatting(text: str) -> Tuple[float, List[str]]:
    """
    Evaluate resume formatting quality.
    Returns (score 0-100, list of formatting issues)
    """
    score = 100.0
    issues = []

    # Check length
    word_count = len(text.split())
    if word_count < 200:
        score -= 20
        issues.append("Resume is too short (less than 200 words)")
    elif word_count > 1500:
        score -= 10
        issues.append("Resume may be too long (more than 1500 words)")

    # Check sections
    required_sections = ["experience", "education", "skills"]
    text_lower = text.lower()
    for section in required_sections:
        if section not in text_lower:
            score -= 10
            issues.append(f"Missing '{section}' section")

    # Check contact info
    if not extract_email(text):
        score -= 10
        issues.append("Email address not found")
    if not extract_phone(text):
        score -= 5
        issues.append("Phone number not found")

    # Check action verbs
    action_verbs = ["developed", "managed", "led", "implemented", "designed",
                    "built", "created", "improved", "achieved", "delivered",
                    "analyzed", "optimized", "coordinated", "established"]
    has_action = any(v in text_lower for v in action_verbs)
    if not has_action:
        score -= 10
        issues.append("Use more action verbs to describe achievements")

    # Check quantifiable achievements
    has_numbers = bool(re.search(r'\d+\s*%|\d+\s*(?:users|clients|million|thousand|projects)', text_lower))
    if not has_numbers:
        score -= 5
        issues.append("Add quantifiable achievements (e.g., '30% improvement', '100+ users')")

    return max(0.0, min(100.0, score)), issues
