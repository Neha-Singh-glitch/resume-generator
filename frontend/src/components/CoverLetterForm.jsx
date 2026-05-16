// CoverLetterForm.jsx — Form for cover letter generation
import { useState } from "react";

export default function CoverLetterForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name:         "",
    email:        "",
    phone:        "",
    linkedin:     "",
    role:         "",
    company:      "",
    why_company:  "",
    skills:       "",
    experience:   "",
    tone:         "professional",
  });

  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "Name is required.";
    if (!form.role.trim())        e.role        = "Target role is required.";
    if (!form.company.trim())     e.company     = "Company name is required.";
    if (!form.skills.trim())      e.skills      = "Please enter at least one skill.";
    if (!form.experience.trim())  e.experience  = "Please enter at least one experience highlight.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      skills:     form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      experience: form.experience.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    onSubmit(payload);
  };

  return (
    <form className="resume-form" onSubmit={handleSubmit} noValidate>

      {/* ── Personal Info ── */}
      <section className="form-section">
        <h2>Your Info</h2>
        <div className="form-grid">
          <div className="field">
            <input placeholder="Full Name *" value={form.name} onChange={(e) => update("name", e.target.value)} className={errors.name ? "invalid" : ""} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="field">
            <input placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="field">
            <input placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="field">
            <input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── Job Details ── */}
      <section className="form-section">
        <h2>Job Details</h2>
        <div className="form-grid">
          <div className="field">
            <input placeholder="Target Role *" value={form.role} onChange={(e) => update("role", e.target.value)} className={errors.role ? "invalid" : ""} />
            {errors.role && <span className="field-error">{errors.role}</span>}
          </div>
          <div className="field">
            <input placeholder="Company Name *" value={form.company} onChange={(e) => update("company", e.target.value)} className={errors.company ? "invalid" : ""} />
            {errors.company && <span className="field-error">{errors.company}</span>}
          </div>
        </div>
        <div className="field">
          <textarea placeholder="Why do you want to work at this company specifically?" value={form.why_company} onChange={(e) => update("why_company", e.target.value)} rows={3} />
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="form-section">
        <h2>Key Skills *</h2>
        <input placeholder="Python, React, PostgreSQL..." value={form.skills} onChange={(e) => update("skills", e.target.value)} className={errors.skills ? "invalid" : ""} />
        {errors.skills && <span className="field-error">{errors.skills}</span>}
        <small>Separate with commas</small>
      </section>

      {/* ── Experience ── */}
      <section className="form-section">
        <h2>Experience Highlights *</h2>
        <textarea
          placeholder={"Built REST APIs serving 10k users\nReduced load time by 40%\nLed a team of 3 engineers"}
          value={form.experience}
          onChange={(e) => update("experience", e.target.value)}
          className={errors.experience ? "invalid" : ""}
          rows={4}
        />
        {errors.experience && <span className="field-error">{errors.experience}</span>}
        <small>One highlight per line</small>
      </section>

      {/* ── Tone ── */}
      <section className="form-section">
        <h2>Tone</h2>
        <div className="tone-options">
          {["professional", "enthusiastic", "formal"].map((t) => (
            <button
              key={t}
              type="button"
              className={`tone-btn ${form.tone === t ? "selected" : ""}`}
              onClick={() => update("tone", t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* ── Submit ── */}
      <button type="submit" className="generate-btn" disabled={loading}>
        {loading ? <span className="spinner" /> : "✉️ Generate Cover Letter"}
      </button>

    </form>
  );
}