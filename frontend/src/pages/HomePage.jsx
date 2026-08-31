import { Link } from 'react-router-dom'
import { Upload, BarChart2, Building2, Target, Star, ChevronRight, ArrowRight } from 'lucide-react'
import { SectionHeader } from '../components/UI'

// ── Feature Card ───────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay = 0 }) {
  return (
    <div className="card" style={{
      padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem',
      animation: `fadeIn 0.6s ease ${delay}ms both`,
    }}>
      <div className="feature-icon" style={{ background: color + '1A' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1F2937' }}>{title}</h3>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0 }}>{desc}</p>
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#1E40AF', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.375rem', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

// ── Testimonial ────────────────────────────────────────────────
function Testimonial({ name, role, text, avatar }) {
  return (
    <div className="card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
        {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#F59E0B" color="#F59E0B" />)}
      </div>
      <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>"{text}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '1rem',
        }}>{avatar}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1F2937' }}>{name}</div>
          <div style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{role}</div>
        </div>
      </div>
    </div>
  )
}

// ── FAQ Item ───────────────────────────────────────────────────
function FAQItem({ q, a }) {
  return (
    <details style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem', marginBottom: '1rem' }}>
      <summary style={{
        cursor: 'pointer', fontWeight: 600, fontSize: '1rem',
        color: '#1F2937', padding: '0.5rem 0', listStyle: 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {q}
        <ChevronRight size={18} color="#6B7280" />
      </summary>
      <p style={{ color: '#6B7280', lineHeight: 1.7, marginTop: '0.75rem', paddingLeft: '0.25rem', fontSize: '0.9375rem' }}>{a}</p>
    </details>
  )
}

export default function HomePage() {
  const features = [
    { icon: '🎯', title: 'ATS Score Analysis', desc: 'Get a detailed ATS compatibility score across keywords, skills, experience, education, and formatting — all scored 0-100.', color: '#1E40AF', delay: 0 },
    { icon: '🤝', title: 'Resume Match Score', desc: 'Semantic AI-powered matching using Sentence Transformers. Understand WHY your resume matches or doesn\'t match the role.', color: '#3B82F6', delay: 100 },
    { icon: '🏢', title: 'Company Insights', desc: 'Research any company before applying. See ratings, pros, cons, salary ranges, and interview difficulty with full source citations.', color: '#10B981', delay: 200 },
    { icon: '✨', title: 'AI Suggestions', desc: 'Get AI-powered personalized suggestions: missing skills, certifications, project ideas, action verbs, and grammar fixes.', color: '#F59E0B', delay: 300 },
    { icon: '📊', title: 'Visual Dashboard', desc: 'Beautiful radar charts, bar charts, and progress bars that make your analysis easy to understand at a glance.', color: '#8B5CF6', delay: 400 },
    { icon: '📄', title: 'Export Reports', desc: 'Download your complete analysis as a professionally formatted PDF or Excel report for sharing with mentors.', color: '#EF4444', delay: 500 },
  ]

  const testimonials = [
    {
      name: 'Priya Sharma', role: 'Software Engineer at TCS', avatar: 'P',
      text: 'This tool helped me identify exactly what was missing in my resume. My ATS score went from 42 to 81 after following the suggestions. Got shortlisted in 3 weeks!',
    },
    {
      name: 'Rahul Mehta', role: 'Data Analyst at Infosys', avatar: 'R',
      text: 'The company analyzer saved me hours of research. I walked into interviews knowing exactly the culture, ratings, and what to ask. Incredible tool!',
    },
    {
      name: 'Anjali Patel', role: 'MCA Graduate, Placed at Wipro', avatar: 'A',
      text: 'As a final year student, I was clueless about ATS systems. This project explains everything beautifully. My placement preparation became so much more structured.',
    },
  ]

  const faqs = [
    { q: 'What is an ATS score?', a: 'An ATS (Applicant Tracking System) score measures how well your resume matches a job description. Companies use ATS software to filter resumes before human review. A higher ATS score means your resume is more likely to pass automated screening.' },
    { q: 'How is the Resume Match Score calculated?', a: 'The Resume Match Score combines semantic similarity (using Sentence Transformers AI) with ATS component scores (skills, experience, education, keywords). It gives you a holistic view of how well your profile matches the job — without making claims about hiring probability.' },
    { q: 'Do you need an OpenAI key?', a: 'No! The app works fully without an OpenAI key using our built-in rule-based engine. Adding an OpenAI key enables premium AI suggestions, company analysis, and more nuanced feedback.' },
    { q: 'What file formats are supported?', a: 'We support PDF and DOCX (Word) resume files up to 10MB. The parser uses PyMuPDF and pdfplumber for PDFs, and python-docx for Word files.' },
    { q: 'Is my data safe?', a: 'Yes. Your data is stored locally in an SQLite database on your own machine. No data is shared with external services except for the OpenAI API calls (if you configure a key), which are governed by OpenAI\'s privacy policy.' },
  ]

  const steps = [
    { n: '1', title: 'Upload Resume', desc: 'PDF or DOCX. We extract all your info automatically.', icon: <Upload size={20} />, color: '#1E40AF' },
    { n: '2', title: 'Paste Job Description', desc: 'Paste JD text or enter a job URL to scrape it.', icon: <Target size={20} />, color: '#3B82F6' },
    { n: '3', title: 'Get Analysis', desc: 'ATS score, match score, and AI suggestions instantly.', icon: <BarChart2 size={20} />, color: '#10B981' },
    { n: '4', title: 'Research Company', desc: 'Analyze company culture, ratings, salary, and more.', icon: <Building2 size={20} />, color: '#F59E0B' },
  ]

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-gradient" style={{ padding: '5rem 0 4rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', background: '#DBEAFE', color: '#1E40AF', padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid #BFDBFE' }}>
            <img src="/logo.png" alt="ATS Resume Checker" style={{ height: '24px', width: 'auto', borderRadius: '4px' }} />
            ATS Resume Checker — Scan • Analyze • Improve
          </div>

          <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', color: '#0F172A' }}>
            Land Your Dream Job with
            <br />
            <span style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Resume Analysis
            </span>
          </h1>

          <p style={{ fontSize: '1.1875rem', color: '#4B5563', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Get your ATS score, resume match analysis, AI-powered suggestions, and company insights — all in one beautiful dashboard.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/resume-analyzer" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
              <Upload size={18} /> Analyze My Resume
            </Link>
            <Link to="/company-analyzer" className="btn btn-outline btn-lg">
              <Building2 size={18} /> Research a Company
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '3.5rem', flexWrap: 'wrap' }}>
            <StatCard value="10+" label="ATS Metrics Analyzed" />
            <StatCard value="AI" label="Advanced Engine" />
            <StatCard value="PDF+DOCX" label="File Formats" />
            <StatCard value="Free" label="Open Source" />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <SectionHeader label="Simple Process" title="How It Works" subtitle="Four steps to a stronger resume and a smarter job search" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', marginBottom: '1rem',
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', boxShadow: `0 4px 12px ${step.color}40`,
                }}>
                  {step.icon}
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: step.color, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step {step.n}</div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1F2937' }}>{step.title}</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionHeader label="Features" title="Everything You Need to Succeed" subtitle="A complete toolkit for modern job seekers — from resume scoring to company research" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>
            Ready to Optimize Your Resume?
          </h2>
          <p style={{ color: '#BFDBFE', fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Upload your resume and get an instant AI-powered analysis, completely free.
          </p>
          <Link to="/resume-analyzer" className="btn btn-lg" style={{ background: 'white', color: '#1E40AF', fontWeight: 700 }}>
            Start Free Analysis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <SectionHeader label="Success Stories" title="What Job Seekers Say" subtitle="Real feedback from students and professionals who used this tool" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map((t, i) => <Testimonial key={i} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <SectionHeader label="FAQ" title="Frequently Asked Questions" />
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>
    </div>
  )
}
