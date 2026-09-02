/**
 * Client-Side ATS Analyzer & Match Scorer
 * High-performance, zero-latency browser analysis engine.
 * 100% harmonized with the backend scoring algorithms:
 * - Sublinear TF-IDF Cosine Similarity
 * - Keyword Frequency Overlap
 * - Multi-dimensional ATS Component Weighting
 * - Rule-based AI Improvement Suggestions
 */

export const TECH_SKILLS = [
  // Programming languages
  "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
  "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "sql", "bash",
  // Data & Analytics
  "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly", "tableau",
  "power bi", "excel", "google sheets", "looker", "qlik", "metabase",
  // ML / AI
  "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
  "scikit-learn", "sklearn", "nlp", "natural language processing",
  "computer vision", "reinforcement learning", "hugging face", "langchain",
  "openai", "gpt", "bert", "transformers", "xgboost", "lightgbm",
  // Databases
  "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra",
  "elasticsearch", "oracle", "ms sql", "snowflake", "bigquery", "redshift",
  // Cloud
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
  "ansible", "jenkins", "ci/cd", "github actions", "gitlab ci",
  // Web
  "react", "angular", "vue", "node.js", "express", "django", "flask",
  "fastapi", "spring boot", "html", "css", "rest api", "graphql",
  // Data Engineering
  "spark", "hadoop", "kafka", "airflow", "dbt", "etl", "data pipeline",
  "data warehouse", "data lake", "databricks",
  // Other tools
  "git", "jira", "confluence", "figma", "linux", "windows server",
]

export const SOFT_SKILLS = [
  "communication", "teamwork", "leadership", "problem solving", "critical thinking",
  "time management", "adaptability", "creativity", "collaboration", "analytical",
  "detail-oriented", "organized", "proactive", "self-motivated", "multitasking",
  "presentation", "negotiation", "conflict resolution", "decision making",
  "emotional intelligence", "stakeholder management", "agile", "scrum",
]

const STOP_WORDS = new Set([
  "the", "and", "or", "in", "at", "to", "of", "a", "an", "is", "are",
  "was", "were", "be", "been", "have", "has", "had", "do", "does", "did",
  "with", "for", "on", "by", "from", "this", "that", "they", "we", "you",
  "will", "would", "could", "should", "may", "might", "can", "our", "your",
  "their", "its", "as", "up", "out", "so", "if", "not", "no", "but", "also",
  "about", "all", "after", "again", "against", "between", "both", "down",
  "each", "few", "more", "most", "other", "some", "such", "than", "too",
  "very", "what", "when", "where", "which", "while", "who", "whom", "why",
  "how", "me", "my", "myself", "we'd", "we'll", "we're", "we've", "he",
  "she", "it", "them", "then", "there", "these", "those", "through",
  "under", "until", "into", "over", "just", "now", "only", "same", "use",
])

export function extractKeywords(text, topN = 50) {
  const textLower = (text || '').toLowerCase()
  const words = textLower.match(/\b[a-z][a-z\-\.]{2,}\b/g) || []
  const wordFreq = {}
  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1
    }
  }
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([w]) => w)
}

export function extractTechSkills(text) {
  const textLower = (text || '').toLowerCase()
  const found = new Set()
  for (const skill of TECH_SKILLS) {
    const rx = new RegExp(`(?<![a-zA-Z0-9])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9])`, 'i')
    if (rx.test(textLower)) {
      found.add(skill)
    }
  }
  return Array.from(found).sort()
}

export function extractSoftSkills(text) {
  const textLower = (text || '').toLowerCase()
  const found = new Set()
  for (const skill of SOFT_SKILLS) {
    const rx = new RegExp(`(?<![a-zA-Z0-9])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9])`, 'i')
    if (rx.test(textLower)) {
      found.add(skill)
    }
  }
  return Array.from(found).sort()
}

export function extractSkills(text) {
  const tech = extractTechSkills(text)
  const soft = extractSoftSkills(text)
  return Array.from(new Set([...tech, ...soft])).sort()
}

function computeTfIdfCosine(text1, text2) {
  if (!text1?.trim() || !text2?.trim()) return 0.0
  const words1 = (text1.slice(0, 4000).toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || []).filter(w => !STOP_WORDS.has(w))
  const words2 = (text2.slice(0, 4000).toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || []).filter(w => !STOP_WORDS.has(w))
  if (!words1.length || !words2.length) return 30.0

  const c1 = {}, c2 = {}
  for (const w of words1) c1[w] = (c1[w] || 0) + 1
  for (const w of words2) c2[w] = (c2[w] || 0) + 1

  const vocab = new Set([...Object.keys(c1), ...Object.keys(c2)])
  const tf1 = {}, tf2 = {}
  for (const w in c1) tf1[w] = 1.0 + Math.log(c1[w])
  for (const w in c2) tf2[w] = 1.0 + Math.log(c2[w])

  let dot = 0.0, mag1 = 0.0, mag2 = 0.0
  for (const w of vocab) {
    const v1 = tf1[w] || 0.0
    const v2 = tf2[w] || 0.0
    dot += v1 * v2
  }
  for (const w in tf1) mag1 += tf1[w] * tf1[w]
  for (const w in tf2) mag2 += tf2[w] * tf2[w]

  mag1 = Math.sqrt(mag1)
  mag2 = Math.sqrt(mag2)
  if (mag1 === 0 || mag2 === 0) return 0.0
  return Math.round((dot / (mag1 * mag2)) * 1000) / 10
}

function checkResumeFormattingClient(text) {
  let score = 100.0
  const issues = []
  const textLower = (text || '').toLowerCase()
  const wordCount = (text || '').trim().split(/\s+/).length

  if (wordCount < 200) {
    score -= 20
    issues.push("Resume is too short (less than 200 words)")
  } else if (wordCount > 1500) {
    score -= 10
    issues.push("Resume may be too long (more than 1500 words)")
  }

  const requiredSections = ["experience", "education", "skills"]
  for (const sec of requiredSections) {
    if (!textLower.includes(sec)) {
      score -= 10
      issues.push(`Missing '${sec}' section`)
    }
  }

  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text)
  if (!hasEmail) {
    score -= 10
    issues.push("Email address not found")
  }

  const hasPhone = /(?:\+91|0)?[-\s]?\(?\d{3,5}\)?[-\s]?\d{3,4}[-\s]?\d{4}|\b\d{10}\b/.test(text)
  if (!hasPhone) {
    score -= 5
    issues.push("Phone number not found")
  }

  const actionVerbs = [
    "developed", "managed", "led", "implemented", "designed",
    "built", "created", "improved", "achieved", "delivered",
    "analyzed", "optimized", "coordinated", "established"
  ]
  if (!actionVerbs.some(v => textLower.includes(v))) {
    score -= 10
    issues.push("Use more action verbs to describe achievements")
  }

  const hasQuantifiable = /\d+\s*%|\d+\s*(?:users|clients|million|thousand|projects|years|team)/.test(textLower)
  if (!hasQuantifiable) {
    score -= 5
    issues.push("Add quantifiable achievements (e.g., '30% improvement', '100+ users')")
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
  }
}

export function computeClientAtsAnalysis(
  resumeText = '',
  jdText = '',
  experienceYears = 0,
  education = [],
  resumeId = 1,
  jdId = 1
) {
  const rText = resumeText || ''
  const jText = jdText || 'Software Developer Engineer'

  // 1. Keyword Match (top 60 JD vs top 100 resume)
  const jdKeywords = extractKeywords(jText, 60)
  const resumeKeywords = new Set(extractKeywords(rText, 100))
  const matchedKeywords = jdKeywords.filter(k => resumeKeywords.has(k))
  const missingKeywords = jdKeywords.filter(k => !resumeKeywords.has(k))
  const keywordScore = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 100 : 70.0

  // 2. Skills Match
  const jdSkills = extractSkills(jText)
  const resumeSkills = new Set(extractSkills(rText))
  const matchedSkills = jdSkills.filter(s => resumeSkills.has(s))
  const missingSkills = jdSkills.filter(s => !resumeSkills.has(s))
  const skillsScore = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) * 100 : 75.0

  // 3. Soft Skills
  const jdSoft = extractSoftSkills(jText)
  const resumeSoft = new Set(extractSoftSkills(rText))
  const matchedSoft = jdSoft.filter(s => resumeSoft.has(s))
  const softSkillsScore = jdSoft.length > 0 ? (matchedSoft.length / jdSoft.length) * 100 : 60.0

  // 4. Hard Skills
  const jdHard = extractTechSkills(jText)
  const resumeHard = new Set(extractTechSkills(rText))
  const matchedHard = jdHard.filter(s => resumeHard.has(s))
  const hardSkillsScore = jdHard.length > 0 ? (matchedHard.length / jdHard.length) * 100 : 50.0

  // 5. Experience Match (Extract required experience from JD)
  let expYears = typeof experienceYears === 'number' ? experienceYears : parseFloat(experienceYears) || 0
  if (expYears === 0) {
    const m = rText.match(/(\d+(?:\.\d+)?)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i)
    if (m) expYears = parseFloat(m[1]) || 0
  }
  let requiredMin = 0
  let requiredMax = 10
  const expPatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i,
    /(\d+)\s*to\s*(\d+)\s*years?/i,
    /minimum\s+(\d+)\s*years?/i,
    /at\s+least\s+(\d+)\s*years?/i,
  ]
  for (const pat of expPatterns) {
    const match = jText.match(pat)
    if (match) {
      requiredMin = parseInt(match[1], 10) || 0
      requiredMax = match[2] ? parseInt(match[2], 10) : requiredMin + 2
      break
    }
  }
  let experienceScore = 75.0
  if (requiredMin > 0) {
    if (expYears === 0) {
      experienceScore = 40.0
    } else if (expYears >= requiredMin) {
      experienceScore = expYears <= requiredMax + 5 ? 100.0 : 85.0
    } else {
      experienceScore = Math.round((expYears / requiredMin) * 80 * 10) / 10
    }
  }

  // 6. Education Match
  const degreeMap = {
    phd: 4, doctorate: 4,
    master: 3, "m.tech": 3, "m.sc": 3, mba: 3, mca: 3,
    bachelor: 2, "b.tech": 2, "b.sc": 2, bca: 2, "b.e": 2,
    diploma: 1,
  }
  const jLower = jText.toLowerCase()
  const rLower = rText.toLowerCase()
  let jdMaxLevel = 0
  for (const [deg, level] of Object.entries(degreeMap)) {
    const rx = new RegExp(`\\b${deg.replace('.', '\\.')}s?\\b`, 'i')
    if (rx.test(jLower)) jdMaxLevel = Math.max(jdMaxLevel, level)
  }
  let resumeMaxLevel = 0
  for (const [deg, level] of Object.entries(degreeMap)) {
    const rx = new RegExp(`\\b${deg.replace('.', '\\.')}s?\\b`, 'i')
    if (rx.test(rLower)) resumeMaxLevel = Math.max(resumeMaxLevel, level)
  }
  let educationScore = 80.0
  if (jdMaxLevel > 0) {
    if (resumeMaxLevel >= jdMaxLevel) educationScore = 100.0
    else if (resumeMaxLevel === jdMaxLevel - 1) educationScore = 70.0
    else educationScore = 40.0
  }

  // 7. Formatting Score
  const fmtResult = checkResumeFormattingClient(rText)
  const formattingScore = fmtResult.score

  // 8. Overall ATS Score (Backend Weighted Formula)
  const overallAts = Math.round(
    keywordScore * 0.30 +
    skillsScore * 0.25 +
    experienceScore * 0.20 +
    educationScore * 0.10 +
    formattingScore * 0.10 +
    softSkillsScore * 0.05
  )
  const overallAtsScore = Math.min(100, Math.max(0, overallAts))

  // 9. Semantic Cosine Similarity & Match Score
  const semanticScore = computeTfIdfCosine(rText, jText)
  const atsWeighted = (
    skillsScore * 0.30 +
    experienceScore * 0.25 +
    keywordScore * 0.20 +
    educationScore * 0.10 +
    softSkillsScore * 0.10 +
    formattingScore * 0.05
  )
  const finalMatchScore = Math.round(semanticScore * 0.40 + atsWeighted * 0.60)
  const matchScore = Math.min(100, Math.max(0, finalMatchScore))

  // Category matching backend: Very High (>=80), High (>=60), Medium (>=40), Low (<40)
  let matchCategory = "Low Match"
  if (matchScore >= 80) matchCategory = "Very High Match"
  else if (matchScore >= 60) matchCategory = "High Match"
  else if (matchScore >= 40) matchCategory = "Medium Match"

  // Reasons, Strengths, Weaknesses
  const strengths = []
  const weaknesses = []
  const matchReasons = []

  if (skillsScore >= 70) {
    strengths.push(`Strong skill alignment — ${matchedSkills.length} key skills matched.`)
  } else {
    weaknesses.push(`Missing ${missingSkills.length} required skills specified in the job posting.`)
  }

  if (experienceScore >= 80) {
    strengths.push("Experience matches or exceeds job requirements.")
  } else if (experienceScore >= 50) {
    strengths.push("Partial experience overlap with requirement.")
  } else {
    weaknesses.push("Experience duration appears lower than required.")
  }

  if (formattingScore >= 80) {
    strengths.push("Resume is well-structured and easy for ATS parsers to scan.")
  } else {
    weaknesses.push("Resume formatting could be improved for ATS readability.")
  }

  if (matchScore >= 75) {
    matchReasons.push("Your resume is highly competitive for this role.")
  } else if (matchScore >= 50) {
    matchReasons.push("Moderate match. Adding missing skills will significantly boost your score.")
  } else {
    matchReasons.push("Significant gaps identified. Consider tailoring your resume to highlight relevant keywords.")
  }

  // AI Suggestions
  const suggestedSkills = missingSkills.length > 0 ? missingSkills.slice(0, 8) : [
    "Python", "SQL", "Data Visualization", "Machine Learning", "Excel", "FastAPI", "Docker"
  ]

  const certMap = {
    aws: "AWS Certified Solutions Architect",
    azure: "Microsoft Azure Fundamentals (AZ-900)",
    python: "Python for Data Science (Coursera)",
    "machine learning": "Machine Learning Specialization (Coursera)",
    sql: "SQL for Data Analysis (Udacity)",
    "power bi": "Microsoft Power BI Data Analyst",
    tableau: "Tableau Desktop Specialist",
    docker: "Docker Certified Associate",
  }
  const certs = []
  for (const sk of missingSkills.slice(0, 5)) {
    const skLower = sk.toLowerCase()
    for (const [key, cert] of Object.entries(certMap)) {
      if (skLower.includes(key) && !certs.includes(cert)) {
        certs.push(cert)
      }
    }
  }
  if (!certs.length) {
    certs.push(
      "Google Data Analytics Certificate",
      "IBM Data Science Professional Certificate",
      "Python for Everybody (Coursera)"
    )
  }

  const projectIdeas = [
    "Build an end-to-end data pipeline using Pandas and SQL",
    "Create an interactive dashboard with Power BI / Tableau",
    "Develop a machine learning model for classification or regression",
    "Build a REST API using FastAPI or Flask",
    "Create a data visualization portfolio project",
  ]

  const rewriteSuggestions = []
  if (overallAtsScore < 50) {
    rewriteSuggestions.push("Tailor your resume specifically to this job description by mirroring its language")
  }
  rewriteSuggestions.push(
    "Start each bullet point with a strong action verb (e.g., 'Developed', 'Achieved', 'Led')",
    "Add quantifiable results to your achievements (e.g., 'Improved performance by 30%')",
    "Include a professional summary tailored to this specific role",
    "Ensure your skills section prominently features keywords from the job description"
  )

  const actionVerbs = [
    "Developed", "Implemented", "Designed", "Led", "Achieved",
    "Optimized", "Analyzed", "Delivered", "Built", "Coordinated",
    "Automated", "Collaborated", "Improved", "Managed", "Created"
  ]

  const keywordSuggestions = missingKeywords.length > 0 ? missingKeywords.slice(0, 10) : [
    "Data Analysis", "Python", "SQL", "Machine Learning", "Visualization"
  ]

  const quantifySuggestions = [
    "Replace 'Worked on data analysis' with 'Analyzed datasets of 100K+ records using Python and SQL'",
    "Replace 'Improved system performance' with 'Improved system performance by 35%, reducing load time from 8s to 5.2s'",
    "Replace 'Managed a team' with 'Led a cross-functional team of 5 engineers delivering 3 projects on time'",
    "Add completion rates, user counts, or business impact to each achievement",
  ]

  const grammarSuggestions = [
    "Use consistent tense throughout (past tense for previous jobs, present for current)",
    "Avoid first-person pronouns (I, me, my) — use action verbs directly",
    "Ensure all dates are in consistent format (e.g., Jan 2023 – Present)",
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
      match_reasons: matchReasons,
      strengths: strengths.length ? strengths : ["Candidate demonstrates solid foundational capabilities."],
      weaknesses: weaknesses.length ? weaknesses : ["Review job requirements to ensure all specialized tools are highlighted."],
    },
    suggestions: {
      suggested_skills: suggestedSkills,
      recommended_certifications: certs,
      suggested_projects: projectIdeas,
      resume_rewrite_suggestions: rewriteSuggestions,
      action_verb_suggestions: actionVerbs,
      grammar_suggestions: grammarSuggestions,
      keyword_suggestions: keywordSuggestions,
      quantify_suggestions: quantifySuggestions,
    },
    created_at: new Date().toISOString(),
  }
}
