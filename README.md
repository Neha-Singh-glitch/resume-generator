# ⚡ AI Resume Generator

A full-stack web app that uses AI to generate, improve, and tailor professional resumes and cover letters — exported as downloadable PDFs.

## ✨ Features

- 📄 **Resume Generator** — AI improves your raw input into achievement-based bullet points
- ✉️ **Cover Letter Generator** — AI writes a professional cover letter with tone selection
- 🎯 **ATS Score Analyzer** — AI rates how well your resume matches a job description
- 💼 **Job Matcher** — AI tailors your resume specifically for a job posting
- 🎨 **3 LaTeX Templates** — Modern, Minimal, Academic
- 👁️ **Live PDF Preview** — See your resume before downloading
- 🌙 **Dark Mode** — Toggle between light and dark UI
- ⬇️ **PDF Download** — One-click download of generated resume

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React + Vite                      |
| Backend   | Python + FastAPI                  |
| AI        | Groq API (LLaMA 3.3 70B)          |
| PDF       | LaTeX (pdflatex via MiKTeX)       |
| Styling   | Custom CSS with CSS Variables     |

---

## 📁 Project Structure

```
resume-generator/
├── backend/
│   ├── main.py                  # FastAPI app + all endpoints
│   ├── ai_service.py            # Groq AI resume improvement + tailoring
│   ├── ats_service.py           # ATS score analyzer
│   ├── cover_letter_service.py  # Cover letter AI generation
│   ├── cover_letter_latex.py    # Cover letter LaTeX builder
│   ├── latex_service.py         # Resume LaTeX builder
│   ├── models.py                # Pydantic request models
│   ├── templates/
│   │   ├── modern.tex           # Modern LaTeX template
│   │   ├── minimal.tex          # Minimal LaTeX template
│   │   ├── academic.tex         # Academic LaTeX template
│   │   └── cover_letter.tex     # Cover letter template
│   ├── outputs/                 # Generated .tex and .pdf files
│   ├── .env.example             # Environment variable template
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        ├── App.css
        └── components/
            ├── ResumeForm.jsx
            ├── CoverLetterForm.jsx
            ├── TemplateSelector.jsx
            ├── PDFPreview.jsx
            ├── ATSScorer.jsx
            └── JobMatcher.jsx
```
---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [MiKTeX](https://miktex.org/download) (for PDF compilation)
- [Groq API Key](https://console.groq.com/keys) (free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Neha-Singh-glitch/resume-generator.git
cd resume-generator
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your Groq API key to .env
```

---

### 3. Add Your API Key

Edit `backend/.env`:

GROQ_API_KEY=your-groq-api-key-here

Get a free key at → https://console.groq.com/keys

---

### 4. Frontend Setup

```bash
cd frontend
npm install
```

---

### 5. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open → **http://localhost:5173**

---

## 🔑 Environment Variables

| Variable       | Description              | Required |
|----------------|--------------------------|----------|
| `GROQ_API_KEY` | Groq API key (free tier) | ✅ Yes   |

---

## 📸 Screenshots

> Add screenshots here after deployment

### 📄 Resume Generator
<img width="282" height="812" alt="image" src="https://github.com/user-attachments/assets/a70ee8fd-5891-45ca-aa67-7e40309a4a0f" />

### ✉️ Cover Letter Generator
<img width="419" height="858" alt="image" src="https://github.com/user-attachments/assets/26121c39-8cd6-4aaa-a46f-84b41015ac98" />

### 🎯 ATS Score Analyzer
<img width="452" height="592" alt="image" src="https://github.com/user-attachments/assets/a70335b3-2931-49f8-8b85-67dd6b769560" />

### 💼 Job Matcher
<img width="363" height="886" alt="image" src="https://github.com/user-attachments/assets/17dd04e5-92e7-4723-90fa-df175f0157cb" />

### 🌙 Dark Mode

### 📄 Resume Generator
<img width="331" height="826" alt="image" src="https://github.com/user-attachments/assets/32a90da9-d524-4a70-b2d7-ebb35ae02799" />

### ✉️ Cover Letter Generator
<img width="293" height="652" alt="image" src="https://github.com/user-attachments/assets/1a9e1a94-1b33-4f20-8ef3-206c21cd0d1f" />

### 🎯 ATS Score Analyzer
<img width="334" height="420" alt="image" src="https://github.com/user-attachments/assets/a7a10f29-8820-4970-8da0-6276a1df1546" />

### 💼 Job Matcher
<img width="286" height="868" alt="image" src="https://github.com/user-attachments/assets/6422bab4-cb79-4ee7-b906-858db7c44fd8" />







---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is **not open source**.  
All rights reserved © 2025 Neha Singh.  
Do not copy, distribute, or use this code without explicit permission from the author.

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — Free LLaMA 3.3 API
- [MiKTeX](https://miktex.org) — LaTeX compiler for Windows
- [FastAPI](https://fastapi.tiangolo.com) — Python web framework
- [Vite](https://vitejs.dev) — React build tool

- ## 👥 Credits

This project was built with guidance and support from:

| Name | Role | GitHub |
|------|------|--------|
| Neha Singh | Developer    | [@Neha-Singh-glitch](https://github.com/Neha-Singh-glitch) |
| Person 2   | Collaborator | [@Amolnagaonkar](https://github.com/Amolnagaonkar)         |
| Person 3   | Collabrator  | [@ramizdevelops](https://github.com/ramizdevelops)         |

---

## 📬 Contact

**Neha Singh**
-  GitHub: [@Neha-Singh-glitch](https://github.com/Neha-Singh-glitch)













