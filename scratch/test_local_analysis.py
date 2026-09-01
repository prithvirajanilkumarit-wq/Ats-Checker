import sys, os
sys.path.insert(0, os.path.abspath("."))
import asyncio
from datetime import datetime
from backend.database import engine, AsyncSessionLocal, create_tables
from backend.models.models import Resume, JobDescription, ResumeAnalysis
from backend.routers.analysis import run_analysis
from backend.schemas.schemas import AnalysisRequest

async def test():
    await create_tables()
    async with AsyncSessionLocal() as db:
        # Create dummy resume
        r = Resume(filename="test.pdf", file_path="test.pdf", file_type="pdf", raw_text="Python developer with SQL, Docker, React, FastAPI")
        jd = JobDescription(raw_text="Senior Python Developer with FastAPI and ML")
        db.add(r)
        db.add(jd)
        await db.commit()
        await db.refresh(r)
        await db.refresh(jd)

        print(f"Created Resume id={r.id}, JD id={jd.id}")
        
        req = AnalysisRequest(
            resume_id=r.id,
            job_description_id=jd.id,
            resume_text=r.raw_text,
            jd_text=jd.raw_text,
        )
        try:
            res = await run_analysis(req)
            print("Run analysis result:", res)
        except Exception as e:
            import traceback
            traceback.print_exc()

asyncio.run(test())
