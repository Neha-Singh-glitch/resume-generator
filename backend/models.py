from pydantic import BaseModel
from typing import List, Optional


class Project(BaseModel):
    name: str
    description: str
    tech_stack: Optional[List[str]] = []


class ResumeInput(BaseModel):
    name: str
    role: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    linkedin: Optional[str] = ""
    summary: Optional[str] = ""
    skills: List[str] = []
    projects: List[Project] = []
    experience: Optional[List[str]] = []
    template: Optional[str] = "modern"
    job_description: Optional[str] = ""   # ← NEW


class ResumeOutput(BaseModel):
    status: str
    message: str
    data: dict