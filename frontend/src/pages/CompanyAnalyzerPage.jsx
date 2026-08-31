import { useState } from 'react'
import { Building2, Search, ExternalLink, Star, Users, MapPin, Calendar, Globe } from 'lucide-react'
import { analyzeCompany } from '../api/api'
import { ErrorAlert, SourceCitation } from '../components/UI'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

// ── Rating Bar ─────────────────────────────────────────────────
function RatingBar({ label, value, max = 10 }) {
  const pct = (value / max) * 100
  const color = pct >= 70 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{value.toFixed(1)} / 10</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ── Star Rating ────────────────────────────────────────────────
function StarRating({ value, max = 10 }) {
  const stars = Math.round((value / max) * 5)
  return (
    <div style={{ display: 'flex', gap: '0.125rem' }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={18} fill={s <= stars ? '#F59E0B' : 'none'} color={s <= stars ? '#F59E0B' : '#D1D5DB'} />
      ))}
    </div>
  )
}

// ── Info Chip ──────────────────────────────────────────────────
function InfoChip({ icon, label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFF', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}>
      <div style={{ color: '#1E40AF', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937' }}>{value}</div>
      </div>
    </div>
  )
}

export default function CompanyAnalyzerPage() {
  const [companyName, setCompanyName] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [mode, setMode] = useState('name')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [company, setCompany] = useState(null)

  const handleAnalyze = async () => {
    setError('')
    if (mode === 'name' && !companyName.trim()) return setError('Please enter a company name.')
    if (mode === 'url' && !jobUrl.trim()) return setError('Please enter a job URL.')
    setLoading(true)
    try {
      const payload = mode === 'name'
        ? { company_name: companyName }
        : { job_url: jobUrl, company_name: companyName || undefined }
      const res = await analyzeCompany(payload)
      setCompany(res.data)
      toast.success(`Company analysis complete for ${res.data.company_name}!`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const radarData = company ? [
    { metric: 'Overall', score: company.ratings.overall_rating * 10, fullMark: 100 },
    { metric: 'Work-Life', score: company.ratings.work_life_balance * 10, fullMark: 100 },
    { metric: 'Salary', score: company.ratings.salary_satisfaction * 10, fullMark: 100 },
    { metric: 'Growth', score: company.ratings.career_growth * 10, fullMark: 100 },
    { metric: 'Culture', score: company.ratings.culture_rating * 10, fullMark: 100 },
  ] : []

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="tag tag-blue" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Company Analyzer</span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#1F2937', marginBottom: '0.5rem' }}>
            Research Companies Before Applying
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.0625rem' }}>
            Get ratings, pros, cons, salary info, and culture insights — all with source citations.
          </p>
        </div>

        {/* Input Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#F3F4F6', padding: '0.25rem', borderRadius: '0.5rem', width: 'fit-content' }}>
            {[['name', '🏢 Company Name'], ['url', '🔗 Job URL']].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? '#1E40AF' : '#6B7280',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >{label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              {mode === 'name' ? (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>Company Name</label>
                  <input className="input" placeholder="e.g. Google, TCS, Infosys, Flipkart..." value={companyName} onChange={e => setCompanyName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>Job URL</label>
                    <input className="input" type="url" placeholder="https://linkedin.com/jobs/..." value={jobUrl} onChange={e => setJobUrl(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>Company Name (optional)</label>
                    <input className="input" placeholder="Override company name..." value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading} style={{ height: 42, whiteSpace: 'nowrap' }}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Search size={16} /> Analyze Company</>}
            </button>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError('')} style={{ marginTop: '1rem' }} />}
        </div>

        {/* Loading */}
        {loading && (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1.5rem', width: 52, height: 52 }} />
            <h3 style={{ fontWeight: 800 }}>Analyzing Company...</h3>
            <p style={{ color: '#6B7280' }}>Gathering information from multiple sources. This takes a few seconds.</p>
          </div>
        )}

        {/* Results */}
        {company && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
            {/* Company Header */}
            <div className="card-flat" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1F2937', marginBottom: '0.25rem' }}>{company.company_name}</h2>
                  {company.industry && <p style={{ color: '#3B82F6', fontWeight: 600, fontSize: '1rem', margin: 0 }}>{company.industry}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E40AF', lineHeight: 1 }}>{company.ratings.overall_rating.toFixed(1)}</div>
                  <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>/ 10 Overall</div>
                  <StarRating value={company.ratings.overall_rating} />
                </div>
              </div>

              {/* Info chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <InfoChip icon={<Calendar size={16} />} label="Founded" value={company.founded_year} />
                <InfoChip icon={<MapPin size={16} />} label="Headquarters" value={company.headquarters} />
                <InfoChip icon={<Users size={16} />} label="Employees" value={company.employee_count} />
                <InfoChip icon={<Building2 size={16} />} label="Company Size" value={company.company_size} />
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: '#DBEAFE', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                    textDecoration: 'none', color: '#1E40AF', fontWeight: 600, fontSize: '0.875rem',
                  }}>
                    <Globe size={16} /> Official Website <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {company.description && (
                <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '0.9375rem', background: '#F8FAFF', padding: '1rem', borderRadius: '0.75rem', margin: 0 }}>
                  {company.description}
                </p>
              )}
            </div>

            {/* Ratings + Radar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card-flat" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1.25rem', color: '#1F2937' }}>📊 Ratings Breakdown</h3>
                <RatingBar label="Overall Rating" value={company.ratings.overall_rating} />
                <RatingBar label="Work-Life Balance" value={company.ratings.work_life_balance} />
                <RatingBar label="Salary Satisfaction" value={company.ratings.salary_satisfaction} />
                <RatingBar label="Career Growth" value={company.ratings.career_growth} />
                <RatingBar label="Company Culture" value={company.ratings.culture_rating} />
                <div style={{ marginTop: '1rem', padding: '0.875rem', background: '#FEF3C7', borderRadius: '0.625rem', border: '1px solid #FDE68A' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#92400E' }}>⚡ Interview Difficulty</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#D97706' }}>
                    {company.ratings.interview_difficulty.toFixed(1)} / 10
                  </div>
                </div>
              </div>

              <div className="card-flat" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem', color: '#1F2937' }}>🎯 Radar Overview</h3>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <Radar name="Rating" dataKey="score" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Pros & Cons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card-flat" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem', color: '#065F46' }}>👍 Pros</h3>
                {company.pros.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981', flexShrink: 0, marginTop: '2px', fontSize: '1rem' }}>✓</span>
                    <span style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
              <div className="card-flat" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem', color: '#991B1B' }}>👎 Cons</h3>
                {company.cons.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px', fontSize: '1rem' }}>✗</span>
                    <span style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary + Recommendation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {(company.salary_range || company.average_salary) && (
                <div className="card-flat" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '1rem', color: '#065F46' }}>💰 Salary Information</h3>
                  {company.salary_range && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salary Range</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46' }}>{company.salary_range}</div>
                    </div>
                  )}
                  {company.average_salary && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Salary</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#047857' }}>{company.average_salary}</div>
                    </div>
                  )}
                </div>
              )}

              {company.overall_recommendation && (
                <div className="card-flat" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '0.875rem', color: '#1E40AF' }}>🎯 Overall Recommendation</h3>
                  <p style={{ color: '#1E3A8A', lineHeight: 1.7, fontSize: '0.9375rem', margin: 0 }}>
                    {company.overall_recommendation}
                  </p>
                </div>
              )}
            </div>

            {/* Sources */}
            {company.sources?.length > 0 && (
              <div className="card-flat" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '0.75rem', color: '#1F2937' }}>📚 Sources</h3>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
                  All information is sourced from publicly available platforms. Click to visit and verify.
                </p>
                <SourceCitation sources={company.sources} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
