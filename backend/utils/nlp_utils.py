"""
NLP Utilities — spaCy-based keyword extraction, NER, skill identification
"""
import re
from typing import List, Dict, Set, Tuple
from backend.utils.logger import get_logger

logger = get_logger(__name__)

# ── Comprehensive Multi-Domain Skill Taxonomy ──────────────────────────────────
CANONICAL_MAPPINGS = [
    # ── Inspection & Testing ──
    (re.compile(r'\bfit[\-\s]?up\s+inspection\b', re.I), "Fit-up Inspection"),
    (re.compile(r'\bdimensional?\s+inspection\b', re.I), "Dimensional Inspection"),
    (re.compile(r'\bweld\s+visual\s+inspection\b', re.I), "Weld Visual Inspection"),
    (re.compile(r'\bvisual\s+inspection\b', re.I), "Visual Inspection"),
    (re.compile(r'\bmaterial\s+inspection\b', re.I), "Material Inspection"),
    (re.compile(r'\bmaterial\s+identification\b', re.I), "Material Identification"),
    (re.compile(r'\bstage(?:\s+wise)?\s+inspection\b', re.I), "Stage Inspection"),
    (re.compile(r'\bfinal\s+inspection\b', re.I), "Final Inspection"),
    (re.compile(r'\bpiping\s+inspection\b', re.I), "Piping Inspection"),
    (re.compile(r'\bwelding\s+inspection\b', re.I), "Welding Inspection"),
    (re.compile(r'\bsite\s+inspection\b', re.I), "Site Inspection"),
    (re.compile(r'\bhydro(?:static)?\s+test(?:ing)?\b', re.I), "Hydro Test"),
    (re.compile(r'\bpneumatic\s+test(?:ing)?\b', re.I), "Pneumatic Test"),
    (re.compile(r'\bpressure\s+test(?:ing)?\b', re.I), "Pressure Test"),
    (re.compile(r'\bhold\s+point(?:\s+clearance)?\b', re.I), "Hold Point Clearance"),
    (re.compile(r'\bpunch\s+point(?:\s+clearance)?\b', re.I), "Punch Point Clearance"),
    (re.compile(r'\bsite\s+surveillance\b', re.I), "Site Surveillance"),
    (re.compile(r'\bloop\s+file\s+prep(?:aration)?\b', re.I), "Loop File Preparation"),
    (re.compile(r'\brfi\s+prep(?:aration)?\b', re.I), "RFI Preparation"),
    (re.compile(r'\b(?:reviewing\s+)?wps\b', re.I), "WPS Review"),
    (re.compile(r'\b(?:reviewing\s+)?pqr\b', re.I), "PQR Review"),
    (re.compile(r'\bwelder\s+qualification\b', re.I), "Welder Qualification"),
    (re.compile(r'\bwelding\s+procedure\s+qualification\b', re.I), "Welding Procedure Qualification"),
    (re.compile(r'\bwelding\s+consumables?\s+inspection\b', re.I), "Welding Consumables Inspection"),
    (re.compile(r'\bcalibration\s+checks?\b', re.I), "Calibration Checks"),
    (re.compile(r'\bcarbon\s+steels?\b', re.I), "Carbon Steel"),
    (re.compile(r'\bstainless\s+steels?\b', re.I), "Stainless Steel"),
    (re.compile(r'\bclient\s+inspection\b', re.I), "Client Inspection"),
    (re.compile(r'\b(?:third\s+party\s+inspection|tpi)\b', re.I), "Third Party Inspection / TPI"),
    (re.compile(r'\b(?:itp|inspection\s+test\s+plan)\b', re.I), "ITP / Inspection Test Plan"),
    (re.compile(r'\bqc\s+procedures?\b', re.I), "Quality Procedures"),
    (re.compile(r'\bquality\s+control\b', re.I), "Quality Control"),
    (re.compile(r'\bqa\s*\/\s*qc\b', re.I), "QA/QC"),
    (re.compile(r'\b(?:asnt|asndt)\s+level\s+ii\b', re.I), "ASNT Level II"),
    (re.compile(r'\b(?:asnt|asndt)\s+level\s+iii\b', re.I), "ASNT Level III"),
    (re.compile(r'\bcswip\s+3\.1\b', re.I), "CSWIP 3.1"),
    (re.compile(r'\bcswip\s+3\.2\b', re.I), "CSWIP 3.2"),
    (re.compile(r'\basme\s+b31\.3\b', re.I), "ASME B31.3"),
    (re.compile(r'\basme\s+section\s+ix\b', re.I), "ASME Section IX"),
    (re.compile(r'\baws\s+d1\.1\b', re.I), "AWS D1.1"),
    (re.compile(r'\bapi\s+570\b', re.I), "API 570"),
    (re.compile(r'\bapi\s+510\b', re.I), "API 510"),
    (re.compile(r'\bapi\s+653\b', re.I), "API 653"),
    (re.compile(r'\biso\s+9001\b', re.I), "ISO 9001"),
    (re.compile(r'\bms\s+excel\b', re.I), "MS Excel"),
    (re.compile(r'\bms\s+word\b', re.I), "MS Word"),
    (re.compile(r'\bcrystal\s+reports\b', re.I), "Crystal Reports"),
    (re.compile(r'\brdlc(?:\s+reports)?\b', re.I), "RDLC Reports"),
    (re.compile(r'\bt[\-\s]?sql\b', re.I), "T-SQL"),
    (re.compile(r'\bpower\s+bi\b', re.I), "Power BI"),
    (re.compile(r'\bms\s+sql(?:\s+server)?\b', re.I), "SQL Server"),
    (re.compile(r'\brest(?:ful)?\s+api[s]?\b', re.I), "REST APIs"),
    (re.compile(r'\bci\s*\/\s*cd\b', re.I), "CI/CD"),
    (re.compile(r'\bmachine\s+learning\b', re.I), "Machine Learning"),
    (re.compile(r'\bdeep\s+learning\b', re.I), "Deep Learning"),
    (re.compile(r'\bnatural\s+language\s+processing\b', re.I), "NLP"),
]

TAXONOMY_DICTIONARY: Dict[str, str] = {
    # NDT
    "ndt": "NDT", "nde": "NDE", "pt": "PT", "mt": "MT", "rt": "RT", "ut": "UT", "vt": "VT", "et": "ET",
    # Welding & Piping
    "smaw": "SMAW", "saw": "SAW", "gtaw": "GTAW", "fcaw": "FCAW", "tig": "TIG Welding", "mig": "MIG Welding",
    "wps": "WPS", "pqr": "PQR", "itp": "ITP", "rfi": "RFI", "tpi": "TPI", "piping": "Piping",
    "heavy fabrication": "Heavy Fabrication", "structural works": "Structural Works",
    # Programming Languages
    "python": "Python", "java": "Java", "javascript": "JavaScript", "typescript": "TypeScript",
    "c++": "C++", "c#": "C#", "go": "Go", "rust": "Rust", "kotlin": "Kotlin", "swift": "Swift",
    "php": "PHP", "scala": "Scala", "r": "R", "matlab": "MATLAB", "sql": "SQL", "bash": "Bash",
    # Web & Frameworks
    "react": "React", "angular": "Angular", "vue": "Vue", "node.js": "Node.js", "nodejs": "Node.js",
    "express": "Express", "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
    "spring boot": "Spring Boot", "html": "HTML", "css": "CSS", "graphql": "GraphQL",
    # Databases
    "mysql": "MySQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "sqlite": "SQLite",
    "mongodb": "MongoDB", "redis": "Redis", "cassandra": "Cassandra", "elasticsearch": "Elasticsearch",
    "oracle": "Oracle", "snowflake": "Snowflake", "bigquery": "BigQuery", "redshift": "Redshift",
    # Cloud & DevOps
    "aws": "AWS", "azure": "Azure", "gcp": "GCP", "docker": "Docker", "kubernetes": "Kubernetes",
    "terraform": "Terraform", "ansible": "Ansible", "jenkins": "Jenkins", "linux": "Linux", "git": "Git",
    "github": "GitHub", "gitlab": "GitLab", "jira": "Jira",
    # Data & AI
    "pandas": "Pandas", "numpy": "NumPy", "scipy": "SciPy", "matplotlib": "Matplotlib",
    "seaborn": "Seaborn", "tableau": "Tableau", "power bi": "Power BI", "excel": "Excel",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch", "keras": "Keras", "scikit-learn": "Scikit-Learn",
    "spark": "Apache Spark", "hadoop": "Hadoop", "kafka": "Kafka", "airflow": "Airflow",
    # Engineering
    "autocad": "AutoCAD", "solidworks": "SolidWorks", "catia": "CATIA", "ansys": "ANSYS",
    "six sigma": "Six Sigma", "lean manufacturing": "Lean Manufacturing", "hvac": "HVAC",
}

SOFT_SKILLS_DICT: Dict[str, str] = {
    "communication": "Communication", "teamwork": "Teamwork", "leadership": "Leadership",
    "problem solving": "Problem Solving", "critical thinking": "Critical Thinking",
    "time management": "Time Management", "adaptability": "Adaptability", "creativity": "Creativity",
    "collaboration": "Collaboration", "analytical": "Analytical Skills",
    "detail-oriented": "Detail-Oriented", "detail oriented": "Detail-Oriented",
    "organized": "Organized", "presentation": "Presentation", "negotiation": "Negotiation",
    "conflict resolution": "Conflict Resolution", "agile": "Agile", "scrum": "Scrum",
    "stakeholder management": "Stakeholder Management", "project management": "Project Management",
}

# Pre-compile regex for skills
_SORTED_TAXONOMY_KEYS = sorted(list(TAXONOMY_DICTIONARY.keys()), key=lambda x: len(x), reverse=True)
_TAXONOMY_REGEXES = [
    (k, TAXONOMY_DICTIONARY[k], re.compile(rf'(?<![a-zA-Z0-9]){re.escape(k)}(?![a-zA-Z0-9])', re.I))
    for k in _SORTED_TAXONOMY_KEYS
]

_SORTED_SOFT_KEYS = sorted(list(SOFT_SKILLS_DICT.keys()), key=lambda x: len(x), reverse=True)
_SOFT_SKILLS_REGEX = [
    (k, SOFT_SKILLS_DICT[k], re.compile(rf'(?<![a-zA-Z0-9]){re.escape(k)}(?![a-zA-Z0-9])', re.I))
    for k in _SORTED_SOFT_KEYS
]

BLACKLIST_SKILLS = {
    'resume', 'curriculum vitae', 'profile', 'summary', 'contact', 'email', 'phone',
    'address', 'experience', 'education', 'university', 'college', 'institute',
    'school', 'company', 'project', 'client', 'location', 'role', 'responsibilities',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december', 'present', 'current', 'till now',
    'surat', 'hazira', 'india', 'larsen', 'toubro', 'reliance', 'ongc', 'aramco', 'saudi aramco',
    'details of professional experience', 'about me', 'word'
}

BLACKLISTED_NAMES = {
    "resume", "curriculum vitae", "curriculum-vitae", "cv", "biodata", "bio-data",
    "portfolio", "profile", "summary", "contact", "information"
}


def extract_skills(text: str) -> List[str]:
    """Extract all technical and domain skills from text with multi-word and standards recognition."""
    skills_map: Dict[str, str] = {}
    text_lower = text.lower()

    # 1. Canonical Pattern Mappings (Highest precision multi-word domain phrases)
    for rx, display_name in CANONICAL_MAPPINGS:
        if rx.search(text):
            skills_map[display_name.lower()] = display_name

    # 2. Dynamic Technical Standards Regex (ASME, AWS, API, ISO, ASTM, DIN, CSWIP, ASNT, etc.)
    std_regex = re.compile(r'\b((?:ASME|AWS|API|ISO|ASTM|DIN|TEMA|BS\s*EN|IEEE|IEC|CSWIP|ASNT|ASNDT)\s+(?:Section\s+[IVXLCDM]+|[A-Z0-9]+(?:[\.\-\/][A-Z0-9]+)*))\b', re.I)
    for m in std_regex.finditer(text):
        val = m.group(1).strip()
        val_clean = re.sub(r'[\s\n]+', ' ', val)
        if len(val_clean) >= 3 and val_clean.lower() not in BLACKLIST_SKILLS:
            parts = val_clean.split()
            norm_val = parts[0].upper() + ' ' + ' '.join(parts[1:])
            skills_map[norm_val.lower()] = norm_val

    # 3. NDT Acronyms (PT, MT, RT, UT, VT, ET)
    ndt_rx = re.compile(r'(?<![a-zA-Z0-9])(PT|MT|RT|UT|VT|ET)(?![a-zA-Z0-9])')
    for m in ndt_rx.finditer(text):
        acronym = m.group(1).upper()
        skills_map[acronym.lower()] = acronym

    # 4. Standard Technical Taxonomy
    for key, display_name, rx in _TAXONOMY_REGEXES:
        if rx.search(text_lower):
            # If standard AWS D1.1 is in text, don't falsely add standalone cloud "AWS"
            if key == "aws" and re.search(r'\baws\s+d1\b', text_lower):
                continue
            if key not in BLACKLIST_SKILLS:
                skills_map[key] = display_name

    # 5. Soft Skills
    for key, display_name, rx in _SOFT_SKILLS_REGEX:
        if rx.search(text_lower):
            skills_map[key] = display_name

    # 6. Smart Deduplication: suppress sub-terms when compound version exists
    suppressed_subterms = set()
    if "ms excel" in skills_map:
        suppressed_subterms.add("excel")
    if "ms word" in skills_map:
        suppressed_subterms.add("word")
    if "itp / inspection test plan" in skills_map:
        suppressed_subterms.add("itp")
    if "third party inspection / tpi" in skills_map:
        suppressed_subterms.add("tpi")
    if "wps review" in skills_map:
        suppressed_subterms.add("wps")
    if "pqr review" in skills_map:
        suppressed_subterms.add("pqr")

    final_list = [
        skills_map[k] for k in skills_map
        if k not in suppressed_subterms and k not in BLACKLIST_SKILLS and len(k) >= 2
    ]

    return sorted(final_list, key=lambda x: x.lower())


def extract_tech_skills(text: str) -> List[str]:
    """Extract only technical / domain hard skills."""
    all_skills = extract_skills(text)
    soft_names = set(SOFT_SKILLS_DICT.values())
    return [s for s in all_skills if s not in soft_names]


def extract_soft_skills(text: str) -> List[str]:
    """Extract only soft skills."""
    text_lower = text.lower()
    found = []
    for key, display_name, rx in _SOFT_SKILLS_REGEX:
        if rx.search(text_lower):
            found.append(display_name)
    return sorted(list(set(found)), key=lambda x: x.lower())


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
