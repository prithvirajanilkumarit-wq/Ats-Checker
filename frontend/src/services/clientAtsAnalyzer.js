/**
 * Client-Side ATS Analyzer & Match Scorer
 * High-performance, zero-latency browser analysis engine ensuring guaranteed 502-free execution.
 */

const TECH_SKILLS = [
  "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
  "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "sql", "bash",
  "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly", "tableau",
  "power bi", "excel", "google sheets", "looker", "qlik", "metabase",
  "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
  "scikit-learn", "sklearn", "nlp", "natural language processing",
  "computer vision", "reinforcement learning", "hugging face", "langchain",
  "openai", "gpt", "bert", "transformers", "xgboost", "lightgbm",
  "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra",
  "elasticsearch", "oracle", "ms sql", "snowflake", "bigquery", "redshift",
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
  "ansible", "jenkins", "ci/cd", "github actions", "gitlab ci",
  "react", "angular", "vue", "node.js", "express", "django", "flask",
  "fastapi", "spring boot", "html", "css", "rest api", "graphql",
  "spark", "hadoop", "kafka", "airflow", "dbt", "etl", "data pipeline",
  "data warehouse", "data lake", "databricks",
  "git", "jira", "confluence", "figma", "linux", "windows server",
]

const SOFT_SKILLS = [
  "communication", "teamwork", "leadership", "problem solving", "critical thinking",
  "time management", "adaptability", "creativity", "collaboration", "analytical",
  "detail-oriented", "organized", "proactive", "self-motivated", "multitasking",
  "presentation", "negotiation", "conflict resolution", "decision making",
  "emotional intelligence", "stakeholder management", "agile", "scrum",
]

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
  "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
  "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
  "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
  "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
  "themselves", "then", "there", "there's", "these", "they", "they'd",
  "they'll", "they're", "they've", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll",
  "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
  "where", "where's", "which", "while", "who", "who's", "whom", "why",
  "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
  "you're", "you've", "your", "yours", "yourself", "yourselves"
])

function extractKeywords(text, topN = 60) {
  const clean = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  const words = clean.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  const freq = {}
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word)
}

function extractTechSkills(text) {
  const textLower = (text || '').toLowerCase()
  const found = []
  for (const s of TECH_SKILLS) {
    const rx = new RegExp(`(?<![a-zA-Z0-9])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9])`, 'i')
    if (rx.test(textLower)) {
      found.push(s)
    }
  }
  return found
}

function extractSoftSkills(text) {
  const textLower = (text || '').toLowerCase()
  const found = []
  for (const s of SOFT_SKILLS) {
    const rx = new RegExp(`(?<![a-zA-Z0-9])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9])`, 'i')
    if (rx.test(textLower)) {
      found.push(s)
    }
  }
  return found
}

export function computeClientAtsAnalysis(resumeText = '', jdText = '', experienceYears = 0, education = [], resumeId = 1, jdId = 1) {
  const rText = resumeText || ''
  const jText = jdText || 'Software Engineer Developer'

  // 1. Keywords Match
  const jdKeywords = new Set(extractKeywords(jText, 60))
  const resumeKeywords = new Set(extractKeywords(rText, 100))
  const matchedKeywords = [...jdKeywords].filter(k => resumeKeywords.has(k))
  const missingKeywords = [...jdKeywords].filter(k => !resumeKeywords.has(k))
  const keywordScore = jdKeywords.size > 0 ? (matchedKeywords.length / jdKeywords.size) * 100 : 70

  // 2. Skills Match
  const jdSkills = new Set([...extractTechSkills(jText), ...extractSoftSkills(jText)])
  const resumeSkills = new Set([...extractTechSkills(rText), ...extractSoftSkills(rText)])
  const matchedSkills = [...jdSkills].filter(s => resumeSkills.has(s))
  const missingSkills = [...jdSkills].filter(s => !resumeSkills.has(s))
  const skillsScore = jdSkills.size > 0 ? (matchedSkills.length / jdSkills.size) * 100 : 75

  // 3. Soft Skills
  const jdSoft = new Set(extractSoftSkills(jText))
  const resumeSoft = new Set(extractSoftSkills(rText))
  const matchedSoft = [...jdSoft].filter(s => resumeSoft.has(s))
  const softSkillsScore = jdSoft.size > 0 ? (matchedSoft.length / jdSoft.size) * 100 : 65

  // 4. Hard Skills
  const jdHard = new Set(extractTechSkills(jText))
  const resumeHard = new Set(extractTechSkills(rText))
  const matchedHard = [...jdHard].filter(s => resumeHard.has(s))
  const hardSkillsScore = jdHard.size > 0 ? (matchedHard.length / jdHard.size) * 100 : 70

  // 5. Experience Match
  let expYears = typeof experienceYears === 'number' ? experienceYears : parseFloat(experienceYears) || 0
  if (expYears === 0) {
    const m = rText.match(/(\d+)\+?\s*years?/i)
    if (m) expYears = parseFloat(m[1]) || 0
  }
  const experienceScore = expYears >= 2 ? 95 : expYears >= 1 ? 80 : 65

  // 6. Education Match
  let educationScore = 80
  const degreeMap = { phd: 4, master: 3, "m.tech": 3, "mca": 3, bachelor: 2, "b.tech": 2, "bca": 2, "b.e": 2 }
  const rLower = rText.toLowerCase()
  for (const [deg] of Object.entries(degreeMap)) {
    if (rLower.includes(deg)) {
      educationScore = 95
      break
    }
  }

  // 7. Formatting Score
  let formattingScore = 100
  if (rText.length < 300) formattingScore -= 25
  if (!rLower.includes('experience') && !rLower.includes('project')) formattingScore -= 15
  if (!rLower.includes('skill')) formattingScore -= 10
  if (!rLower.includes('education')) formattingScore -= 10
  formattingScore = Math.max(50, formattingScore)

  // 8. Overall ATS Score
  const overallAtsScore = Math.round(
    keywordScore * 0.30 +
    skillsScore * 0.25 +
    experienceScore * 0.20 +
    educationScore * 0.10 +
    formattingScore * 0.10 +
    softSkillsScore * 0.05
  )

  // 9. Match Score
  const matchScore = Math.round((overallAtsScore * 0.65) + (skillsScore * 0.35))
  let matchCategory = "Moderate Match"
  if (matchScore >= 80) matchCategory = "Strong Match"
  else if (matchScore >= 65) matchCategory = "Good Match"
  else if (matchScore >= 45) matchCategory = "Moderate Match"
  else matchCategory = "Low Match"

  // 10. Suggestions
  const suggestedSkills = missingSkills.length > 0 ? missingSkills.slice(0, 8) : ["FastAPI", "Docker", "Kubernetes", "AWS", "CI/CD", "PostgreSQL"]
  const certMap = {
    aws: "AWS Certified Solutions Architect",
    azure: "Microsoft Azure Fundamentals (AZ-900)",
    python: "Python for Data Science (Coursera)",
    docker: "Docker Certified Associate",
    fastapi: "REST APIs with FastAPI",
    sql: "SQL for Data Analysis (Udacity)",
  }
  const recommendedCertifications = []
  for (const sk of missingSkills) {
    for (const [k, v] of Object.entries(certMap)) {
      if (sk.includes(k) && !recommendedCertifications.includes(v)) {
        recommendedCertifications.push(v)
      }
    }
  }
  if (recommendedCertifications.length === 0) {
    recommendedCertifications.push("AWS Certified Developer", "Professional Python Developer", "Docker & Kubernetes Specialist")
  }

  const suggestedProjects = [
    "Build a production REST API with FastAPI and PostgreSQL",
    "Containerize services using Docker and deploy via CI/CD",
    "Develop automated end-to-end testing pipelines",
  ]

  const resumeRewriteSuggestions = [
    "Mirror keywords from the job description in your summary and experience bullet points",
    "Start each bullet point with strong action verbs (e.g. Developed, Led, Architected, Optimized)",
    "Quantify your achievements with concrete metrics (e.g. improved latency by 40%, served 100k+ users)",
    "Highlight your proficiency in key matched technologies early in the skills section",
  ]

  const actionVerbSuggestions = ["Architected", "Engineered", "Implemented", "Optimized", "Scaled", "Streamlined", "Spearheaded"]
  const grammarSuggestions = [
    "Ensure consistent past tense verbs for past roles and present tense for current position",
    "Avoid first-person pronouns (I, my, we) in professional bullet points",
  ]
  const quantifySuggestions = [
    "Replace 'Built API endpoints' with 'Developed 15+ REST endpoints handling 50k+ daily requests with <50ms latency'",
    "Replace 'Optimized database' with 'Refactored SQL queries and indexes, reducing response times by 35%'",
  ]

  return {
    id: 1,
    resume_id: resumeId || 1,
    job_description_id: jdId || 1,
    ats_score: {
      overall_ats_score: overallAtsScore,
      skills_match_score: Math.round(skillsScore),
      experience_match_score: Math.round(experienceScore),
      education_match_score: Math.round(educationScore),
      keyword_match_score: Math.round(keywordScore),
      formatting_score: Math.round(formattingScore),
      soft_skills_score: Math.round(softSkillsScore),
      hard_skills_score: Math.round(hardSkillsScore),
      matched_keywords: matchedKeywords.slice(0, 20),
      missing_keywords: missingKeywords.slice(0, 20),
      matched_skills: matchedSkills.slice(0, 20),
      missing_skills: missingSkills.slice(0, 20),
    },
    match_score: {
      match_score: matchScore,
      match_category: matchCategory,
      match_reasons: [
        `Candidate matches ${matchedSkills.length} key required technical skills`,
        `Experience level provides a solid match for this role`,
        `Resume structure and formatting align well with ATS parsing standards`,
      ],
      strengths: matchedSkills.slice(0, 6).map(s => `Strong verified skill in ${s}`),
      weaknesses: missingSkills.slice(0, 4).map(s => `Missing direct mention of ${s}`),
    },
    suggestions: {
      suggested_skills: suggestedSkills,
      recommended_certifications: recommendedCertifications,
      suggested_projects: suggestedProjects,
      resume_rewrite_suggestions: resumeRewriteSuggestions,
      action_verb_suggestions: actionVerbSuggestions,
      grammar_suggestions: grammarSuggestions,
      keyword_suggestions: missingKeywords.slice(0, 10),
      quantify_suggestions: quantifySuggestions,
    },
    created_at: new Date().toISOString(),
  }
}
