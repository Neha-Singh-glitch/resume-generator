// JobMatcher.jsx — Paste job description + resume info → get tailored resume
import { useState } from "react";
import TemplateSelector from "./TemplateSelector";
import PDFPreview from "./PDFPreview";

export default function JobMatcher() {
  const [step, setStep]     = useState("form");  // "form" | "preview"
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  const [form, setForm] = useState({
    name:            "",
    role:            "",
    email:           "",
    phone:           "",
    linkedin:        "",
    skills:          "",
    experience:      "",
    job_description: "",
    template:        "modern",
    projects: [{ name: "", description: "", tech_stack: "" }],
  });

  const [errors, setErrors] = useState({});

  const update = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const updateProject = (index, field, value) => {
    const updated = [...form.projects];
    updated[index][field] = value;
    setForm((f) => ({ ...f, projects: updated }));
  };

  const addProject = () =>
    setForm((f) => ({
      ...f,
      projects: [...f.projects, { name: "", description: "", tech_stack: "" }],
    }));

  const removeProject = (index) =>
    setForm((f) => ({
      ...f,
      projects: f.projects.filter((_, i) => i !== index),
    }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())            e.name            = "Name is required.";
    if (!form.role.trim())            e.role            = "Target role is required.";
    if (!form.skills.trim())          e.skills          = "Skills are required.";
    if (!form.experience.trim())      e.experience      = "Experience is required.";
    if (!form.job_description.trim()) e.job_description = "Please paste a job description.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    setPdfUrl(null);

    const payload = {
      ...form,
      skills:     form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      experience: form.experience.split("\n").map((s) => s.trim()).filter(Boolean),
      projects:   form.projects.map((p) => ({
        name:        p.name,
        description: p.description,
        tech_stack:  p.tech_stack.split(",").map((s) => s.trim()).filter(Boolean),
      })),
    };

    try {
      const response = await fetch("http://localhost:8000/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Something went wrong.");
      }

      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setStep("preview");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a    = document.createElement("a");
    a.href     = pdfUrl;
    a.download = `${form.name.replace(/\s+/g, "_")}_tailored_resume.pdf`;
    a.click();
  };

  return (
    <div className="jd-container">

      {/* ── Matched keywords banner ── */}
      <div className="jd-banner">
        <span>🎯</span>
        <div>
          <strong>Job Description Matcher</strong>
          <p>Paste a job posting and your resume — AI will tailor your resume to match the role perfectly.</p>
        </div>
      </div>

      <div className={`layout ${pdfUrl ? "with-preview" : ""}`}>

        {/* ── Form ── */}
        <div className="form-col">
          <form className="resume-form" onSubmit={handleSubmit} noValidate>

            {/* ── Job Description — most important, goes first ── */}
            <section className="form-section jd-highlight">
              <h2>🗂 Job Description *</h2>
              <textarea
                placeholder="Paste the full job description here — the more detail, the better the tailoring..."
                value={form.job_description}
                onChange={(e) => update("job_description", e.target.value)}
                className={errors.job_description ? "invalid" : ""}
                rows={10}
              />
              {errors.job_description && <span className="field-error">{errors.job_description}</span>}
              <small>AI will mirror keywords and language from this posting</small>
            </section>

            {/* ── Template ── */}
            <TemplateSelector
              selected={form.template}
              onChange={(t) => update("template", t)}
            />

            {/* ── Personal Info ── */}
            <section className="form-section">
              <h2>Personal Info</h2>
              <div className="form-grid">
                <div className="field">
                  <input placeholder="Full Name *" value={form.name} onChange={(e) => update("name", e.target.value)} className={errors.name ? "invalid" : ""} />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="field">
                  <input placeholder="Target Role *" value={form.role} onChange={(e) => update("role", e.target.value)} className={errors.role ? "invalid" : ""} />
                  {errors.role && <span className="field-error">{errors.role}</span>}
                </div>
                <div className="field">
                  <input placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                <div className="field">
                  <input placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="field full-width">
                  <input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
                </div>
              </div>
            </section>

            {/* ── Skills ── */}
            <section className="form-section">
              <h2>Skills *</h2>
              <input
                placeholder="Python, React, PostgreSQL..."
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
                className={errors.skills ? "invalid" : ""}
              />
              {errors.skills && <span className="field-error">{errors.skills}</span>}
              <small>AI will reorder these to match the job requirements</small>
            </section>

            {/* ── Experience ── */}
            <section className="form-section">
              <h2>Experience *</h2>
              <textarea
                placeholder={"Built REST APIs for 10k users\nReduced page load time by 40%\nLed a team of 3 engineers"}
                value={form.experience}
                onChange={(e) => update("experience", e.target.value)}
                className={errors.experience ? "invalid" : ""}
                rows={5}
              />
              {errors.experience && <span className="field-error">{errors.experience}</span>}
              <small>One bullet per line — AI will rewrite to match the job</small>
            </section>

            {/* ── Projects ── */}
            <section className="form-section">
              <h2>Projects</h2>
              {form.projects.map((p, i) => (
                <div className="project-card" key={i}>
                  <div className="project-header">
                    <h3>Project {i + 1}</h3>
                    {form.projects.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removeProject(i)}>✕ Remove</button>
                    )}
                  </div>
                  <input placeholder="Project Name" value={p.name} onChange={(e) => updateProject(i, "name", e.target.value)} />
                  <textarea placeholder="What did you build?" value={p.description} onChange={(e) => updateProject(i, "description", e.target.value)} rows={2} />
                  <input placeholder="React, Node.js..." value={p.tech_stack} onChange={(e) => updateProject(i, "tech_stack", e.target.value)} />
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addProject}>+ Add Project</button>
            </section>

            {error && <div className="error">❌ {error}</div>}

            <button type="submit" className="generate-btn" disabled={loading}>
              {loading ? <><span className="spinner" />&nbsp; Tailoring your resume...</> : "🎯 Tailor Resume for This Job"}
            </button>

          </form>
        </div>

        {/* ── Preview ── */}
        {pdfUrl && (
          <div className="preview-col">
            <PDFPreview url={pdfUrl} onDownload={handleDownload} />
          </div>
        )}

        {!pdfUrl && !loading && (
          <div className="preview-col preview-empty">
            <div className="empty-state">
              <span>🎯</span>
              <p>Your tailored resume will appear here</p>
              <small>Paste a job description and fill the form</small>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}