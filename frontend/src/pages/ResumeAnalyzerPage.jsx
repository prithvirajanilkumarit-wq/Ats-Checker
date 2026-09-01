import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Download, RefreshCw } from 'lucide-react'
import { uploadResume, createJobDescription, runAnalysis, downloadReport } from '../api/api'
import { ScoreRing, ProgressBar, MatchBadge, SkillTag, ErrorAlert } from '../components/UI'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'

// ── Resume Dropzone ────────────────────────────────────────────
function ResumeDropzone({ onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      const res = await uploadResume(file, setProgress)
      toast.success('Resume uploaded and parsed!')
      onUploaded(res.data)
    } catch (e) {
      setError(e.message)
      toast.error(e.message)
    } finally {
      setUploading(false)
    }
  }, [onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}
        style={{ padding: '3rem 2rem', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer' }}>
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, color: '#1E40AF', marginBottom: '0.5rem' }}>Uploading & Parsing...</p>
            <div className="progress-track" style={{ maxWidth: 300, margin: '0 auto' }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: '#1E40AF' }} />
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>{progress}%</p>
          </div>
        ) : (
          <div>
            <div style={{
              width: 64, height: 64, background: '#DBEAFE', borderRadius: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
            }}>
              <Upload size={28} color="#1E40AF" />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#1F2937', marginBottom: '0.375rem' }}>
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
              or click to browse files
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <span className="tag tag-blue">PDF</span>
              <span className="tag tag-blue">DOCX</span>
              <span className="tag tag-gray">Max 10MB</span>
            </div>
          </div>
        )}
      </div>
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} style={{ marginTop: '1rem' }} />}
    </div>
  )
}

// ── Resume Preview Card ────────────────────────────────────────
function ResumePreview({ resume }) {
  return (
    <div className="card-flat" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 40, height: 40, background: '#DBEAFE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={20} color="#1E40AF" />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#1F2937' }}>{resume.filename}</div>
          <div style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 600 }}>✓ Parsed successfully</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
        {[
          ['👤 Name', resume.candidate_name],
          ['📧 Email', resume.email],
          ['📱 Phone', resume.phone],
          ['💼 Experience', `${resume.experience_years || 0} years`],
        ].map(([l, v]) => v ? (
          <div key={l} style={{ background: '#F8FAFF', padding: '0.625rem', borderRadius: '0.5rem' }}>
            <div style={{ color: '#6B7280', fontSize: '0.75rem', marginBottom: '0.125rem' }}>{l.split(' ')[0]} {l.split(' ').slice(1).join(' ')}</div>
            <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.875rem' }}>{v}</div>
          </div>
        ) : null)}
      </div>
      {resume.extracted_skills?.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Detected Skills ({resume.extracted_skills.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {resume.extracted_skills.slice(0, 16).map(s => <SkillTag key={s} name={s} type="matched" />)}
            {resume.extracted_skills.length > 16 && (
              <span className="tag tag-gray">+{resume.extracted_skills.length - 16} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── JD Input Panel ─────────────────────────────────────────────
function JDInputPanel({ onSubmitted }) {
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (mode === 'text' && !text.trim()) return setError('Please paste a job description.')
    if (mode === 'url' && !url.trim()) return setError('Please enter a job URL.')
    setLoading(true)
    try {
      const payload = mode === 'text' ? { raw_text: text } : { source_url: url }
      const res = await createJobDescription(payload)
      toast.success('Job description processed!')
      onSubmitted(res.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: '#F3F4F6', padding: '0.25rem', borderRadius: '0.5rem' }}>
        {[['text', '📝 Paste Text'], ['url', '🔗 Enter URL']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              flex: 1, padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
              background: mode === m ? 'white' : 'transparent',
              color: mode === m ? '#1E40AF' : '#6B7280',
              boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >{label}</button>
        ))}
      </div>

      {mode === 'text' ? (
        <textarea
          className="input textarea"
          style={{ minHeight: 180 }}
          placeholder="Paste the full job description here...&#10;&#10;Include requirements, responsibilities, and skills."
          value={text}
          onChange={e => setText(e.target.value)}
        />
      ) : (
        <div>
          <input
            className="input"
            type="url"
            placeholder="https://www.linkedin.com/jobs/view/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            {['LinkedIn', 'Naukri', 'Indeed', 'Foundit', 'Glassdoor'].map(s => (
              <span key={s} className="tag tag-blue" style={{ fontSize: '0.75rem' }}>✓ {s}</span>
            ))}
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '0.5rem' }}>
            * URL scraping works where the site permits automated access. If it fails, please paste the text.
          </p>
        </div>
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      <button
        className="btn btn-primary"
        style={{ marginTop: '1rem', width: '100%' }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</> : 'Process Job Description →'}
      </button>
    </div>
  )
}

// ── ATS Score Panel ────────────────────────────────────────────
function ATSScorePanel({ ats }) {
  const metrics = [
    { label: 'Skills Match', value: ats.skills_match_score },
    { label: 'Experience Match', value: ats.experience_match_score },
    { label: 'Education Match', value: ats.education_match_score },
    { label: 'Keyword Match', value: ats.keyword_match_score },
    { label: 'Formatting Score', value: ats.formatting_score },
    { label: 'Soft Skills', value: ats.soft_skills_score },
  ]

  const radarData = metrics.map(m => ({ metric: m.label.replace(' Match', '').replace(' Score', ''), score: m.value, fullMark: 100 }))

  return (
    <div className="card-flat" style={{ padding: '1.75rem' }}>
      <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.5rem', color: '#1F2937' }}>
        📊 ATS Score Breakdown
      </h3>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <ScoreRing score={ats.overall_ats_score} label="ATS Score" size={130} />
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {metrics.map(m => <ProgressBar key={m.label} label={m.label} value={m.value} />)}
        </div>
      </div>
      {/* Radar Chart */}
      <div style={{ height: 260, marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Radar name="Score" dataKey="score" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.18} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Skills Panel ───────────────────────────────────────────────
function SkillsPanel({ matched, missing }) {
  return (
    <div className="card-flat" style={{ padding: '1.75rem' }}>
      <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.25rem', color: '#1F2937' }}>🎯 Skills Analysis</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.875rem', marginBottom: '0.625rem' }}>
            ✅ Matched Skills ({matched.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {matched.map(s => <SkillTag key={s} name={s} type="matched" />)}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.875rem', marginBottom: '0.625rem' }}>
            ❌ Missing Skills ({missing.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {missing.map(s => <SkillTag key={s} name={s} type="missing" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Match Score Panel ──────────────────────────────────────────
function MatchScorePanel({ match }) {
  return (
    <div className="card-flat" style={{ padding: '1.75rem' }}>
      <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.25rem', color: '#1F2937' }}>🤝 Resume Match Analysis</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <ScoreRing score={match.match_score} label="Match Score" size={110} />
        <div>
          <MatchBadge category={match.match_category} />
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.5rem', maxWidth: 340 }}>
            Based on semantic similarity + skills, experience, education, and keyword overlap.
          </p>
        </div>
      </div>
      {/* Reasons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.875rem', marginBottom: '0.75rem' }}>💪 Strengths</div>
          {match.strengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>{s}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.875rem', marginBottom: '0.75rem' }}>⚠️ Gaps</div>
          {match.weaknesses.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }}>✗</span>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>{w}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Suggestions Panel ──────────────────────────────────────────
function SuggestionsPanel({ suggestions }) {
  const groups = [
    { key: 'resume_rewrite_suggestions', icon: '✍️', title: 'Resume Rewrite Tips', color: '#1E40AF' },
    { key: 'suggested_skills', icon: '🚀', title: 'Skills to Add', color: '#10B981' },
    { key: 'recommended_certifications', icon: '🏆', title: 'Recommended Certifications', color: '#F59E0B' },
    { key: 'suggested_projects', icon: '💡', title: 'Project Ideas', color: '#8B5CF6' },
    { key: 'action_verb_suggestions', icon: '⚡', title: 'Strong Action Verbs', color: '#3B82F6' },
    { key: 'quantify_suggestions', icon: '📈', title: 'Quantify Your Achievements', color: '#EF4444' },
    { key: 'keyword_suggestions', icon: '🔑', title: 'Keywords to Include', color: '#6B7280' },
    { key: 'grammar_suggestions', icon: '📝', title: 'Grammar & Style Tips', color: '#D97706' },
  ]

  return (
    <div className="card-flat" style={{ padding: '1.75rem' }}>
      <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.5rem', color: '#1F2937' }}>
        ✨ AI Resume Improvement Suggestions
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {groups.map(g => {
          const items = suggestions[g.key] || []
          if (!items.length) return null
          return (
            <div key={g.key} style={{ background: '#F8FAFF', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid #EFF6FF' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: g.color, marginBottom: '0.75rem' }}>
                {g.icon} {g.title}
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {items.slice(0, 5).map((item, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LoadingAnalysisCard() {
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { title: 'Extracting Resume & Job Data', sub: 'Parsing skills, contact info, and experience...' },
    { title: 'Scoring ATS & Semantic Match', sub: 'Comparing TF-IDF & Sentence Transformer vectors...' },
    { title: 'Generating AI Suggestions', sub: 'Crafting personalized rewrites & certification paths...' },
  ]

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep(1), 1000)
    const timer2 = setTimeout(() => setActiveStep(2), 2200)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [])

  return (
    <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <div className="spinner" style={{ margin: '0 auto 1.5rem', width: 48, height: 48, borderWidth: 3, borderColor: '#3B82F6', borderTopColor: 'transparent' }} />
      <h3 style={{ fontWeight: 800, fontSize: '1.35rem', marginBottom: '0.5rem', color: '#0F172A' }}>
        Analyzing Your Resume with AI...
      </h3>
      <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Please wait a moment while our algorithms evaluate your profile.
      </p>

      {/* Progress Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', textAlign: 'left', background: '#F8FAFC', padding: '1.25rem 1.5rem', borderRadius: '0.875rem', border: '1px solid #E2E8F0' }}>
        {steps.map((step, idx) => {
          const isDone = activeStep > idx
          const isCurrent = activeStep === idx
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', opacity: activeStep >= idx ? 1 : 0.4, transition: 'all 0.3s' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isDone ? '#10B981' : isCurrent ? '#3B82F6' : '#CBD5E1',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0
              }}>
                {isDone ? '✓' : idx + 1}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: isCurrent ? '#1E40AF' : '#1F2937' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.7875rem', color: '#6B7280' }}>
                  {step.sub}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function ResumeAnalyzerPage() {
  const [step, setStep] = useState(0)
  const [resume, setResume] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  const handleResumeUploaded = (data) => {
    setResume(data)
    setStep(1)
  }

  const handleJDSubmitted = (data) => {
    handleRunAnalysis(resume.id, data.id)
  }

  const handleRunAnalysis = async (resumeId, jdId) => {
    setRunning(true)
    setError('')
    setStep(2)
    try {
      const res = await runAnalysis(resumeId, jdId)
      setAnalysis(res.data)
    } catch (e) {
      const msg = e.message || 'Analysis failed. Please try again.'
      toast.error(msg)
      if (msg.includes('not found') || msg.includes('404')) {
        setError('Resume session expired on server restart. Please re-upload your resume.')
        setStep(0)
        setResume(null)
      } else {
        setError(msg)
        setStep(1)
      }
    } finally {
      setRunning(false)
    }
  }

  const handleDownload = async (type) => {
    setDownloading(true)
    try {
      await downloadReport(analysis.id, type)
      toast.success(`${type.toUpperCase()} report downloaded!`)
    } catch (e) {
      toast.error('Download failed: ' + e.message)
    } finally {
      setDownloading(false)
    }
  }

  const handleReset = () => {
    setStep(0); setResume(null); setAnalysis(null); setError('')
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="tag tag-blue" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Resume Analyzer</span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#1F2937', marginBottom: '0.5rem' }}>
            AI Resume & ATS Analyzer
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.0625rem' }}>
            Upload your resume, add a job description, and get a comprehensive AI-powered analysis in seconds.
          </p>
        </div>

        {/* Step 0: Upload Resume */}
        {step === 0 && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>📤 Step 1: Upload Your Resume</h2>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Upload a PDF or DOCX file. We'll extract all your details automatically.</p>
            <ResumeDropzone onUploaded={handleResumeUploaded} />
          </div>
        )}

        {/* Step 1: JD Input */}
        {step === 1 && (
          <div>
            {error && <ErrorAlert message={error} onDismiss={() => setError('')} style={{ marginBottom: '1.5rem' }} />}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>✅ Resume Uploaded</h2>
                  <button onClick={() => { setStep(0); setResume(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 600, fontSize: '0.875rem' }}>
                    Re-upload
                  </button>
                </div>
                <ResumePreview resume={resume} />
              </div>
              <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.5rem' }}>📋 Step 2: Job Description</h2>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Paste the JD text or provide a job URL.</p>
                <JDInputPanel onSubmitted={handleJDSubmitted} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Running / Results */}
        {step === 2 && (
          <div>
            {running ? (
              <LoadingAnalysisCard />
            ) : error ? (
              <div>
                <ErrorAlert message={error} />
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleReset}>Start Over</button>
              </div>
            ) : analysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>📊 Analysis Results</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline btn-sm" onClick={handleReset}>
                      <RefreshCw size={14} /> New Analysis
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleDownload('pdf')} disabled={downloading}>
                      <Download size={14} /> PDF Report
                    </button>
                    <button className="btn btn-accent btn-sm" onClick={() => handleDownload('excel')} disabled={downloading}>
                      <Download size={14} /> Excel Report
                    </button>
                  </div>
                </div>
                {/* Score Overview */}
                <div className="card-flat" style={{ padding: '1.75rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <ScoreRing score={analysis.ats_score.overall_ats_score} label="ATS Score" size={130} />
                  <ScoreRing score={analysis.match_score.match_score} label="Match Score" size={130} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <MatchBadge category={analysis.match_score.match_category} />
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Analysis ID: #{analysis.id}</div>
                  </div>
                </div>
                <ATSScorePanel ats={analysis.ats_score} />
                <SkillsPanel matched={analysis.ats_score.matched_skills} missing={analysis.ats_score.missing_skills} />
                <MatchScorePanel match={analysis.match_score} />
                <SuggestionsPanel suggestions={analysis.suggestions} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
