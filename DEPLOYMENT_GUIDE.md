# 🚀 Deployment Guide — ATS Resume Checker

This guide outlines how to push your code to your GitHub account (**`prithvirajanilkumarit-wq`**) and deploy both the **FastAPI Backend** and **React Frontend** for free.

---

## Part 1: Push Code to Your GitHub Account

Run these commands in your project root directory (`Ats Project`):

```bash
# 1. Rename branch to main
git branch -M main

# 2. Add your GitHub remote repository (Create 'Ats-Project' on GitHub first)
git remote add origin https://github.com/prithvirajanilkumarit-wq/Ats-Project.git

# 3. Push your committed code to GitHub
git push -u origin main
```

---

## Part 2: Deploy Backend to Render.com (Free)

1. Go to **[https://dashboard.render.com](https://dashboard.render.com)** and sign in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository: `prithvirajanilkumarit-wq/Ats-Project`.
4. Configure the Web Service settings:
   - **Name**: `ats-project-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Paste your Gemini API key)*
   - `GEMINI_MODEL`: `gemini-3.6-flash`
   - `ENABLE_AI_SUGGESTIONS`: `true`
   - `AI_FALLBACK_MODE`: `true`
6. Click **Create Web Service**. Render will deploy your FastAPI backend and give you a URL (e.g. `https://ats-project-backend.onrender.com`).

---

## Part 3: Deploy Frontend to Vercel (Free)

1. Go to **[https://vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
2. Select repository: `prithvirajanilkumarit-wq/Ats-Project`.
3. Set **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://ats-project-backend.onrender.com/api`
5. Click **Deploy**. Vercel will build and launch your website with free SSL!
