# AI Resume & Job Match Analyzer

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue?logo=python" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-green?logo=fastapi" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai" />
  <img src="https://img.shields.io/badge/SQLite-production--ready-blue?logo=sqlite" />
  <img src="https://img.shields.io/badge/MCA-Final%20Year%20Project-orange" />
</div>

---

## 📖 Project Overview

**AI Resume & Job Match Analyzer** is a production-quality, full-stack web application that helps job seekers:

- Analyze uploaded resumes (PDF / DOCX)
- Calculate comprehensive ATS (Applicant Tracking System) scores
- Compute resume-to-job match scores using AI
- Get personalized AI-powered improvement suggestions
- Research companies with source-cited analysis
- Visualize everything in an interactive dashboard

This project is suitable as an **MCA Final Year Data Analytics Project**, demonstrating Python, Pandas, NumPy, SQL, Machine Learning, NLP, REST APIs, and Data Visualization.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 Resume Upload | PDF and DOCX parsing with PyMuPDF, pdfplumber, python-docx |
| 🎯 ATS Score | Multi-dimensional scoring: keywords, skills, experience, education, formatting |
| 🤝 Match Score | AI semantic similarity + rule-based weighted scoring |
| ✨ AI Suggestions | GPT-4 powered or rule-based: skills, certs, projects, rewrites |
| 🏢 Company Analysis | Ratings, pros, cons, salary, culture — with source citations |
| 📊 Dashboard | Radar, bar, pie charts + progress bars |
| 📄 Export | Download as PDF or Excel report |
| 🕒 History | Search history and previous analyses |

---

## 🛠️ Technology Stack

### Frontend
- React 18 + Vite
- Tailwind CSS (v4)
- React Router DOM
- Recharts
- Axios
- react-hot-toast
- lucide-react

### Backend
- Python 3.11+
- FastAPI + Uvicorn
- SQLAlchemy (async)
- Pydantic v2

### AI / NLP
- OpenAI GPT-4o (configurable)
- Sentence Transformers (all-MiniLM-L6-v2)
- spaCy (en_core_web_sm)
- scikit-learn (TF-IDF)

### Data
- Pandas, NumPy
- SQLite (dev) / PostgreSQL (production)
- PyMuPDF, pdfplumber, python-docx

### Reports
- FPDF2 (PDF)
- openpyxl (Excel)

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd "Ats Project"

# 2. Backend setup
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt
python -m spacy download en_core_web_sm
copy .env.example .env
# Edit .env with your API key

# 3. Run backend
python -m uvicorn backend.main:app --reload --port 8000

# 4. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📁 Folder Structure

```
Ats Project/
├── backend/           # Python FastAPI backend
├── frontend/          # React + Vite frontend
├── docs/              # Documentation files
├── uploads/           # Uploaded resume files
├── reports/           # Generated PDF/Excel
├── logs/              # Application logs
├── .env.example       # Environment template
└── README.md
```

See [INSTALLATION.md](INSTALLATION.md) for detailed setup instructions.

---

## 📸 Screenshots

> Run the application and take screenshots to add here.

| Home Page | Resume Analyzer | Dashboard |
|---|---|---|
| ![Home](screenshots/home.png) | ![Analyzer](screenshots/analyzer.png) | ![Dashboard](screenshots/dashboard.png) |

---

## 🔑 Environment Variables

```env
OPENAI_API_KEY=sk-...        # Optional — enables AI suggestions
DATABASE_URL=sqlite+aiosqlite:///./ats_analyzer.db
SECRET_KEY=your-secret-key
```

---

## 📊 Data Analytics Competencies

This project demonstrates:
- ✅ Python (FastAPI, data processing)
- ✅ Pandas & NumPy (data manipulation)
- ✅ SQL (SQLite with SQLAlchemy)
- ✅ Machine Learning (TF-IDF, cosine similarity)
- ✅ NLP (keyword extraction, entity recognition)
- ✅ REST APIs (FastAPI with Pydantic)
- ✅ Data Visualization (Recharts, Excel charts)
- ✅ OpenAI / LLM Integration

---

## 🔮 Future Scope

- User authentication & multi-user support
- Chrome extension for in-browser job analysis
- Resume builder with AI-generated content
- Integration with LinkedIn/Glassdoor APIs
- Bulk resume screening for HR teams
- Mobile app (React Native)

---

## 👥 Contributors

| Name | Role |
|---|---|
| Project Author | Full-Stack Developer + Data Analyst |

---

## 📄 License

MIT License — Free to use for educational and personal projects.

---

## 🏫 Academic Context

**Project Type:** MCA Final Year Data Analytics Project  
**Year:** 2025-2026  
**Technologies:** Python, FastAPI, React, OpenAI, SQLite, NLP, Machine Learning
