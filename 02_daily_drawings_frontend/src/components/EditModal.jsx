import { useState } from "react";

function EditModal({ drawing, artists, onCancel, onSave }) {
  const [title, setTitle] = useState(drawing.title || "");
  const [caption, setCaption] = useState(drawing.caption || "");
  const [date, setDate] = useState(drawing.date || "");
  const [notes, setNotes] = useState(drawing.notes || "");
  const [artistId, setArtistId] = useState(drawing.artist_id ?? "");

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ title, caption, date, notes, artist_id: artistId || null });
  }

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <h2>Edit drawing</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Artist
            <select value={artistId} onChange={(e) => setArtistId(e.target.value)}>
              <option value="">— Unassigned —</option>
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
              rows={3}
            />
          </label>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;
