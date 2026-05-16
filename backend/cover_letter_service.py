# cover_letter_service.py — AI generation for cover letters using Groq

import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def build_cover_letter_prompt(data: dict) -> str:
    return f"""
You are an expert career coach and professional writer.
Write a compelling cover letter and return ONLY a valid JSON object, no markdown, no explanation.

Rules:
- Be professional, confident, and specific
- Reference the company and role directly
- Highlight 2-3 key achievements from experience
- Keep each paragraph under 4 sentences
- Do NOT invent facts not provided
- Sound human, not robotic

Input:
- Applicant Name: {data.get('name')}
- Target Role: {data.get('role')}
- Target Company: {data.get('company')}
- Key Skills: {', '.join(data.get('skills', []))}
- Experience Highlights: {'; '.join(data.get('experience', []))}
- Why this company: {data.get('why_company', 'Not provided')}
- Tone: {data.get('tone', 'professional')}

Return ONLY this JSON structure:
{{
  "opening": "Opening paragraph — hook + role mention",
  "body1": "Second paragraph — key skills and experience",
  "body2": "Third paragraph — why this company specifically",
  "closing": "Closing paragraph — call to action"
}}
"""


def generate_cover_letter(data: dict) -> dict:
    """
    Calls Groq AI and returns structured cover letter paragraphs.
    """
    prompt = build_cover_letter_prompt(data)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a professional cover letter writer. Always respond with valid JSON only. No markdown, no explanation."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.8,
        max_tokens=1000,
    )

    raw = response.choices[0].message.content.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)