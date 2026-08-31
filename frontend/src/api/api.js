import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ats-checker-backend-0oxf.onrender.com/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor
API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.detail || error.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  },
)

// ── Resume APIs ────────────────────────────────────────────────
export const uploadResume = (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  return API.post('/resume/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
}

export const getResume = (id) => API.get(`/resume/${id}`)
export const listResumes = () => API.get('/resume/')

// ── Job Description APIs ───────────────────────────────────────
export const createJobDescription = (data) => API.post('/resume/job-description', data)
export const getJobDescription = (id) => API.get(`/resume/job-description/${id}`)

// ── Analysis APIs ──────────────────────────────────────────────
export const runAnalysis = (resumeId, jdId) =>
  API.post('/analysis/run', { resume_id: resumeId, job_description_id: jdId })

export const getAnalysis = (id) => API.get(`/analysis/${id}`)
export const getDashboardData = (analysisId) => API.get(`/analysis/${analysisId}/dashboard`)
export const listAnalyses = () => API.get('/analysis/')

// ── Company APIs ───────────────────────────────────────────────
export const analyzeCompany = (data) => API.post('/company/analyze', data)
export const getCompanyAnalysis = (id) => API.get(`/company/${id}`)
export const listCompanyAnalyses = () => API.get('/company/')

// ── Report APIs ────────────────────────────────────────────────
export const generateReport = (analysisId, type) =>
  API.post(`/reports/generate?analysis_id=${analysisId}&report_type=${type}`, {}, {
    responseType: 'blob',
  })

export const downloadReport = async (analysisId, type) => {
  const response = await generateReport(analysisId, type)
  const ext = type === 'pdf' ? 'pdf' : 'xlsx'
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = `resume_analysis_${analysisId}.${ext}`
  link.click()
  window.URL.revokeObjectURL(url)
}

// ── Health ─────────────────────────────────────────────────────
export const healthCheck = () => API.get('/health')

export default API
