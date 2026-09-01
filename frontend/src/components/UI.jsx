// ── Loading Spinner ────────────────────────────────────────────
export function LoadingSpinner({ size = 40, label = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
      <div className="spinner" style={{ width: size, height: size }} />
      {label && <p style={{ color: '#6B7280', fontSize: '0.9375rem', margin: 0 }}>{label}</p>}
    </div>
  )
}

// ── Score Color Helper ─────────────────────────────────────────
export function getScoreColor(score) {
  if (score >= 70) return '#10B981'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

// ── Circular Score Display ─────────────────────────────────────
export function ScoreRing({ score, label, size = 120 }) {
  const r = (size / 2) - 10
  const circ = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, score)) / 100
  const dashOffset = circ - (pct * circ)
  const color = getScoreColor(score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={10} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: size > 100 ? '1.75rem' : '1.25rem', fontWeight: 800, color: '#1F2937', lineHeight: 1 }}>
            {score.toFixed(0)}
          </span>
          <span style={{ fontSize: '0.625rem', color: '#6B7280', fontWeight: 600 }}>/ 100</span>
        </div>
      </div>
      {label && <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', margin: 0, textAlign: 'center' }}>{label}</p>}
    </div>
  )
}

// ── Progress Bar ───────────────────────────────────────────────
export function ProgressBar({ value, label, showLabel = true, height = 8 }) {
  const color = getScoreColor(value)
  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{label}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>
            {value.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className="progress-fill"
          style={{ width: `${Math.min(100, value)}%`, background: `linear-gradient(90deg, ${color}CC, ${color})` }}
        />
      </div>
    </div>
  )
}

// ── Match Category Badge ───────────────────────────────────────
export function MatchBadge({ category = '' }) {
  const cleanCat = (category || '').replace(/\s*Match$/i, '').trim()
  const styles = {
    'Very High': { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    'High': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
    'Medium': { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
    'Low': { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  }
  const s = styles[cleanCat] || styles['Low']
  return (
    <span style={{
      padding: '0.375rem 1rem', borderRadius: '999px',
      background: s.bg, color: s.color, fontWeight: 700, fontSize: '0.875rem',
      border: `1.5px solid ${s.border}`,
    }}>
      {cleanCat} Match
    </span>
  )
}

// ── Skill Tag ──────────────────────────────────────────────────
export function SkillTag({ name, type = 'matched' }) {
  const colors = {
    matched: { bg: '#D1FAE5', color: '#065F46' },
    missing: { bg: '#FEE2E2', color: '#991B1B' },
    suggested: { bg: '#DBEAFE', color: '#1E40AF' },
    neutral: { bg: '#F3F4F6', color: '#374151' },
  }
  const c = colors[type]
  return (
    <span style={{
      padding: '0.25rem 0.75rem', borderRadius: '999px',
      background: c.bg, color: c.color,
      fontSize: '0.8125rem', fontWeight: 500, display: 'inline-block',
    }}>
      {name}
    </span>
  )
}

// ── Section Header ─────────────────────────────────────────────
export function SectionHeader({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
      {label && (
        <span className="tag tag-blue" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
          {label}
        </span>
      )}
      <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.75rem', color: '#1F2937' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: '#6B7280', maxWidth: 560, margin: '0 auto', lineHeight: 1.7, fontSize: '1.0625rem' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ── Error Alert ────────────────────────────────────────────────
export function ErrorAlert({ message, onDismiss }) {
  return (
    <div style={{
      background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '0.75rem',
      padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start',
      gap: '0.75rem', animation: 'fadeIn 0.3s ease',
    }}>
      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, color: '#991B1B', fontWeight: 500, fontSize: '0.9375rem' }}>{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '1.25rem', padding: 0 }}>×</button>
      )}
    </div>
  )
}

// ── Source Citation ────────────────────────────────────────────
export function SourceCitation({ sources = [] }) {
  if (!sources.length) return null
  return (
    <div style={{ marginTop: '1rem' }}>
      <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Sources
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {sources.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="source-card">
            🔗 {s.name}
            {s.date_retrieved && <span style={{ opacity: 0.7 }}>· {s.date_retrieved}</span>}
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────
export function EmptyState({ icon = '📄', title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1F2937' }}>{title}</h3>
      {description && <p style={{ color: '#6B7280', marginBottom: '1.5rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>{description}</p>}
      {action}
    </div>
  )
}
