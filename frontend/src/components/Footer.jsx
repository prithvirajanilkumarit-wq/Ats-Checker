import { Link } from 'react-router-dom'
import { GitBranch, ExternalLink, Mail, Heart } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  const links = {
    Product: [
      { label: 'Resume Analyzer', to: '/resume-analyzer' },
      { label: 'Company Analyzer', to: '/company-analyzer' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
    Resources: [
      { label: 'Documentation', to: '/docs' },
      { label: 'About Project', to: '/about' },
    ],
  }

  return (
    <footer style={{ background: '#1E293B', color: '#CBD5E1', marginTop: 'auto', width: '100%' }}>
      <div className="container" style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <img
                src="/logo.png"
                alt="ATS Checker"
                style={{ height: '44px', maxWidth: '160px', width: 'auto', background: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, maxWidth: 260, color: '#94A3B8' }}>
              AI-powered resume analysis platform. Optimize your resume, understand your match score, and research companies.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              {[
                { icon: <GitBranch size={18} />, href: '#' },
                { icon: <ExternalLink size={18} />, href: '#' },
                { icon: <Mail size={18} />, href: 'mailto:contact@atsanalyzer.ai' },
              ].map((s, i) => (
                <a key={i} href={s.href} style={{
                  width: 36, height: 36, borderRadius: '8px', background: '#334155',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94A3B8', transition: 'all 0.2s', textDecoration: 'none',
                }}
                  onMouseOver={e => { e.currentTarget.style.background = '#1E40AF'; e.currentTarget.style.color = 'white' }}
                  onMouseOut={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#94A3B8' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9375rem' }}>{group}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.to} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.color = '#60A5FA'}
                      onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Tech Stack */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9375rem' }}>Tech Stack</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {['React', 'FastAPI', 'Python', 'OpenAI', 'spaCy', 'SQLite', 'Recharts', 'Tailwind'].map(t => (
                <span key={t} style={{
                  padding: '0.2rem 0.625rem', borderRadius: '999px',
                  background: '#334155', color: '#93C5FD', fontSize: '0.75rem', fontWeight: 500
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
            © {year} AI Resume & Job Match Analyzer. MCA Final Year Project.
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            Built with <Heart size={13} color="#EF4444" fill="#EF4444" /> using Python, React & AI
          </p>
        </div>
      </div>
    </footer>
  )
}

