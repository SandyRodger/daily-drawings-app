import { useState } from "react";

function UploadDetailsModal({ previewUrl, onCancel, onSubmit }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ title, caption, date, notes });
  }

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <h2>Add drawing details</h2>
        <img src={previewUrl} alt="Cropped preview" className="upload-preview" />
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning sketch"
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Caption
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="A short description..."
            />
          </label>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any extra notes..."
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save drawing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDetailsModal;
