// ResumeForm.jsx — Full form with template selector and validation
import { useState } from "react";
import TemplateSelector from "./TemplateSelector";

export default function ResumeForm({ onSubmit, loading, onTemplateChange }) {
  const [form, setForm] = useState({
    name:       "",
    role:       "",
    email:      "",
    phone:      "",
    linkedin:   "",
    summary:    "",
    skills:     "",
    experience: "",
    template:   "modern",
    projects:   [{ name: "", description: "", tech_stack: "" }],
  });

  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    if (field === "template" && onTemplateChange) {
      onTemplateChange(value);  // ← notify App to clear preview
    }
  };

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
    if (!form.name.trim())       e.name       = "Full name is required.";
    if (!form.role.trim())       e.role       = "Target role is required.";
    if (!form.skills.trim())     e.skills     = "Please enter at least one skill.";
    if (!form.experience.trim()) e.experience = "Please enter at least one experience bullet.";

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address.";
    }

    form.projects.forEach((p, i) => {
      if (!p.name.trim())        e[`proj_name_${i}`] = "Project name is required.";
      if (!p.description.trim()) e[`proj_desc_${i}`] = "Project description is required.";
    });

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
      projects:   form.projects.map((p) => ({
        name:        p.name,
        description: p.description,
        tech_stack:  p.tech_stack.split(",").map((s) => s.trim()).filter(Boolean),
      })),
    };
    onSubmit(payload);
  };

  return (
    <form className="resume-form" onSubmit={handleSubmit} noValidate>

      {/* ── Template Selector ── */}
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
            <input placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} className={errors.email ? "invalid" : ""} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <input placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="field full-width">
            <input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── Summary ── */}
      <section className="form-section">
        <h2>Summary <span>(optional — AI will generate one)</span></h2>
        <textarea placeholder="Brief summary of yourself..." value={form.summary} onChange={(e) => update("summary", e.target.value)} rows={3} />
      </section>

      {/* ── Skills ── */}
      <section className="form-section">
        <h2>Skills *</h2>
        <input placeholder="Python, React, PostgreSQL, Docker..." value={form.skills} onChange={(e) => update("skills", e.target.value)} className={errors.skills ? "invalid" : ""} />
        {errors.skills && <span className="field-error">{errors.skills}</span>}
        <small>Separate skills with commas</small>
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
        <small>One bullet point per line — AI will improve each one</small>
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
            <div className="field">
              <input placeholder="Project Name *" value={p.name} onChange={(e) => updateProject(i, "name", e.target.value)} className={errors[`proj_name_${i}`] ? "invalid" : ""} />
              {errors[`proj_name_${i}`] && <span className="field-error">{errors[`proj_name_${i}`]}</span>}
            </div>
            <div className="field">
              <textarea placeholder="What did you build? What problem did it solve?" value={p.description} onChange={(e) => updateProject(i, "description", e.target.value)} className={errors[`proj_desc_${i}`] ? "invalid" : ""} rows={3} />
              {errors[`proj_desc_${i}`] && <span className="field-error">{errors[`proj_desc_${i}`]}</span>}
            </div>
            <input placeholder="React, Node.js, MongoDB..." value={p.tech_stack} onChange={(e) => updateProject(i, "tech_stack", e.target.value)} />
            <small>Separate technologies with commas</small>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addProject}>+ Add Project</button>
      </section>

      {/* ── Submit ── */}
      <button type="submit" className="generate-btn" disabled={loading}>
        {loading ? <span className="spinner" /> : "⚡ Preview Resume"}
      </button>

    </form>
  );
}