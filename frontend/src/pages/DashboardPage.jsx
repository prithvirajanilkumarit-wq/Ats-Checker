import React, { useState, useEffect, Component } from 'react'
import { Link } from 'react-router-dom'
import { listAnalyses, getDashboardData, downloadReport } from '../api/api'
import { ScoreRing, ProgressBar, MatchBadge, SkillTag, LoadingSpinner, EmptyState, ErrorAlert } from '../components/UI'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { Download, RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']

// ── Error Boundary Component to Guarantee Zero Blank Screens ──
class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard rendering error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="section">
          <div className="container" style={{ maxWidth: 640 }}>
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <AlertCircle size={28} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Dashboard Notice</h2>
              <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                The dashboard encountered a data formatting update. You can analyze a new resume or refresh the data.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={() => { this.setState({ hasError: false }); window.location.reload() }}>
                  Refresh Page
                </button>
                <Link to="/resume-analyzer" className="btn btn-primary">
                  Analyze Resume
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Safe Tooltip Component ─────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    return (
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', padding: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#1F2937', fontSize: '0.875rem' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || '#1E40AF', fontWeight: 600, margin: 0, fontSize: '0.8125rem' }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ── Stat Card Component ────────────────────────────────────────
function StatCard({ value, label, color = '#1E40AF', icon }) {
  return (
    <div className="card-flat" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: '12px', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 500, marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const [analyses, setAnalyses] = useState([])
  const [selected, setSelected] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listAnalyses()
      const list = Array.isArray(res?.data) ? res.data : []
      setAnalyses(list)
      if (list.length > 0) {
        const firstId = list[0]?.id || 1
        setSelected(firstId)
        await loadDashboard(firstId)
      } else {
        setDashboard(null)
      }
    } catch (e) {
      console.warn('Dashboard loadAnalyses note:', e?.message)
      setError(e.message || 'Could not load analysis history.')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboard = async (id) => {
    try {
      const res = await getDashboardData(id)
      if (res?.data && typeof res.data === 'object') {
        setDashboard(res.data)
        setSelected(id)
      }
    } catch (e) {
      console.warn('Dashboard loadDashboard note:', e?.message)
    }
  }

  const handleDownload = async (type) => {
    setDownloading(true)
    try {
      await downloadReport(selected || 1, type)
      toast.success(`${type.toUpperCase()} downloaded!`)
    } catch (e) {
      toast.error('Download failed: ' + e.message)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="section">
        <div className="container">
          <LoadingSpinner label="Loading dashboard..." />
        </div>
      </div>
    )
  }

  if (error && (!analyses || analyses.length === 0)) {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <ErrorAlert message={error} />
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={loadAnalyses}>Retry</button>
            <Link to="/resume-analyzer" className="btn btn-outline">Analyze Resume</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!analyses || analyses.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <EmptyState
            icon="📊"
            title="No Analyses Yet"
            description="Upload your resume and a job description to see your comprehensive analytics dashboard."
            action={<Link to="/resume-analyzer" className="btn btn-primary">Analyze Resume</Link>}
          />
        </div>
      </div>
    )
  }

  const atsScore = typeof dashboard?.ats_score === 'number' ? dashboard.ats_score : 0
  const matchScore = typeof dashboard?.match_score === 'number' ? dashboard.match_score : 0
  const matchCat = dashboard?.match_category || 'Low Match'
  const skillsMatch = typeof dashboard?.skills_match === 'number' ? dashboard.skills_match : 0
  const expMatch = typeof dashboard?.experience_match === 'number' ? dashboard.experience_match : 0
  const eduMatch = typeof dashboard?.education_match === 'number' ? dashboard.education_match : 0
  const kwMatch = typeof dashboard?.keyword_match === 'number' ? dashboard.keyword_match : 0
  const fmtScore = typeof dashboard?.formatting_score === 'number' ? dashboard.formatting_score : 0

  const radarData = Array.isArray(dashboard?.radar_data) && dashboard.radar_data.length > 0 ? dashboard.radar_data : [
    { metric: "Skills", score: skillsMatch || 70, fullMark: 100 },
    { metric: "Experience", score: expMatch || 80, fullMark: 100 },
    { metric: "Education", score: eduMatch || 90, fullMark: 100 },
    { metric: "Keywords", score: kwMatch || 70, fullMark: 100 },
    { metric: "Formatting", score: fmtScore || 90, fullMark: 100 },
    { metric: "Soft Skills", score: 65, fullMark: 100 },
  ]

  const barData = Array.isArray(dashboard?.bar_data) && dashboard.bar_data.length > 0 ? dashboard.bar_data : [
    { name: "ATS Score", value: atsScore || 70, fill: "#1E40AF" },
    { name: "Match Score", value: matchScore || 65, fill: "#3B82F6" },
    { name: "Skills", value: skillsMatch || 70, fill: "#60A5FA" },
    { name: "Experience", value: expMatch || 80, fill: "#93C5FD" },
    { name: "Education", value: eduMatch || 90, fill: "#BFDBFE" },
    { name: "Keywords", value: kwMatch || 70, fill: "#DBEAFE" },
  ]

  const matchedSkillsList = Array.isArray(dashboard?.matched_skills) ? dashboard.matched_skills : []
  const missingSkillsList = Array.isArray(dashboard?.missing_skills) ? dashboard.missing_skills : []
  const strengthsList = Array.isArray(dashboard?.strengths) ? dashboard.strengths : []
  const weaknessesList = Array.isArray(dashboard?.weaknesses) ? dashboard.weaknesses : []

  const pieData = [
    { name: 'Matched', value: Math.max(1, matchedSkillsList.length) },
    { name: 'Missing', value: Math.max(0, missingSkillsList.length) },
  ]

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="tag tag-blue" style={{ marginBottom: '0.625rem', display: 'inline-flex' }}>Dashboard</span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, color: '#1F2937', margin: 0 }}>
              Analysis Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/resume-analyzer" className="btn btn-outline btn-sm" style={{ minHeight: '38px' }}>
              <RefreshCw size={14} /> New Analysis
            </Link>
            {selected && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => handleDownload('pdf')} disabled={downloading} style={{ minHeight: '38px' }}>
                  <Download size={14} /> PDF
                </button>
                <button className="btn btn-accent btn-sm" onClick={() => handleDownload('excel')} disabled={downloading} style={{ minHeight: '38px' }}>
                  <Download size={14} /> Excel
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Sidebar — history */}
          <div className="card-flat" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#374151', marginBottom: '1rem' }}>📋 Analysis History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
              {analyses.map(a => (
                <button key={a.id || Math.random()} onClick={() => loadDashboard(a.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.75rem', borderRadius: '0.75rem',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: selected === a.id ? '#DBEAFE' : 'transparent',
                    color: selected === a.id ? '#1E40AF' : '#374151',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Analysis #{a.id}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>ATS: {Number(a.ats_score || 0).toFixed(0)}%</span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>·</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Match: {Number(a.match_score || 0).toFixed(0)}%</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Recent'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Dashboard View */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
              <StatCard value={`${atsScore.toFixed(0)}%`} label="ATS Score" color="#1E40AF" icon="🎯" />
              <StatCard value={`${matchScore.toFixed(0)}%`} label="Match Score" color="#3B82F6" icon="🤝" />
              <StatCard value={`${skillsMatch.toFixed(0)}%`} label="Skills Match" color="#10B981" icon="⚡" />
              <StatCard value={`${expMatch.toFixed(0)}%`} label="Experience" color="#F59E0B" icon="💼" />
            </div>

            {/* Score Rings Overview */}
            <div className="card-flat" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <ScoreRing score={atsScore} label="Overall ATS" size={110} />
              <ScoreRing score={matchScore} label="Match Score" size={110} />
              <ScoreRing score={skillsMatch} label="Skills Match" size={100} />
              <ScoreRing score={kwMatch} label="Keywords" size={100} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <MatchBadge category={matchCat} />
              </div>
            </div>

            {/* Bar Chart */}
            <div className="card-flat" style={{ padding: '1.5rem', minWidth: 0 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>📊 Score Comparison</h3>
              <div style={{ height: 260, width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barCategoryGap="25%" margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar + Progress */}
            <div className="grid-responsive-2">
              <div className="card-flat" style={{ padding: '1.5rem', minWidth: 0 }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem' }}>🎯 Radar Analysis</h3>
                <div style={{ height: 240, width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <Radar name="Score" dataKey="score" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card-flat" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>📈 Detailed Scores</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'ATS Score', value: atsScore },
                    { label: 'Match Score', value: matchScore },
                    { label: 'Skills Match', value: skillsMatch },
                    { label: 'Experience', value: expMatch },
                    { label: 'Education', value: eduMatch },
                    { label: 'Keywords', value: kwMatch },
                    { label: 'Formatting', value: fmtScore },
                  ].map(m => <ProgressBar key={m.label} label={m.label} value={m.value || 0} />)}
                </div>
              </div>
            </div>

            {/* Pie chart: matched vs missing */}
            <div className="card-flat" style={{ padding: '1.5rem', minWidth: 0 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem' }}>📋 Skills Distribution</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ height: 180, width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        dataKey="value" paddingAngle={3}
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.875rem', marginBottom: '0.625rem' }}>✅ Matched ({matchedSkillsList.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {matchedSkillsList.length > 0 ? matchedSkillsList.slice(0, 10).map(s => <SkillTag key={s} name={s} type="matched" />) : <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>None</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.875rem', marginBottom: '0.625rem' }}>❌ Missing ({missingSkillsList.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {missingSkillsList.length > 0 ? missingSkillsList.slice(0, 10).map(s => <SkillTag key={s} name={s} type="missing" />) : <span style={{ fontSize: '0.8125rem', color: '#10B981' }}>All matched!</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid-responsive-2">
              <div className="card-flat" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem', color: '#065F46' }}>💪 Strengths</h3>
                {strengthsList.length > 0 ? strengthsList.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{s}</span>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>No specific strengths highlighted yet.</div>
                )}
              </div>
              <div className="card-flat" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem', color: '#991B1B' }}>⚠️ Improvement Areas</h3>
                {weaknessesList.length > 0 ? weaknessesList.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#EF4444', flexShrink: 0 }}>✗</span>
                    <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{w}</span>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>No major weaknesses identified.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  )
}
