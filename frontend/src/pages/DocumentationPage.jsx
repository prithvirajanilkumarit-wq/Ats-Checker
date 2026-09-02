import { useState } from 'react'
import { Copy, Check, Lock, Unlock, Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

function CodeBlock({ code, lang = '' }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E293B', borderRadius: '0.75rem 0.75rem 0 0', padding: '0.5rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{lang}</span>
        <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre style={{ background: '#0F172A', color: '#E2E8F0', padding: '1.25rem', borderRadius: '0 0 0.75rem 0.75rem', margin: 0, overflowX: 'auto', fontSize: '0.8375rem', lineHeight: 1.6, fontFamily: "'Fira Code', 'Cascadia Code', monospace" }}><code>{code}</code></pre>
    </div>
  )
}

function Section({ id, title, icon, children }) {
  return (
    <div id={id} style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1E40AF', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem', paddingBottom: '0.75rem', borderBottom: '2px solid #DBEAFE' }}>
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}

function SidebarLink({ href, label }) {
  return (
    <a href={href} style={{ display: 'block', padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: '#6B7280', textDecoration: 'none', borderRadius: '0.375rem', transition: 'all 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.color = '#1E40AF'; e.currentTarget.style.background = '#EFF6FF' }}
      onMouseOut={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent' }}
    >{label}</a>
  )
}

function LockedScreen({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleUnlock = (e) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter the password')
      return
    }
    const validPasswords = ['admin123', 'admin', 'ats2026', '1234']
    if (validPasswords.includes(password.trim())) {
      toast.success('Documentation Unlocked!')
      onUnlock()
    } else {
      setError('Incorrect password. Default password is admin123')
      toast.error('Incorrect password')
    }
  }

  return (
    <div className="section" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card" style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
          borderRadius: '1.25rem',
          border: '1.5px solid #E2E8F0',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '2px solid #BFDBFE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
          }}>
            <Lock size={34} color="#1E40AF" />
          </div>

          <div className="tag tag-blue" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <KeyRound size={12} /> Restricted Access Section
          </div>

          <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>
            Documentation Locked
          </h2>

          <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            This section contains confidential developer documentation, database schemas, and API references. Enter password to view.
          </p>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                style={{
                  width: '100%',
                  padding: '0.875rem 2.75rem 0.875rem 1rem',
                  fontSize: '0.9375rem',
                  borderRadius: '0.75rem',
                  border: error ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: 'white',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#DC2626', fontSize: '0.8125rem', fontWeight: 600,
                textAlign: 'left', background: '#FEF2F2', padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem', border: '1px solid #FCA5A5'
              }}>
                <ShieldAlert size={15} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{
              width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              borderRadius: '0.75rem', marginTop: '0.25rem'
            }}>
              <Unlock size={18} /> Unlock Documentation
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#F1F5F9', borderRadius: '0.625rem', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>
              💡 Hint: Default Password is <code style={{ background: '#E2E8F0', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 700, color: '#1E40AF' }}>admin123</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

let isSessionUnlocked = false

export default function DocumentationPage() {
  const [isUnlocked, setIsUnlocked] = useState(isSessionUnlocked)

  const handleUnlock = () => {
    isSessionUnlocked = true
    setIsUnlocked(true)
  }

  const handleLock = () => {
    isSessionUnlocked = false
    setIsUnlocked(false)
    toast.success('Documentation locked!')
  }

  if (!isUnlocked) {
    return <LockedScreen onUnlock={handleUnlock} />
  }
  const folderStructure = `Ats Project/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Settings from .env
│   ├── database.py          # SQLAlchemy async setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py        # All ORM models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic request/response models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── resume.py        # Upload, parse, JD endpoints
│   │   ├── analysis.py      # ATS, match, suggestions
│   │   ├── company.py       # Company analysis
│   │   └── reports.py       # PDF/Excel export
│   ├── services/
│   │   ├── __init__.py
│   │   ├── resume_parser.py    # PyMuPDF + pdfplumber + docx
│   │   ├── ats_analyzer.py     # ATS scoring engine
│   │   ├── match_scorer.py     # Semantic similarity
│   │   ├── ai_suggestions.py   # OpenAI + fallback
│   │   ├── company_analyzer.py # Company research
│   │   ├── job_scraper.py      # URL job extraction
│   │   └── report_exporter.py  # PDF + Excel generation
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py        # Loguru structured logging
│   │   └── nlp_utils.py     # Keyword, skill extraction
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/api.js       # Axios client
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── UI.jsx       # Shared components
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ResumeAnalyzerPage.jsx
│   │   │   ├── CompanyAnalyzerPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   └── DocumentationPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── README.md
│   ├── INSTALLATION.md
│   ├── EXECUTION_GUIDE.md
│   └── ...
├── uploads/                 # Uploaded resume files
├── reports/                 # Generated PDF/Excel reports
├── logs/                    # Application logs
├── .env                     # Environment variables (not committed)
├── .env.example             # Template
└── ats_analyzer.db          # SQLite database`

  const backendSetup = `# 1. Create virtual environment
python -m venv venv

# 2. Activate (Windows)
.\\venv\\Scripts\\activate

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Download spaCy model
python -m spacy download en_core_web_sm

# 5. Copy and configure environment
copy .env.example .env
# Edit .env with your OPENAI_API_KEY`

  const frontendSetup = `# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173`

  const runBackend = `# From project root
# Activate virtual environment first!
.\\venv\\Scripts\\activate

# Run FastAPI server
python -m uvicorn backend.main:app --reload --port 8000

# API docs available at:
# http://localhost:8000/api/docs`

  const envVars = `OPENAI_API_KEY=sk-...           # Your OpenAI API key
DEBUG=false                      # Set true for verbose logs
DATABASE_URL=sqlite+aiosqlite:///./ats_analyzer.db
SECRET_KEY=your-long-random-key  # For JWT signing
CORS_ORIGINS=["http://localhost:5173"]
ENABLE_AI_SUGGESTIONS=true       # false = rule-based only
AI_FALLBACK_MODE=true            # Fallback if OpenAI fails
OPENAI_MODEL=gpt-4o              # gpt-4o | gpt-3.5-turbo
MAX_FILE_SIZE_MB=10`

  const apiEndpoints = `# Resume
POST   /api/resume/upload              # Upload PDF/DOCX resume
GET    /api/resume/{id}                # Get resume by ID
GET    /api/resume/                    # List all resumes

# Job Description
POST   /api/resume/job-description     # Submit JD (text or URL)
GET    /api/resume/job-description/{id}

# Analysis
POST   /api/analysis/run               # Run full analysis
GET    /api/analysis/{id}              # Get analysis result
GET    /api/analysis/{id}/dashboard    # Dashboard chart data
GET    /api/analysis/                  # List all analyses

# Company
POST   /api/company/analyze            # Analyze a company
GET    /api/company/{id}               # Get company analysis
GET    /api/company/                   # List all company analyses

# Reports
POST   /api/reports/generate?analysis_id={id}&report_type=pdf
POST   /api/reports/generate?analysis_id={id}&report_type=excel

# Health
GET    /api/health                     # Health check`

  const dbTables = `-- SQLite Tables
resumes                  -- Uploaded resumes + extracted data
job_descriptions         -- JD text + extracted requirements
resume_analyses          -- Full analysis results
company_analyses         -- Company research results
saved_reports            -- Generated PDF/Excel paths

-- Migration to PostgreSQL:
# In .env change:
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ats_db`

  const futureScope = [
    'User authentication (JWT-based) and multi-user support',
    'Chrome extension to analyze jobs directly from browser',
    'Resume builder with AI-generated content',
    'Interview preparation tips based on company data',
    'Integration with Glassdoor, AmbitionBox APIs (when available)',
    'Bulk resume screening for HR teams',
    'Resume score tracking over time',
    'Integration with LinkedIn Jobs API',
    'Mobile app (React Native)',
    'Multilingual resume support (Hindi, Spanish, etc.)',
  ]

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 1100 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 80, zIndex: 10 }}>
            <div className="card-flat" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#1F2937', marginBottom: '0.75rem' }}>📖 Contents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  ['#overview', 'Overview'],
                  ['#folder', 'Folder Structure'],
                  ['#backend-setup', 'Backend Setup'],
                  ['#frontend-setup', 'Frontend Setup'],
                  ['#env', 'Environment Variables'],
                  ['#api', 'API Reference'],
                  ['#database', 'Database'],
                  ['#deployment', 'Deployment'],
                  ['#future', 'Future Scope'],
                ].map(([href, label]) => <SidebarLink key={href} href={href} label={label} />)}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ minWidth: 0 }}>
            {/* Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <div>
                <span className="tag tag-blue" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Documentation</span>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#1F2937', marginBottom: '0.5rem' }}>
                  Developer Documentation
                </h1>
                <p style={{ color: '#6B7280', fontSize: '1.0625rem' }}>Complete setup, API reference, and deployment guide.</p>
              </div>
              <button
                onClick={handleLock}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', borderColor: '#CBD5E1', color: '#475569', borderRadius: '0.5rem', minHeight: '38px' }}
                title="Lock documentation section"
              >
                <Lock size={14} /> Lock Section
              </button>
            </div>

            <Section id="overview" icon="🎯" title="Project Overview">
              <p style={{ color: '#374151', lineHeight: 1.8 }}>
                The AI Resume & Job Match Analyzer is a full-stack web application built with <strong>React + Vite</strong> (frontend) and <strong>Python FastAPI</strong> (backend). It uses <strong>OpenAI GPT-4</strong>, <strong>Sentence Transformers</strong>, <strong>spaCy</strong>, and <strong>scikit-learn</strong> to provide comprehensive resume analysis, ATS scoring, and company research.
              </p>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#FFF8E7', borderRadius: '0.75rem', border: '1px solid #FDE68A' }}>
                <strong style={{ color: '#92400E' }}>⚠️ Important:</strong> The app works fully without an OpenAI key using rule-based fallback. Add your key in <code>.env</code> to enable premium AI features.
              </div>
            </Section>

            <Section id="folder" icon="📁" title="Folder Structure">
              <CodeBlock code={folderStructure} lang="directory-tree" />
            </Section>

            <Section id="backend-setup" icon="🐍" title="Backend Setup">
              <p style={{ color: '#374151', marginBottom: '1rem' }}>Requirements: Python 3.11+, pip</p>
              <CodeBlock code={backendSetup} lang="bash" />
            </Section>

            <Section id="frontend-setup" icon="⚛️" title="Frontend Setup">
              <p style={{ color: '#374151', marginBottom: '1rem' }}>Requirements: Node.js 18+, npm</p>
              <CodeBlock code={frontendSetup} lang="bash" />
            </Section>

            <Section id="env" icon="⚙️" title="Environment Variables">
              <CodeBlock code={envVars} lang=".env" />
            </Section>

            <Section id="api" icon="🔌" title="Running the Backend">
              <CodeBlock code={runBackend} lang="bash" />
              <p style={{ color: '#374151', marginTop: '0.75rem' }}>Visit <a href="http://localhost:8000/api/docs" target="_blank" rel="noreferrer" style={{ color: '#1E40AF', fontWeight: 600 }}>http://localhost:8000/api/docs</a> for the interactive Swagger UI.</p>
              <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#1F2937' }}>API Endpoints</h3>
              <CodeBlock code={apiEndpoints} lang="REST API" />
            </Section>

            <Section id="database" icon="💾" title="Database">
              <CodeBlock code={dbTables} lang="SQL" />
            </Section>

            <Section id="deployment" icon="🚀" title="Deployment">
              <div className="grid-responsive-2">
                {[
                  { title: 'Backend (Render/Railway)', steps: ['Push to GitHub', 'Connect repo to Render', 'Set environment variables', 'Set start command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT'] },
                  { title: 'Frontend (Vercel/Netlify)', steps: ['Push frontend/ to GitHub', 'Connect to Vercel', 'Set VITE_API_URL env var', 'Deploy — auto-builds on push'] },
                  { title: 'Database (Production)', steps: ['Create PostgreSQL instance', 'Update DATABASE_URL in .env', 'Run alembic migrations', 'Tables auto-create on first boot'] },
                  { title: 'Full Docker Compose', steps: ['docker-compose.yml provided', 'docker compose up', 'Backend on :8000, Frontend on :5173', 'Postgres included in compose'] },
                ].map(d => (
                  <div key={d.title} style={{ background: '#F8FAFF', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid #E5E7EB' }}>
                    <h4 style={{ fontWeight: 800, color: '#1E40AF', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>{d.title}</h4>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#374151', lineHeight: 1.7 }}>
                      {d.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="future" icon="🔮" title="Future Scope">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.75rem' }}>
                {futureScope.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.875rem', background: '#F0FDF4', borderRadius: '0.75rem', border: '1px solid #BBF7D0' }}>
                    <span style={{ color: '#10B981', flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

