import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listAnalyses, getDashboardData, downloadReport } from '../api/api'
import { ScoreRing, ProgressBar, MatchBadge, SkillTag, LoadingSpinner, EmptyState } from '../components/UI'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { Download, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']

// ── Custom Tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', padding: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#1F2937' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || '#1E40AF', fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>
            {p.name}: {p.value?.toFixed(1)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ value, label, color = '#1E40AF', icon }) {
  return (
    <div className="card-flat" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: '12px', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.625rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 500, marginTop: '0.25rem' }}>{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState([])
  const [selected, setSelected] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    setLoading(true)
    try {
      const res = await listAnalyses()
      setAnalyses(res.data)
      if (res.data.length > 0) {
        await loadDashboard(res.data[0].id)
        setSelected(res.data[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboard = async (id) => {
    try {
      const res = await getDashboardData(id)
      setDashboard(res.data)
      setSelected(id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDownload = async (type) => {
    setDownloading(true)
    try {
      await downloadReport(selected, type)
      toast.success(`${type.toUpperCase()} downloaded!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="section"><div className="container"><LoadingSpinner label="Loading dashboard..." /></div></div>

  if (analyses.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <EmptyState
            icon="📊"
            title="No Analyses Yet"
            description="Run your first resume analysis to see the dashboard."
            action={<Link to="/resume-analyzer" className="btn btn-primary">Analyze Resume</Link>}
          />
        </div>
      </div>
    )
  }

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
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/resume-analyzer" className="btn btn-outline btn-sm">
              <RefreshCw size={14} /> New Analysis
            </Link>
            {selected && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => handleDownload('pdf')} disabled={downloading}>
                  <Download size={14} /> PDF
                </button>
                <button className="btn btn-accent btn-sm" onClick={() => handleDownload('excel')} disabled={downloading}>
                  <Download size={14} /> Excel
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Sidebar — history */}
          <div className="card-flat" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#374151', marginBottom: '1rem' }}>📋 Analysis History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analyses.map(a => (
                <button key={a.id} onClick={() => loadDashboard(a.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.875rem', borderRadius: '0.75rem',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: selected === a.id ? '#DBEAFE' : 'transparent',
                    color: selected === a.id ? '#1E40AF' : '#374151',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Analysis #{a.id}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>ATS: {a.ats_score?.toFixed(0)}%</span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>·</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Match: {a.match_score?.toFixed(0)}%</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Dashboard */}
          {dashboard && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <StatCard value={`${dashboard.ats_score?.toFixed(0)}%`} label="ATS Score" color="#1E40AF" icon="🎯" />
                <StatCard value={`${dashboard.match_score?.toFixed(0)}%`} label="Match Score" color="#3B82F6" icon="🤝" />
                <StatCard value={`${dashboard.skills_match?.toFixed(0)}%`} label="Skills Match" color="#10B981" icon="⚡" />
                <StatCard value={`${dashboard.experience_match?.toFixed(0)}%`} label="Experience" color="#F59E0B" icon="💼" />
              </div>

              {/* Score Rings */}
              <div className="card-flat" style={{ padding: '1.75rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                <ScoreRing score={dashboard.ats_score} label="Overall ATS" size={130} />
                <ScoreRing score={dashboard.match_score} label="Match Score" size={130} />
                <ScoreRing score={dashboard.skills_match} label="Skills Match" size={110} />
                <ScoreRing score={dashboard.keyword_match} label="Keywords" size={110} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <MatchBadge category={dashboard.match_category} />
                </div>
              </div>

              {/* Bar Chart */}
              <div className="card-flat" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>📊 Score Comparison</h3>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboard.bar_data} barCategoryGap="30%" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {(dashboard.bar_data || []).map((entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar + Progress */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="card-flat" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem' }}>🎯 Radar Analysis</h3>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer>
                      <RadarChart data={dashboard.radar_data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6B7280' }} />
                        <Radar name="Score" dataKey="score" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card-flat" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>📈 Detailed Scores</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {[
                      { label: 'ATS Score', value: dashboard.ats_score },
                      { label: 'Match Score', value: dashboard.match_score },
                      { label: 'Skills Match', value: dashboard.skills_match },
                      { label: 'Experience', value: dashboard.experience_match },
                      { label: 'Education', value: dashboard.education_match },
                      { label: 'Keywords', value: dashboard.keyword_match },
                      { label: 'Formatting', value: dashboard.formatting_score },
                    ].map(m => <ProgressBar key={m.label} label={m.label} value={m.value || 0} />)}
                  </div>
                </div>
              </div>

              {/* Pie chart: matched vs missing */}
              <div className="card-flat" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem' }}>📋 Skills Distribution</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Matched', value: dashboard.matched_skills?.length || 0 },
                            { name: 'Missing', value: dashboard.missing_skills?.length || 0 },
                          ]}
                          cx="50%" cy="50%" innerRadius={50} outerRadius={80}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.875rem', marginBottom: '0.625rem' }}>✅ Matched ({dashboard.matched_skills?.length})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {(dashboard.matched_skills || []).slice(0, 10).map(s => <SkillTag key={s} name={s} type="matched" />)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.875rem', marginBottom: '0.625rem' }}>❌ Missing ({dashboard.missing_skills?.length})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {(dashboard.missing_skills || []).slice(0, 10).map(s => <SkillTag key={s} name={s} type="missing" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="card-flat" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem', color: '#065F46' }}>💪 Strengths</h3>
                  {(dashboard.strengths || []).map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="card-flat" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem', color: '#991B1B' }}>⚠️ Improvement Areas</h3>
                  {(dashboard.weaknesses || []).map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#EF4444', flexShrink: 0 }}>✗</span>
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
