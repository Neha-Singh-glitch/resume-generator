# cover_letter_latex.py — Builds .tex file for cover letter

import os
import uuid
from datetime import datetime

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "templates", "cover_letter.tex")
OUTPUT_DIR    = os.path.join(os.path.dirname(__file__), "outputs")

os.makedirs(OUTPUT_DIR, exist_ok=True)


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


def generate_cover_letter_tex(input_data: dict, ai_output: dict) -> str:
    """
    Fills the cover letter LaTeX template with AI-generated content.

    Args:
        input_data: Raw form data (name, email, company, etc.)
        ai_output:  AI-generated paragraphs (opening, body1, body2, closing)

    Returns:
        Path to the generated .tex file
    """
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    today = datetime.today().strftime("%B %d, %Y")  # e.g. "January 15, 2025"

    filled = template
    filled = filled.replace("<<NAME>>",    escape_latex(input_data.get("name", "")))
    filled = filled.replace("<<EMAIL>>",   escape_latex(input_data.get("email", "")))
    filled = filled.replace("<<PHONE>>",   escape_latex(input_data.get("phone", "")))
    filled = filled.replace("<<LINKEDIN>>",escape_latex(input_data.get("linkedin", "")))
    filled = filled.replace("<<COMPANY>>", escape_latex(input_data.get("company", "")))
    filled = filled.replace("<<DATE>>",    today)
    filled = filled.replace("<<OPENING>>", escape_latex(ai_output.get("opening", "")))
    filled = filled.replace("<<BODY1>>",   escape_latex(ai_output.get("body1", "")))
    filled = filled.replace("<<BODY2>>",   escape_latex(ai_output.get("body2", "")))
    filled = filled.replace("<<CLOSING>>", escape_latex(ai_output.get("closing", "")))

    filename = f"cover_letter_{uuid.uuid4().hex[:8]}.tex"
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(filled)

    print(f"[cover_letter_latex] Generated: {filepath}")
    return filepath