import { useState } from "react";

function UploadDetailsModal({ previewUrl, artists, onCancel, onSubmit }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [artistId, setArtistId] = useState(artists[0]?.id ?? "");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ title, caption, date, notes, artist_id: artistId });
  }

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <h2>Add drawing details</h2>
        <img src={previewUrl} alt="Cropped preview" className="upload-preview" />
        <form onSubmit={handleSubmit}>
          <label>
            Artist
            <select value={artistId} onChange={(e) => setArtistId(e.target.value)} required>
              <option value="" disabled>Select an artist</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
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
