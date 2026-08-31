# DATABASE SCHEMA — AI Resume & Job Match Analyzer

## Overview

The application uses **SQLite** in development (auto-migrations to PostgreSQL supported via SQLAlchemy).

---

## Tables

### `resumes`
Stores uploaded resume files and all extracted information.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| filename | VARCHAR(255) | Original file name |
| file_path | VARCHAR(500) | Absolute path on server |
| file_type | VARCHAR(10) | "pdf" or "docx" |
| file_size_kb | FLOAT | File size in kilobytes |
| candidate_name | VARCHAR(200) | Extracted candidate name |
| email | VARCHAR(200) | Extracted email address |
| phone | VARCHAR(50) | Extracted phone number |
| raw_text | TEXT | Full extracted resume text |
| extracted_skills | JSON | List of detected skills |
| experience_years | FLOAT | Estimated years of experience |
| education | JSON | List of education entries |
| certifications | JSON | List of certifications |
| projects | JSON | List of project entries |
| work_experience | JSON | List of work experience entries |
| languages | JSON | List of languages (human) |
| summary | TEXT | Professional summary |
| created_at | DATETIME | Upload timestamp |
| updated_at | DATETIME | Last update timestamp |

---

### `job_descriptions`
Stores job descriptions from manual input or URL scraping.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| title | VARCHAR(300) | Job title (if extracted) |
| company | VARCHAR(200) | Company name (if extracted) |
| location | VARCHAR(200) | Job location |
| source_url | VARCHAR(1000) | Original URL (if provided) |
| source_type | VARCHAR(50) | "manual", "linkedin", "naukri", "indeed", "url" |
| raw_text | TEXT | Full job description text |
| required_skills | JSON | List of required skills |
| preferred_skills | JSON | List of preferred skills |
| experience_required | VARCHAR(100) | Parsed experience requirement |
| education_required | VARCHAR(200) | Parsed education requirement |
| salary_range | VARCHAR(200) | Salary range (if mentioned) |
| job_type | VARCHAR(100) | "full-time", "part-time", etc. |
| created_at | DATETIME | Creation timestamp |

---

### `resume_analyses`
Stores complete analysis results for a (resume, job_description) pair.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| resume_id | INTEGER FK | References resumes.id |
| job_description_id | INTEGER FK | References job_descriptions.id |
| ats_score | FLOAT | Overall ATS score (0-100) |
| match_score | FLOAT | Resume match score (0-100) |
| skills_match_score | FLOAT | Skills match percentage |
| experience_match_score | FLOAT | Experience match percentage |
| education_match_score | FLOAT | Education match percentage |
| keyword_match_score | FLOAT | Keyword overlap percentage |
| formatting_score | FLOAT | Resume formatting score |
| soft_skills_score | FLOAT | Soft skills match percentage |
| hard_skills_score | FLOAT | Hard skills match percentage |
| match_category | VARCHAR(20) | "Low", "Medium", "High", "Very High" |
| matched_keywords | JSON | List of matched keywords |
| missing_keywords | JSON | List of missing keywords |
| matched_skills | JSON | List of matched skills |
| missing_skills | JSON | List of missing skills |
| strengths | JSON | List of strength statements |
| weaknesses | JSON | List of weakness statements |
| match_reasons | JSON | List of match reason strings |
| suggested_skills | JSON | AI-suggested skills to add |
| recommended_certifications | JSON | Recommended certifications |
| suggested_projects | JSON | Project ideas |
| resume_rewrite_suggestions | JSON | Rewrite tips |
| action_verb_suggestions | JSON | Action verbs to use |
| grammar_suggestions | JSON | Grammar tips |
| keyword_suggestions | JSON | Keywords to add |
| quantify_suggestions | JSON | Achievement quantification tips |
| created_at | DATETIME | Analysis timestamp |

---

### `company_analyses`
Stores company research results.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| company_name | VARCHAR(300) | Company name |
| industry | VARCHAR(200) | Industry sector |
| founded_year | VARCHAR(20) | Year founded |
| headquarters | VARCHAR(300) | HQ location |
| company_size | VARCHAR(100) | Size category |
| employee_count | VARCHAR(100) | Employee count range |
| website | VARCHAR(500) | Official website URL |
| description | TEXT | Company description |
| overall_rating | FLOAT | Overall rating (0-10) |
| work_life_balance | FLOAT | Work-life balance rating |
| salary_satisfaction | FLOAT | Salary satisfaction rating |
| career_growth | FLOAT | Career growth rating |
| culture_rating | FLOAT | Culture rating |
| interview_difficulty | FLOAT | Interview difficulty rating |
| pros | JSON | List of pros |
| cons | JSON | List of cons |
| overall_recommendation | TEXT | Overall recommendation text |
| salary_range | VARCHAR(200) | Salary range string |
| average_salary | VARCHAR(200) | Average salary string |
| sources | JSON | List of source citation objects |
| created_at | DATETIME | Analysis timestamp |

---

### `saved_reports`
Tracks generated PDF and Excel reports.

| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| analysis_id | INTEGER FK | References resume_analyses.id |
| report_type | VARCHAR(20) | "pdf" or "excel" |
| file_path | VARCHAR(500) | Absolute path to generated file |
| file_name | VARCHAR(255) | Generated file name |
| created_at | DATETIME | Generation timestamp |

---

## Relationships

```
resumes ─────────────── resume_analyses ─── saved_reports
                                │
job_descriptions ───────────────┘

company_analyses (standalone)
```

---

## Sample Queries

```sql
-- Get all analyses for a resume
SELECT ra.*, r.candidate_name, jd.title
FROM resume_analyses ra
JOIN resumes r ON ra.resume_id = r.id
JOIN job_descriptions jd ON ra.job_description_id = jd.id
WHERE ra.resume_id = 1;

-- Average ATS score
SELECT AVG(ats_score) as avg_ats FROM resume_analyses;

-- Top company ratings
SELECT company_name, overall_rating
FROM company_analyses
ORDER BY overall_rating DESC LIMIT 10;

-- Recent analyses
SELECT id, ats_score, match_score, match_category, created_at
FROM resume_analyses
ORDER BY created_at DESC LIMIT 20;
```

---

## PostgreSQL Migration

Update `.env`:
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/ats_db
```

Create the database:
```sql
CREATE DATABASE ats_db;
```

The tables are created automatically on application startup via `Base.metadata.create_all()`.
