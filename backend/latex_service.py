# latex_service.py — Now supports multiple templates

import os
import json
import uuid

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
OUTPUT_DIR    = os.path.join(os.path.dirname(__file__), "outputs")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Valid template names → filenames
AVAILABLE_TEMPLATES = {
    "modern":   "modern.tex",
    "minimal":  "minimal.tex",
    "academic": "academic.tex",
}


def escape_latex(text: str) -> str:
    replacements = {
        "&":  r"\&",
        "%":  r"\%",
        "$":  r"\$",
        "#":  r"\#",
        "_":  r"\_",
        "{":  r"\{",
        "}":  r"\}",
        "~":  r"\textasciitilde{}",
        "^":  r"\textasciicircum{}",
        "\\": r"\textbackslash{}",
    }
    for char, escaped in replacements.items():
        text = text.replace(char, escaped)
    return text


def build_experience_items(experience: list) -> str:
    if not experience:
        return r"\item No experience provided."
    return "\n".join(f"    \\item {escape_latex(e)}" for e in experience)


def build_projects_block(projects: list) -> str:
    if not projects:
        return "No projects provided."
    blocks = []
    for project in projects:
        name    = escape_latex(project.get("name", "Untitled"))
        bullets = project.get("bullets", [])
        items   = "\n".join(f"        \\item {escape_latex(b)}" for b in bullets)
        block   = (
            f"\\textbf{{{name}}}\n"
            f"\\begin{{itemize}}[leftmargin=*, itemsep=2pt]\n"
            f"{items}\n"
            f"\\end{{itemize}}"
        )
        blocks.append(block)
    return "\n\n".join(blocks)


def generate_tex(resume_input, ai_output: dict, template: str = "modern") -> str:
    """
    Generates a .tex file using the selected template.
    template: one of 'modern', 'minimal', 'academic'
    """
    # Fallback to modern if invalid template name passed
    template_file = AVAILABLE_TEMPLATES.get(template, "modern.tex")
    template_path = os.path.join(TEMPLATES_DIR, template_file)

    with open(template_path, "r", encoding="utf-8") as f:
        tmpl = f.read()

    skills_line      = ", ".join(escape_latex(s) for s in ai_output.get("skills", []))
    experience_items = build_experience_items(ai_output.get("experience", []))
    projects_block   = build_projects_block(ai_output.get("projects", []))
    summary          = escape_latex(ai_output.get("summary", ""))

    filled = tmpl
    filled = filled.replace("<<NAME>>",             escape_latex(resume_input.name))
    filled = filled.replace("<<ROLE>>",             escape_latex(resume_input.role))
    filled = filled.replace("<<EMAIL>>",            escape_latex(resume_input.email or ""))
    filled = filled.replace("<<PHONE>>",            escape_latex(resume_input.phone or ""))
    filled = filled.replace("<<LINKEDIN>>",         escape_latex(resume_input.linkedin or ""))
    filled = filled.replace("<<SUMMARY>>",          summary)
    filled = filled.replace("<<SKILLS>>",           skills_line)
    filled = filled.replace("<<EXPERIENCE_ITEMS>>", experience_items)
    filled = filled.replace("<<PROJECTS>>",         projects_block)

    filename = f"resume_{template}_{uuid.uuid4().hex[:8]}.tex"
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(filled)

    print(f"[latex_service] Generated: {filepath}")
    return filepath