/**
 * Client-Side ATS Analyzer & Match Scorer
 * High-performance, zero-latency browser analysis engine.
 * 100% harmonized with the backend scoring algorithms:
 * - Sublinear TF-IDF Cosine Similarity
 * - Keyword Frequency Overlap
 * - Multi-dimensional ATS Component Weighting
 * - Rule-based AI Improvement Suggestions
 */

// ── Comprehensive Multi-Domain Skill Taxonomy ──────────────────────────────────
export const CANONICAL_MAPPINGS = [
  // ── Inspection & Testing ──
  { rx: /\bfit[\-\s]?up\s+inspection\b/i, name: "Fit-up Inspection" },
  { rx: /\bdimensional?\s+inspection\b/i, name: "Dimensional Inspection" },
  { rx: /\bweld\s+visual\s+inspection\b/i, name: "Weld Visual Inspection" },
  { rx: /\bvisual\s+inspection\b/i, name: "Visual Inspection" },
  { rx: /\bmaterial\s+inspection\b/i, name: "Material Inspection" },
  { rx: /\bmaterial\s+identification\b/i, name: "Material Identification" },
  { rx: /\bstage(?:\s+wise)?\s+inspection\b/i, name: "Stage Inspection" },
  { rx: /\bfinal\s+inspection\b/i, name: "Final Inspection" },
  { rx: /\bpiping\s+inspection\b/i, name: "Piping Inspection" },
  { rx: /\bwelding\s+inspection\b/i, name: "Welding Inspection" },
  { rx: /\bsite\s+inspection\b/i, name: "Site Inspection" },
  { rx: /\bhydro(?:static)?\s+test(?:ing)?\b/i, name: "Hydro Test" },
  { rx: /\bpneumatic\s+test(?:ing)?\b/i, name: "Pneumatic Test" },
  { rx: /\bpressure\s+test(?:ing)?\b/i, name: "Pressure Test" },
  { rx: /\bhold\s+point(?:\s+clearance)?\b/i, name: "Hold Point Clearance" },
  { rx: /\bpunch\s+point(?:\s+clearance)?\b/i, name: "Punch Point Clearance" },
  { rx: /\bsite\s+surveillance\b/i, name: "Site Surveillance" },
  { rx: /\bloop\s+file\s+prep(?:aration)?\b/i, name: "Loop File Preparation" },
  { rx: /\brfi\s+prep(?:aration)?\b/i, name: "RFI Preparation" },
  { rx: /\b(?:reviewing\s+)?wps\b/i, name: "WPS Review" },
  { rx: /\b(?:reviewing\s+)?pqr\b/i, name: "PQR Review" },
  { rx: /\bwelder\s+qualification\b/i, name: "Welder Qualification" },
  { rx: /\bwelding\s+procedure\s+qualification\b/i, name: "Welding Procedure Qualification" },
  { rx: /\bwelding\s+consumables?\s+inspection\b/i, name: "Welding Consumables Inspection" },
  { rx: /\bcalibration\s+checks?\b/i, name: "Calibration Checks" },
  { rx: /\bcarbon\s+steels?\b/i, name: "Carbon Steel" },
  { rx: /\bstainless\s+steels?\b/i, name: "Stainless Steel" },
  { rx: /\bclient\s+inspection\b/i, name: "Client Inspection" },
  { rx: /\b(?:third\s+party\s+inspection|tpi)\b/i, name: "Third Party Inspection / TPI" },
  { rx: /\b(?:itp|inspection\s+test\s+plan)\b/i, name: "ITP / Inspection Test Plan" },
  { rx: /\bqc\s+procedures?\b/i, name: "Quality Procedures" },
  { rx: /\bquality\s+control\b/i, name: "Quality Control" },
  { rx: /\bqa\s*\/\s*qc\b/i, name: "QA/QC" },
  { rx: /\b(?:asnt|asndt)\s+level\s+ii\b/i, name: "ASNT Level II" },
  { rx: /\b(?:asnt|asndt)\s+level\s+iii\b/i, name: "ASNT Level III" },
  { rx: /\bcswip\s+3\.1\b/i, name: "CSWIP 3.1" },
  { rx: /\bcswip\s+3\.2\b/i, name: "CSWIP 3.2" },
  { rx: /\basme\s+b31\.3\b/i, name: "ASME B31.3" },
  { rx: /\basme\s+section\s+ix\b/i, name: "ASME Section IX" },
  { rx: /\baws\s+d1\.1\b/i, name: "AWS D1.1" },
  { rx: /\bapi\s+570\b/i, name: "API 570" },
  { rx: /\bapi\s+510\b/i, name: "API 510" },
  { rx: /\bapi\s+653\b/i, name: "API 653" },
  { rx: /\biso\s+9001\b/i, name: "ISO 9001" },
  { rx: /\bms\s+excel\b/i, name: "MS Excel" },
  { rx: /\bms\s+word\b/i, name: "MS Word" },
  { rx: /\bcrystal\s+reports\b/i, name: "Crystal Reports" },
  { rx: /\brdlc(?:\s+reports)?\b/i, name: "RDLC Reports" },
  { rx: /\bt[\-\s]?sql\b/i, name: "T-SQL" },
  { rx: /\bpower\s+bi\b/i, name: "Power BI" },
  { rx: /\bms\s+sql(?:\s+server)?\b/i, name: "SQL Server" },
  { rx: /\brest(?:ful)?\s+api[s]?\b/i, name: "REST APIs" },
  { rx: /\bci\s*\/\s*cd\b/i, name: "CI/CD" },
  { rx: /\bmachine\s+learning\b/i, name: "Machine Learning" },
  { rx: /\bdeep\s+learning\b/i, name: "Deep Learning" },
  { rx: /\bnatural\s+language\s+processing\b/i, name: "NLP" },
]

export const TAXONOMY_DICTIONARY = {
  // NDT
  "ndt": "NDT", "nde": "NDE", "pt": "PT", "mt": "MT", "rt": "RT", "ut": "UT", "vt": "VT", "et": "ET",
  // Welding & Piping
  "smaw": "SMAW", "saw": "SAW", "gtaw": "GTAW", "fcaw": "FCAW", "tig": "TIG Welding", "mig": "MIG Welding",
  "wps": "WPS", "pqr": "PQR", "itp": "ITP", "rfi": "RFI", "tpi": "TPI", "piping": "Piping",
  "heavy fabrication": "Heavy Fabrication", "structural works": "Structural Works",
  // Programming Languages
  "python": "Python", "java": "Java", "javascript": "JavaScript", "typescript": "TypeScript",
  "c++": "C++", "c#": "C#", "go": "Go", "rust": "Rust", "kotlin": "Kotlin", "swift": "Swift",
  "php": "PHP", "scala": "Scala", "r": "R", "matlab": "MATLAB", "sql": "SQL", "bash": "Bash",
  // Web & Frameworks
  "react": "React", "angular": "Angular", "vue": "Vue", "node.js": "Node.js", "nodejs": "Node.js",
  "express": "Express", "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
  "spring boot": "Spring Boot", "html": "HTML", "css": "CSS", "graphql": "GraphQL",
  // Databases
  "mysql": "MySQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "sqlite": "SQLite",
  "mongodb": "MongoDB", "redis": "Redis", "cassandra": "Cassandra", "elasticsearch": "Elasticsearch",
  "oracle": "Oracle", "snowflake": "Snowflake", "bigquery": "BigQuery", "redshift": "Redshift",
  // Cloud & DevOps
  "aws": "AWS", "azure": "Azure", "gcp": "GCP", "docker": "Docker", "kubernetes": "Kubernetes",
  "terraform": "Terraform", "ansible": "Ansible", "jenkins": "Jenkins", "linux": "Linux", "git": "Git",
  "github": "GitHub", "gitlab": "GitLab", "jira": "Jira",
  // Data & AI
  "pandas": "Pandas", "numpy": "NumPy", "scipy": "SciPy", "matplotlib": "Matplotlib",
  "seaborn": "Seaborn", "tableau": "Tableau", "power bi": "Power BI", "excel": "Excel",
  "tensorflow": "TensorFlow", "pytorch": "PyTorch", "keras": "Keras", "scikit-learn": "Scikit-Learn",
  "spark": "Apache Spark", "hadoop": "Hadoop", "kafka": "Kafka", "airflow": "Airflow",
  // Engineering
  "autocad": "AutoCAD", "solidworks": "SolidWorks", "catia": "CATIA", "ansys": "ANSYS",
  "six sigma": "Six Sigma", "lean manufacturing": "Lean Manufacturing", "hvac": "HVAC",
}

export const SOFT_SKILLS_DICT = {
  "communication": "Communication", "teamwork": "Teamwork", "leadership": "Leadership",
  "problem solving": "Problem Solving", "critical thinking": "Critical Thinking",
  "time management": "Time Management", "adaptability": "Adaptability", "creativity": "Creativity",
  "collaboration": "Collaboration", "analytical": "Analytical Skills",
  "detail-oriented": "Detail-Oriented", "detail oriented": "Detail-Oriented",
  "organized": "Organized", "presentation": "Presentation", "negotiation": "Negotiation",
  "conflict resolution": "Conflict Resolution", "agile": "Agile", "scrum": "Scrum",
  "stakeholder management": "Stakeholder Management", "project management": "Project Management",
}

export const TECH_SKILLS = Object.keys(TAXONOMY_DICTIONARY)
export const SOFT_SKILLS = Object.keys(SOFT_SKILLS_DICT)

const BLACKLIST_SKILLS = new Set([
  'resume', 'curriculum vitae', 'profile', 'summary', 'contact', 'email', 'phone',
  'address', 'experience', 'education', 'university', 'college', 'institute',
  'school', 'company', 'project', 'client', 'location', 'role', 'responsibilities',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december', 'present', 'current', 'till now',
  'surat', 'hazira', 'india', 'larsen', 'toubro', 'reliance', 'ongc', 'aramco', 'saudi aramco',
  'details of professional experience', 'about me', 'word'
])

export function extractSkills(text) {
  const skillsMap = {}
  const textStr = text || ''
  const textLower = textStr.toLowerCase()

  // 1. Canonical Pattern Mappings (Highest precision multi-word domain phrases)
  for (const item of CANONICAL_MAPPINGS) {
    if (item.rx.test(textStr)) {
      skillsMap[item.name.toLowerCase()] = item.name
    }
  }

  // 2. Dynamic Technical Standards Regex (ASME, AWS, API, ISO, ASTM, DIN, CSWIP, ASNT, etc.)
  const stdRegex = /\b((?:ASME|AWS|API|ISO|ASTM|DIN|TEMA|BS\s*EN|IEEE|IEC|CSWIP|ASNT|ASNDT)\s+(?:Section\s+[IVXLCDM]+|[A-Z0-9]+(?:[\.\-\/][A-Z0-9]+)*))\b/gi
  let m
  while ((m = stdRegex.exec(textStr)) !== null) {
    const val = m[1].trim().replace(/\s+/g, ' ')
    if (val.length >= 3 && !BLACKLIST_SKILLS.has(val.toLowerCase())) {
      const parts = val.split(' ')
      const normVal = parts[0].toUpperCase() + ' ' + parts.slice(1).join(' ')
      skillsMap[normVal.toLowerCase()] = normVal
    }
  }

  // 3. NDT Acronyms (PT, MT, RT, UT, VT, ET)
  const ndtRx = /(?<![a-zA-Z0-9])(PT|MT|RT|UT|VT|ET)(?![a-zA-Z0-9])/g
  while ((m = ndtRx.exec(textStr)) !== null) {
    const acronym = m[1].toUpperCase()
    skillsMap[acronym.toLowerCase()] = acronym
  }

  // 4. Standard Technical Taxonomy
  for (const [key, displayName] of Object.entries(TAXONOMY_DICTIONARY)) {
    const rx = new RegExp(`(?<![a-zA-Z0-9])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9])`, 'i')
    if (rx.test(textLower)) {
      if (key === 'aws' && /\baws\s+d1\b/i.test(textLower)) continue
      if (!BLACKLIST_SKILLS.has(key)) {
        skillsMap[key] = displayName
      }
    }
  }

  // 5. Soft Skills
  for (const [key, displayName] of Object.entries(SOFT_SKILLS_DICT)) {
    const rx = new RegExp(`(?<![a-zA-Z0-9])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9])`, 'i')
    if (rx.test(textLower)) {
      skillsMap[key] = displayName
    }
  }

  // 6. Smart Deduplication
  const suppressed = new Set()
  if (skillsMap['ms excel']) suppressed.add('excel')
  if (skillsMap['ms word']) suppressed.add('word')
  if (skillsMap['itp / inspection test plan']) suppressed.add('itp')
  if (skillsMap['third party inspection / tpi']) suppressed.add('tpi')
  if (skillsMap['wps review']) suppressed.add('wps')
  if (skillsMap['pqr review']) suppressed.add('pqr')

  const finalList = Object.keys(skillsMap)
    .filter(k => !suppressed.has(k) && !BLACKLIST_SKILLS.has(k) && k.length >= 2)
    .map(k => skillsMap[k])

  return finalList.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
}

export function extractTechSkills(text) {
  const allSkills = extractSkills(text)
  const softValues = new Set(Object.values(SOFT_SKILLS_DICT))
  return allSkills.filter(s => !softValues.has(s))
}

export function extractSoftSkills(text) {
  const textLower = (text || '').toLowerCase()
  const found = []
  for (const [key, displayName] of Object.entries(SOFT_SKILLS_DICT)) {
    const rx = new RegExp(`(?<![a-zA-Z0-9])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9])`, 'i')
    if (rx.test(textLower)) {
      found.push(displayName)
    }
  }
  return Array.from(new Set(found)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
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
