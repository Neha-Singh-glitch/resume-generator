// ATSScorer.jsx — ATS score form + visual results display
import { useState } from "react";

// ── Score ring component ───────────────────────────────────────────────────
function ScoreRing({ score, size = 120, label }) {
  const radius      = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "#48bb78"
              : score >= 60 ? "#ecc94b"
              : "#fc8181";

  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border)" strokeWidth="8"
        />
        {/* Score arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        {/* Score text */}
        <text
          x="50%" y="50%"
          textAnchor="middle" dominantBaseline="central"
          fontSize={size === 120 ? "1.6rem" : "1rem"}
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
      </svg>
      {label && <span className="ring-label">{label}</span>}
    </div>
  );
}


// ── Main ATS Scorer ────────────────────────────────────────────────────────
export default function ATSScorer() {
  const [form, setForm] = useState({
    resume_text:     "",
    job_description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState(null);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resume_text.trim() || !form.job_description.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Something went wrong.");
      }

      const data = await response.json();
      setResult(data.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ats-container">

      {/* ── Input Form ── */}
      <form className="resume-form" onSubmit={handleSubmit} noValidate>

        <section className="form-section">
          <h2>Your Resume Text</h2>
          <textarea
            placeholder="Paste your resume text here (copy from your resume document)..."
            value={form.resume_text}
            onChange={(e) => update("resume_text", e.target.value)}
            rows={10}
          />
          <small>Paste the plain text content of your resume</small>
        </section>

        <section className="form-section">
          <h2>Job Description</h2>
          <textarea
            placeholder="Paste the full job description here..."
            value={form.job_description}
            onChange={(e) => update("job_description", e.target.value)}
            rows={10}
          />
          <small>Paste the job posting you want to apply for</small>
        </section>

        {error && <div className="error">❌ {error}</div>}

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading
            ? <><span className="spinner" /> &nbsp; Analyzing...</>
            : "🎯 Analyze ATS Score"
          }
        </button>

      </form>

      {/* ── Results ── */}
      {result && (
        <div className="ats-results">

          {/* ── Overall score ── */}
          <section className="form-section ats-hero">
            <div className="ats-hero-content">
              <ScoreRing score={result.overall_score} size={140} />
              <div className="ats-hero-text">
                <h2>ATS Match Score</h2>
                <p className="ats-summary">{result.summary}</p>
              </div>
            </div>
          </section>

          {/* ── Category scores ── */}
          <section className="form-section">
            <h2>Category Breakdown</h2>
            <div className="ats-categories">
              {Object.values(result.categories).map((cat) => (
                <div className="ats-category" key={cat.label}>
                  <ScoreRing score={cat.score} size={80} />
                  <span className="cat-label">{cat.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Keywords ── */}
          <div className="ats-keywords-grid">
            <section className="form-section">
              <h2>✅ Matched Keywords</h2>
              <div className="keyword-tags">
                {result.matched_keywords.length > 0
                  ? result.matched_keywords.map((k) => (
                      <span key={k} className="tag tag-green">{k}</span>
                    ))
                  : <span className="no-items">None found</span>
                }
              </div>
            </section>

            <section className="form-section">
              <h2>❌ Missing Keywords</h2>
              <div className="keyword-tags">
                {result.missing_keywords.length > 0
                  ? result.missing_keywords.map((k) => (
                      <span key={k} className="tag tag-red">{k}</span>
                    ))
                  : <span className="no-items">None — great match!</span>
                }
              </div>
            </section>
          </div>

          {/* ── Strengths ── */}
          <section className="form-section">
            <h2>💪 Strengths</h2>
            <ul className="ats-list ats-list-green">
              {result.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>

          {/* ── Improvements ── */}
          <section className="form-section">
            <h2>🔧 Suggested Improvements</h2>
            <ul className="ats-list ats-list-yellow">
              {result.improvements.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>

        </div>
      )}
    </div>
  );
}