import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
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

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="ATS Checker"
            style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'none' }}
          className="mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} color="#1F2937" /> : <Menu size={22} color="#1F2937" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'white', borderTop: '1px solid #E5E7EB',
          padding: '1rem 1.5rem 1.5rem',
        }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'block', padding: '0.625rem 0.75rem', marginBottom: '0.25rem' }}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/resume-analyzer"
            className="btn btn-primary"
            style={{ marginTop: '0.75rem', width: '100%' }}
            onClick={() => setOpen(false)}
          >
            Analyze Resume
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
