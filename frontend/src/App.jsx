import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage'
import CompanyAnalyzerPage from './pages/CompanyAnalyzerPage'
import DashboardPage from './pages/DashboardPage'
import AboutPage from './pages/AboutPage'
import DocumentationPage from './pages/DocumentationPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
          <Route path="/company-analyzer" element={<CompanyAnalyzerPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          {/* 404 fallback */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔍</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1F2937', marginBottom: '0.5rem' }}>404 — Page Not Found</h1>
              <p style={{ color: '#6B7280', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9375rem',
            fontWeight: 500,
            borderRadius: '0.75rem',
            padding: '0.875rem 1rem',
          },
          success: { style: { background: '#F0FDF4', color: '#065F46', border: '1.5px solid #BBF7D0' } },
          error: { style: { background: '#FEF2F2', color: '#991B1B', border: '1.5px solid #FECACA' } },
        }}
      />
    </BrowserRouter>
  )
}
