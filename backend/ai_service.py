# ai_service.py — Uses Groq (free, fast, no billing needed)
import os
import json
from groq import Groq
from dotenv import load_dotenv
from models import ResumeInput

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def build_prompt(resume: ResumeInput) -> str:
    projects_text = ""
    for p in resume.projects:
        tech = ", ".join(p.tech_stack) if p.tech_stack else "N/A"
        projects_text += f"  - {p.name} ({tech}): {p.description}\n"

    experience_text = "\n".join(f"  - {e}" for e in resume.experience) if resume.experience else "  None provided"
    skills_text = ", ".join(resume.skills) if resume.skills else "None provided"

    return f"""
You are an expert resume writer specializing in tech roles.
Return ONLY a valid JSON object, no markdown, no explanation.

Rules:
- Use strong action verbs (Built, Engineered, Reduced, Increased, Led)
- Add realistic metrics where possible
- Keep bullet points under 20 words
- Be specific and technical
- Do NOT invent technologies not mentioned

Input:
- Name: {resume.name}
- Target Role: {resume.role}
- Summary: {resume.summary or "Not provided"}
- Skills: {skills_text}
- Experience:
{experience_text}
- Projects:
{projects_text}

Return ONLY this JSON structure:
{{
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "experience": ["improved bullet 1", "improved bullet 2"],
  "projects": [
    {{
      "name": "project name",
      "bullets": ["achievement bullet 1", "achievement bullet 2"]
    }}
  ]
}}
"""


def improve_resume(resume: ResumeInput) -> dict:
    """
    Calls Groq (free) with LLaMA 3 and returns AI-improved resume content.
    """
    prompt = build_prompt(resume)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert resume writer. Always respond with valid JSON only. No markdown fences, no explanation."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)


def tailor_resume_for_job(resume: ResumeInput, job_description: str) -> dict:
    """
    Takes resume + job description and returns
    a tailored version optimized for that specific job.
    """
    projects_text = ""
    for p in resume.projects:
        tech = ", ".join(p.tech_stack) if p.tech_stack else "N/A"
        projects_text += f"  - {p.name} ({tech}): {p.description}\n"

    experience_text = "\n".join(f"  - {e}" for e in resume.experience) if resume.experience else "  None provided"
    skills_text     = ", ".join(resume.skills) if resume.skills else "None provided"

    prompt = f"""
You are an expert resume writer and career coach specializing in ATS optimization.

Your task is to tailor this resume specifically for the job description provided.
Rewrite the content to highlight the most relevant skills and experiences.
Mirror the language and keywords from the job description naturally.

Rules:
- Use exact keywords from the job description where relevant
- Reorder and emphasize skills that match the job requirements
- Rewrite experience bullets to highlight relevant achievements
- Keep all facts true — do NOT invent experience
- Use strong action verbs and metrics
- Return ONLY valid JSON, no markdown

Candidate Info:
- Name: {resume.name}
- Role applying for: {resume.role}
- Skills: {skills_text}
- Experience:
{experience_text}
- Projects:
{projects_text}

Job Description:
{job_description}

Return ONLY this JSON structure:
{{
  "summary": "2-3 sentence summary tailored to this specific job",
  "skills": ["most relevant skills first, ordered by job match"],
  "experience": ["tailored bullet 1", "tailored bullet 2"],
  "projects": [
    {{
      "name": "project name",
      "bullets": ["tailored achievement 1", "tailored achievement 2"]
    }}
  ],
  "keywords_used": ["keyword1", "keyword2"]
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert resume tailor. Always respond with valid JSON only. No markdown, no explanation."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.6,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)