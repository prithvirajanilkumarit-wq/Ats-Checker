# EXECUTION GUIDE — AI Resume & Job Match Analyzer

## Software Requirements

| Software | Version | Download |
|---|---|---|
| Python | 3.11+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| Git | Latest | https://git-scm.com/ |
| VS Code | Latest (recommended) | https://code.visualstudio.com/ |

---

## Step-by-Step Setup

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd "Ats Project"
```

Or download and extract the ZIP file, then open a terminal in the `Ats Project` folder.

---

### 2. Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\activate

# Activate (Windows CMD)
venv\Scripts\activate.bat

# Activate (Mac / Linux)
source venv/bin/activate

# Verify activation (you should see "(venv)" prefix)
python --version
```

---

### 3. Install Python Dependencies

```bash
python -m pip install -r backend/requirements.txt
```

This installs: FastAPI, SQLAlchemy, OpenAI, Sentence Transformers, spaCy, scikit-learn, PyMuPDF, pdfplumber, python-docx, FPDF2, openpyxl, and all other dependencies.

**Note:** Sentence Transformers download (~90MB) happens on first API call.

---

### 4. Download spaCy Language Model

```bash
python -m spacy download en_core_web_sm
```

---

### 5. Configure Environment Variables

```bash
# Copy example file
copy .env.example .env         # Windows
cp .env.example .env           # Mac / Linux
```

Open `.env` in any text editor and configure:

```env
# Required
OPENAI_API_KEY=sk-...          # Leave blank to use rule-based fallback
SECRET_KEY=any-random-long-string

# Optional — defaults are fine for development
DATABASE_URL=sqlite+aiosqlite:///./ats_analyzer.db
DEBUG=false
ENABLE_AI_SUGGESTIONS=true
AI_FALLBACK_MODE=true
```

> **Without an OpenAI key:** The app works fully with rule-based suggestions. Add a key for premium GPT-4 powered analysis.

---

### 6. Run the Backend Server

```bash
# Make sure virtual environment is active
python -m uvicorn backend.main:app --reload --port 8000
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Database tables ensured.
```

**API Documentation:** Open http://localhost:8000/api/docs

---

### 7. Install Frontend Dependencies

Open a **NEW terminal** (keep backend running):

```bash
cd frontend
npm install
```

---

### 8. Run the Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300 ms
  ➜  Local:   http://localhost:5173/
```

---

### 9. Open the Application

Open your browser and go to: **http://localhost:5173**

---

## Using the Application

### Analyze a Resume

1. Click **"Resume Analyzer"** in the navigation
2. Drag and drop a PDF or DOCX resume file
3. Wait for parsing (2-5 seconds)
4. Paste a job description in the text box (or enter a job URL)
5. Click **"Process Job Description"**
6. Analysis runs automatically — results appear in a few seconds
7. Download PDF or Excel report using the toolbar buttons

### Analyze a Company

1. Click **"Company Analyzer"** in the navigation
2. Enter a company name (e.g. "Google", "TCS", "Infosys")
3. Click **"Analyze Company"**
4. View ratings, pros/cons, salary info, and source citations

### View Dashboard

1. After running at least one analysis, click **"Dashboard"**
2. Select an analysis from the history sidebar
3. View all charts: radar, bar, pie, progress bars

---

## Database

The SQLite database is automatically created at `ats_analyzer.db` on first run.

**View with DB Browser for SQLite:**
- Download: https://sqlitebrowser.org/
- Open `ats_analyzer.db`

**Tables:**
- `resumes` — Uploaded resume data
- `job_descriptions` — Job description text
- `resume_analyses` — Analysis results
- `company_analyses` — Company research
- `saved_reports` — Report file paths

---

## Common Errors & Troubleshooting

| Error | Solution |
|---|---|
| `ModuleNotFoundError: fastapi` | Activate venv: `.\venv\Scripts\activate`, then `pip install -r backend/requirements.txt` |
| `Could not load spacy model` | Run `python -m spacy download en_core_web_sm` |
| `Cannot connect to backend` | Make sure backend is running on port 8000 |
| `File parsing failed` | Check file isn't password protected, max 10MB |
| `CORS error` | Ensure CORS_ORIGINS in .env includes `http://localhost:5173` |
| `OpenAI AuthenticationError` | Check OPENAI_API_KEY in .env — leave blank to use fallback |
| Port 8000 in use | Use `--port 8001` and update VITE proxy in `vite.config.js` |
| npm install fails | Ensure Node.js 18+ is installed |
| `Cannot extract text from PDF` | Try re-saving PDF from a word processor; some scanned PDFs aren't parseable |

---

## Production Deployment

### Backend (Render / Railway / VPS)

```bash
# Install gunicorn
pip install gunicorn

# Run in production
gunicorn backend.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Vercel / Netlify)

```bash
cd frontend
npm run build
# Upload the `dist/` folder to Vercel / Netlify
```

### Switch to PostgreSQL

```env
# .env
DATABASE_URL=postgresql+asyncpg://username:password@hostname:5432/ats_db
```

---

## Directory Structure After Setup

```
Ats Project/
├── ats_analyzer.db     ← auto-created SQLite database
├── venv/               ← Python virtual environment
├── uploads/            ← uploaded resume files
├── reports/            ← generated PDF/Excel reports
├── logs/               ← application log files
│   └── app.log
├── backend/
├── frontend/
└── .env               ← your configuration
```

---

*Last Updated: 2026-07-20*
