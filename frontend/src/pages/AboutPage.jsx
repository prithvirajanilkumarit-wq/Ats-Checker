export default function AboutPage() {
  const techStack = {
    Frontend: [
      { name: 'React 18', desc: 'Component-based UI framework', icon: '⚛️' },
      { name: 'Tailwind CSS', desc: 'Utility-first CSS framework', icon: '🎨' },
      { name: 'Recharts', desc: 'Chart library for React', icon: '📊' },
      { name: 'Axios', desc: 'HTTP client for API calls', icon: '🔄' },
      { name: 'React Router', desc: 'Client-side navigation', icon: '🧭' },
      { name: 'Framer Motion', desc: 'Animations and transitions', icon: '✨' },
    ],
    Backend: [
      { name: 'Python 3.11+', desc: 'Core programming language', icon: '🐍' },
      { name: 'FastAPI', desc: 'Modern async REST framework', icon: '⚡' },
      { name: 'SQLAlchemy', desc: 'ORM for database operations', icon: '🗄️' },
      { name: 'Pydantic', desc: 'Data validation and settings', icon: '✅' },
      { name: 'Uvicorn', desc: 'ASGI production server', icon: '🚀' },
    ],
    'AI & NLP': [
      { name: 'OpenAI GPT-4o', desc: 'LLM for suggestions and analysis', icon: '🤖' },
      { name: 'Sentence Transformers', desc: 'Semantic similarity scoring', icon: '🧠' },
      { name: 'spaCy', desc: 'NLP pipeline and NER', icon: '🔬' },
      { name: 'scikit-learn', desc: 'TF-IDF and ML algorithms', icon: '🎯' },
    ],
    'Data & Analysis': [
      { name: 'Pandas', desc: 'Data manipulation and analysis', icon: '🐼' },
      { name: 'NumPy', desc: 'Numerical computation', icon: '🔢' },
      { name: 'SQLite / PostgreSQL', desc: 'Database storage', icon: '💾' },
      { name: 'openpyxl / xlsxwriter', desc: 'Excel report generation', icon: '📈' },
      { name: 'FPDF2 / ReportLab', desc: 'PDF report generation', icon: '📄' },
    ],
    'Resume Parsing': [
      { name: 'PyMuPDF', desc: 'Primary PDF text extraction', icon: '📑' },
      { name: 'pdfplumber', desc: 'Fallback PDF parser', icon: '🔍' },
      { name: 'python-docx', desc: 'DOCX file parsing', icon: '📝' },
    ],
  }

  const metrics = [
    { name: 'ATS Score', calc: 'Weighted average of: Keyword Match (30%), Skills Match (25%), Experience Match (20%), Education Match (10%), Formatting Score (10%), Soft Skills (5%)', range: '0–100' },
    { name: 'Resume Match Score', calc: 'Combines semantic similarity from Sentence Transformers (40%) + ATS component weighted score (60%). Categories: Low (<40), Medium (40-60), High (60-80), Very High (>80)', range: '0–100' },
    { name: 'Keyword Match', calc: 'TF-IDF based top keywords extracted from JD. Overlap with resume keywords divided by total JD keywords.', range: '0–100' },
    { name: 'Skills Match', calc: 'Set intersection of detected skills (from our 100+ skill library) between resume and JD.', range: '0–100' },
    { name: 'Experience Match', calc: 'Regex-extracted years from JD requirement vs resume experience. If JD requires 3+ years and resume shows 3.5, score = 100.', range: '0–100' },
    { name: 'Formatting Score', calc: 'Checks for: section headers, contact info, action verbs, word count (200-1500), and quantifiable achievements.', range: '0–100' },
  ]

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '3rem', background: 'linear-gradient(135deg, #EFF6FF, #FFF8E7)', borderRadius: '1.5rem' }}>
          <span className="tag tag-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>MCA Final Year Project</span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '1rem', color: '#1F2937' }}>
            AI Resume & Job Match Analyzer
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#4B5563', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            A production-quality data analytics project demonstrating real-world applications of Machine Learning, NLP, REST APIs, and Data Visualization.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="card-flat" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1E40AF', marginBottom: '1rem' }}>🎯 Problem Statement</h2>
          <p style={{ color: '#374151', lineHeight: 1.8 }}>
            Job seekers often submit resumes without understanding how Applicant Tracking Systems (ATS) filter them. 
            Many qualified candidates are rejected before a human ever reads their resume — simply because of poor keyword alignment, 
            formatting issues, or missing skills. Additionally, candidates lack structured tools to research companies before applying, 
            leading to poor culture fit and wasted effort.
          </p>
        </div>

        {/* Solution */}
        <div className="card-flat" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#10B981', marginBottom: '1rem' }}>💡 Solution</h2>
          <p style={{ color: '#374151', lineHeight: 1.8, marginBottom: '1rem' }}>
            This application provides an end-to-end AI-powered job search assistant that:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {[
              '📤 Parses and extracts structured data from PDF/DOCX resumes',
              '🎯 Calculates multi-dimensional ATS scores with explanations',
              '🤝 Computes semantic match scores using AI embeddings',
              '✨ Generates personalized improvement suggestions via GPT-4',
              '🏢 Researches companies with source-cited analysis',
              '📊 Visualizes all data in an interactive dashboard',
            ].map((item, i) => (
              <div key={i} style={{ background: '#F8FAFF', padding: '0.875rem', borderRadius: '0.75rem', fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Data Analytics Skills */}
        <div className="card-flat" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#8B5CF6', marginBottom: '1rem' }}>📚 Data Analytics Competencies Demonstrated</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
            {[
              { skill: 'Python', desc: 'Primary backend language' },
              { skill: 'Pandas & NumPy', desc: 'Data processing and computation' },
              { skill: 'SQL (SQLite)', desc: 'Structured data storage and queries' },
              { skill: 'Machine Learning', desc: 'scikit-learn, TF-IDF, cosine similarity' },
              { skill: 'NLP', desc: 'spaCy, Sentence Transformers, text mining' },
              { skill: 'REST APIs', desc: 'FastAPI with full CRUD operations' },
              { skill: 'Data Visualization', desc: 'Recharts: radar, bar, pie, progress' },
              { skill: 'Excel Reports', desc: 'openpyxl automated report generation' },
              { skill: 'Power BI Ready', desc: 'SQLite DB exportable to Power BI' },
              { skill: 'OpenAI/GPT-4', desc: 'LLM integration for AI suggestions' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '0.875rem', background: '#F5F3FF', borderRadius: '0.75rem', border: '1px solid #EDE9FE' }}>
                <div style={{ fontWeight: 700, color: '#6D28D9', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.skill}</div>
                <div style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How Scores Work */}
        <div className="card-flat" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#F59E0B', marginBottom: '1.25rem' }}>📐 How Scoring Works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {metrics.map(m => (
              <div key={m.name} style={{ background: '#FFFBEB', padding: '1.125rem', borderRadius: '0.875rem', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 800, color: '#92400E' }}>{m.name}</span>
                  <span className="tag tag-yellow" style={{ fontSize: '0.75rem' }}>Range: {m.range}</span>
                </div>
                <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{m.calc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Grid */}
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1F2937', marginBottom: '1.25rem' }}>🛠️ Technology Stack</h2>
        {Object.entries(techStack).map(([category, items]) => (
          <div key={category} className="card-flat" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1E40AF', marginBottom: '1rem', fontSize: '1.0625rem' }}>{category}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {items.map(item => (
                <div key={item.name} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Architecture Diagram */}
        <div className="card-flat" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1F2937', marginBottom: '1.25rem' }}>🏗️ System Architecture</h2>
          <div style={{ background: '#0F172A', borderRadius: '0.875rem', padding: '1.5rem', overflowX: 'auto' }}>
            <pre style={{ color: '#E2E8F0', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>{`
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                   │
│  ┌──────────┐ ┌───────────┐ ┌─────────┐ ┌───────────────┐  │
│  │  Home    │ │  Resume   │ │ Company │ │   Dashboard   │  │
│  │  Page    │ │ Analyzer  │ │Analyzer │ │ (Charts/Data) │  │
│  └──────────┘ └───────────┘ └─────────┘ └───────────────┘  │
│                      Axios API Client                         │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼────────────────────────────────────┐
│                  BACKEND (FastAPI + Python)                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                    API Routers                        │    │
│  │  /resume  │  /analysis  │  /company  │  /reports     │    │
│  └─────────┬──────────────────────────────┬────────────┘    │
│            │          Services             │                  │
│  ┌─────────▼───────┐  ┌───────────────────▼──────────┐     │
│  │  ResumeParser   │  │      ATS Analyzer             │     │
│  │  (PyMuPDF,      │  │   - Keyword Match (30%)       │     │
│  │   pdfplumber,   │  │   - Skills Match (25%)        │     │
│  │   python-docx)  │  │   - Experience Match (20%)    │     │
│  └─────────────────┘  │   - Education Match (10%)     │     │
│  ┌─────────────────┐  │   - Formatting (10%)          │     │
│  │  MatchScorer    │  │   - Soft Skills (5%)          │     │
│  │  (SentenceT +   │  └───────────────────────────────┘     │
│  │   TF-IDF)       │  ┌───────────────────────────────┐     │
│  └─────────────────┘  │   AI Suggestions (OpenAI)     │     │
│  ┌─────────────────┐  │   + Rule-based Fallback       │     │
│  │ CompanyAnalyzer │  └───────────────────────────────┘     │
│  │ (OpenAI + Rules)│  ┌───────────────────────────────┐     │
│  └─────────────────┘  │   Report Exporter             │     │
│                        │   (FPDF2 + openpyxl)         │     │
│                        └───────────────────────────────┘     │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                DATABASE (SQLite → PostgreSQL)                  │
│  resumes │ job_descriptions │ resume_analyses                  │
│  company_analyses │ saved_reports                              │
└──────────────────────────────────────────────────────────────┘
`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
