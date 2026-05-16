# ats_service.py — AI-powered ATS score analyzer using Groq

import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def analyze_ats(resume_text: str, job_description: str) -> dict:
    """
    Sends resume + job description to Groq AI.
    Returns structured ATS score and feedback.
    """

    prompt = f"""
You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Analyze how well the resume matches the job description and return ONLY a valid JSON object.

Rules:
- Be specific and actionable in feedback
- Score each category out of 100
- List exact missing keywords from the job description
- Suggest concrete improvements
- Overall score = weighted average of all categories

Resume:
{resume_text}

Job Description:
{job_description}

Return ONLY this JSON structure:
{{
  "overall_score": 78,
  "categories": {{
    "keyword_match":    {{ "score": 80, "label": "Keyword Match"    }},
    "skills_match":     {{ "score": 75, "label": "Skills Match"     }},
    "experience_match": {{ "score": 70, "label": "Experience Match" }},
    "formatting":       {{ "score": 90, "label": "Formatting"       }}
  }},
  "matched_keywords":  ["Python", "REST API"],
  "missing_keywords":  ["Docker", "Kubernetes"],
  "strengths":  ["Strong Python experience", "Relevant project experience"],
  "improvements": ["Add Docker experience", "Mention team size in experience"],
  "summary": "2-3 sentence overall assessment"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an ATS resume analyzer. Always respond with valid JSON only. No markdown, no explanation."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,    # Low temperature for consistent scoring
        max_tokens=1000,
    )

    raw = response.choices[0].message.content.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)