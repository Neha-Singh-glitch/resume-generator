// App.jsx — Resume + Cover Letter + ATS Score + Job Matcher
import { useState, useEffect } from "react";
import ResumeForm from "./components/ResumeForm";
import CoverLetterForm from "./components/CoverLetterForm";
import PDFPreview from "./components/PDFPreview";
import ATSScorer from "./components/ATSScorer";
import JobMatcher from "./components/JobMatcher";
import "./App.css";

const STEPS = [
  { id: 1, label: "Sending data"         },
  { id: 2, label: "AI improving content" },
  { id: 3, label: "Generating LaTeX"     },
  { id: 4, label: "Compiling PDF"        },
];

export default function App() {
  const [tab, setTab]           = useState("resume");
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(0);
  const [error, setError]       = useState("");
  const [pdfUrl, setPdfUrl]     = useState(null);
  const [formData, setFormData] = useState(null);

  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const handleTemplateChange = () => { setPdfUrl(null); setError(""); };
  const switchTab = (t) => { setTab(t); setPdfUrl(null); setError(""); };

  const handleSubmit = async (data, endpoint) => {
    setLoading(true);
    setError("");
    setPdfUrl(null);
    setFormData(data);
    setStep(1);

    try {
      setStep(2);
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setStep(3);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Something went wrong.");
      }

      setStep(4);
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      setPdfUrl(url);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStep(0);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl || !formData) return;
    const a    = document.createElement("a");
    a.href     = pdfUrl;
    a.download = tab === "resume"
      ? `${formData.name.replace(/\s+/g, "_")}_resume.pdf`
      : `${formData.name.replace(/\s+/g, "_")}_cover_letter.pdf`;
    a.click();
  };

  return (
    <div className="app">

      {/* ── Header ── */}
      <header>
        <div className="header-content">
          <div>
            <h1>⚡ AI Resume Generator</h1>
            <p>Fill in your details — AI will polish it and generate a PDF.</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setDark((d) => !d)}
            title="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="tabs">
        <button className={`tab-btn ${tab === "resume"  ? "active" : ""}`} onClick={() => switchTab("resume")}>
          📄 Resume
        </button>
        <button className={`tab-btn ${tab === "cover"   ? "active" : ""}`} onClick={() => switchTab("cover")}>
          ✉️ Cover Letter
        </button>
        <button className={`tab-btn ${tab === "ats"     ? "active" : ""}`} onClick={() => switchTab("ats")}>
          🎯 ATS Score
        </button>
        <button className={`tab-btn ${tab === "matcher" ? "active" : ""}`} onClick={() => switchTab("matcher")}>
          💼 Job Matcher
        </button>
      </div>

      {/* ── Pipeline (only for resume/cover) ── */}
      {loading && tab !== "ats" && tab !== "matcher" && (
        <div className="pipeline">
          {STEPS.map((s) => (
            <div key={s.id} className={`pipeline-step ${step >= s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}>
              <div className="step-dot">{step > s.id ? "✓" : s.id}</div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── ATS Tab ── */}
      {tab === "ats" && <ATSScorer />}

      {/* ── Job Matcher Tab ── */}
      {tab === "matcher" && <JobMatcher />}

      {/* ── Resume & Cover Letter tabs ── */}
      {tab !== "ats" && tab !== "matcher" && (
        <div className={`layout ${pdfUrl ? "with-preview" : ""}`}>
          <div className="form-col">
            {tab === "resume" && (
              <ResumeForm
                onSubmit={(data) => handleSubmit(data, "preview-resume")}
                loading={loading}
                onTemplateChange={handleTemplateChange}
              />
            )}
            {tab === "cover" && (
              <CoverLetterForm
                onSubmit={(data) => handleSubmit(data, "preview-cover-letter")}
                loading={loading}
              />
            )}
          </div>

          {pdfUrl && (
            <div className="preview-col">
              <PDFPreview url={pdfUrl} onDownload={handleDownload} />
            </div>
          )}

          {!pdfUrl && !loading && (
            <div className="preview-col preview-empty">
              <div className="empty-state">
                <span>{tab === "resume" ? "📄" : "✉️"}</span>
                <p>{tab === "resume" ? "Your resume preview will appear here" : "Your cover letter preview will appear here"}</p>
                <small>Fill the form and click Generate</small>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="error">❌ {error}</div>}

    </div>
  );
}