// TemplateSelector.jsx — Visual card picker for resume templates
const TEMPLATES = [
  {
    id:          "modern",
    label:       "Modern",
    icon:        "🎨",
    description: "Bold headings with a color accent line",
  },
  {
    id:          "minimal",
    label:       "Minimal",
    icon:        "⬜",
    description: "Clean, compact, no-frills layout",
  },
  {
    id:          "academic",
    label:       "Academic",
    icon:        "🎓",
    description: "Formal small-caps style for research roles",
  },
];

export default function TemplateSelector({ selected, onChange }) {
  return (
    <div className="template-selector">
      <h2>CHOOSE TEMPLATE</h2>
      <div className="template-cards">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className={`template-card ${selected === t.id ? "selected" : ""}`}
            onClick={() => onChange(t.id)}
          >
            <span className="template-icon">{t.icon}</span>
            <strong>{t.label}</strong>
            <p>{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}