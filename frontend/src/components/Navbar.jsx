import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/resume-analyzer', label: 'Resume Analyzer' },
  { to: '/company-analyzer', label: 'Company Analyzer' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
  { to: '/docs', label: 'Documentation 🔒' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <nav className="navbar" style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt="ATS Checker"
            style={{ height: '38px', maxWidth: '160px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }} className="desktop-nav">
          <Link to="/resume-analyzer" className="btn btn-primary btn-sm">
            Analyze Resume
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.625rem',
            display: 'none',
            borderRadius: '0.375rem',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '44px',
            minWidth: '44px',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={24} color="#1F2937" /> : <Menu size={24} color="#1F2937" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E5E7EB',
          borderBottom: '1px solid #E5E7EB',
          padding: '0.875rem 1rem 1.25rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.2s ease',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  minHeight: '44px',
                }}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/resume-analyzer"
              className="btn btn-primary"
              style={{ marginTop: '0.75rem', width: '100%', minHeight: '44px', justifyContent: 'center' }}
              onClick={() => setOpen(false)}
            >
              Analyze Resume
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

