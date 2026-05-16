# main.py — Full backend with all endpoints

import os
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from models import ResumeInput, ResumeOutput
from ai_service import improve_resume
from latex_service import generate_tex
from cover_letter_service import generate_cover_letter
from cover_letter_latex import generate_cover_letter_tex
from ats_service import analyze_ats
from ai_service import improve_resume, tailor_resume_for_job  # ← update this line

app = FastAPI(title="AI Resume Generator", version="0.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "Resume Generator API is running."}


# ── Helper: compile .tex → .pdf ───────────────────────────────────────────────
def compile_tex(tex_path: str):
    """Shared pdflatex compilation logic used by all endpoints."""
    output_dir = os.path.dirname(tex_path)
    result = subprocess.run(
        [
            "pdflatex",
            "-interaction=nonstopmode",
            "-output-directory", output_dir,
            tex_path
        ],
        capture_output=True,
        text=True,
        timeout=120
    )
    print("[pdflatex STDOUT]", result.stdout[-500:] if result.stdout else "")
    print("[pdflatex STDERR]", result.stderr[-500:] if result.stderr else "")

    if result.returncode != 0:
        raise Exception(f"pdflatex failed:\n{result.stdout[-1000:]}")


# ── Resume: generate (download) ───────────────────────────────────────────────
@app.post("/generate-resume")
def generate_resume(resume: ResumeInput):
    try:
        improved = improve_resume(resume)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

    try:
        tex_path = generate_tex(resume, improved, template=resume.template)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LaTeX generation failed: {str(e)}")

    try:
        compile_tex(tex_path)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="pdflatex not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF compilation failed: {str(e)}")

    pdf_path = tex_path.replace(".tex", ".pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="PDF file was not created.")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{resume.name.replace(' ', '_')}_resume.pdf"
    )


# ── Resume: preview (inline) ──────────────────────────────────────────────────
@app.post("/preview-resume")
def preview_resume(resume: ResumeInput):
    try:
        improved = improve_resume(resume)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

    try:
        tex_path = generate_tex(resume, improved, template=resume.template)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LaTeX generation failed: {str(e)}")

    try:
        compile_tex(tex_path)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="pdflatex not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF compilation failed: {str(e)}")

    pdf_path = tex_path.replace(".tex", ".pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="PDF was not created.")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{resume.name.replace(' ', '_')}_resume.pdf",
        headers={"Content-Disposition": "inline"}
    )


# ── Cover letter: preview (inline) ────────────────────────────────────────────
@app.post("/preview-cover-letter")
def preview_cover_letter(data: dict):
    try:
        ai_output = generate_cover_letter(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

    try:
        tex_path = generate_cover_letter_tex(data, ai_output)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LaTeX generation failed: {str(e)}")

    try:
        compile_tex(tex_path)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="pdflatex not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF compilation failed: {str(e)}")

    pdf_path = tex_path.replace(".tex", ".pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="PDF was not created.")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{data.get('name', 'cover')}_cover_letter.pdf",
        headers={"Content-Disposition": "inline"}
    )


# ── ATS Score ─────────────────────────────────────────────────────────────────
class ATSRequest(BaseModel):
    resume_text:     str
    job_description: str


@app.post("/ats-score")
def ats_score(data: ATSRequest):
    try:
        result = analyze_ats(data.resume_text, data.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS analysis failed: {str(e)}")

    return {"status": "success", "data": result}
# ── Job-tailored resume preview ───────────────────────────────────────────────
@app.post("/tailor-resume")
def tailor_resume(resume: ResumeInput):
    """
    Tailors resume content specifically for a job description.
    Uses AI to mirror job keywords and highlight relevant experience.
    """
    if not resume.job_description:
        raise HTTPException(status_code=400, detail="Job description is required.")

    # Step 1: Tailor with AI
    try:
        tailored = tailor_resume_for_job(resume, resume.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

    # Step 2: Generate .tex
    try:
        tex_path = generate_tex(resume, tailored, template=resume.template)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LaTeX generation failed: {str(e)}")

    # Step 3: Compile PDF
    try:
        compile_tex(tex_path)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="pdflatex not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF compilation failed: {str(e)}")

    pdf_path = tex_path.replace(".tex", ".pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="PDF was not created.")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{resume.name.replace(' ', '_')}_tailored_resume.pdf",
        headers={"Content-Disposition": "inline"}
    )