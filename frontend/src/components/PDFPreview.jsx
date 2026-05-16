// PDFPreview.jsx — Renders the PDF inline using an iframe
export default function PDFPreview({ url, onDownload }) {
  return (
    <div className="pdf-preview">
      <div className="preview-header">
        <h2>📄 Preview</h2>
        <button className="download-btn" onClick={onDownload}>
          ⬇ Download PDF
        </button>
      </div>

      <iframe
        src={url}
        title="Resume Preview"
        className="pdf-iframe"
      />
    </div>
  );
}