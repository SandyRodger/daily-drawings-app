import { useEffect, useState } from "react";
import "./App.css"

const API_URL = import.meta.env.VITE_API_URL;
import UploadCard from "./components/UploadCard";
import CropModal from "./components/CropModal";
import EditModal from "./components/EditModal";
import UploadDetailsModal from "./components/UploadDetailsModal";
import { getCroppedImg } from "./utils/cropImage";

function App() {
  const [drawings, setDrawings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [imageSrc, setImageSrc] = useState("");
  const [croppedPreview, setCroppedPreview] = useState("");
  const [croppedBlob, setCroppedBlob] = useState(null);

  const [drawingToDelete, setDrawingToDelete] = useState(null);
  const [drawingToEdit, setDrawingToEdit] = useState(null);
  const [artistToDelete, setArtistToDelete] = useState(null);

  const [newArtistName, setNewArtistName] = useState("");
  const [showNewArtistInput, setShowNewArtistInput] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/drawings`).then((r) => { if (!r.ok) throw new Error("Failed to fetch drawings"); return r.json(); }),
      fetch(`${API_URL}/api/artists`).then((r) => { if (!r.ok) throw new Error("Failed to fetch artists"); return r.json(); }),
    ])
      .then(([drawingsData, artistsData]) => {
        setDrawings(drawingsData);
        setArtists(artistsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleFileSelect = (file) => {
    setImageSrc(URL.createObjectURL(file));
    setCroppedPreview("");
    setCroppedBlob(null);
  };

  async function handleConfirmCrop(pixelCrop) {
    if (!imageSrc || !pixelCrop) return;
    try {
      const result = await getCroppedImg(imageSrc, pixelCrop);
      setCroppedBlob(result.blob);
      setCroppedPreview(result.previewUrl);
      setImageSrc("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  const handleCancelCrop = () => {
    setImageSrc("");
  };

  async function handleSubmitDetails({ title, caption, date, notes, artist_id }) {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("caption", caption);
      formData.append("date", date);
      formData.append("notes", notes);
      formData.append("artist_id", artist_id);
      formData.append("image", croppedBlob, "cropped-drawing.jpg");

      const response = await fetch(`${API_URL}/api/drawings`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload drawing");

      const newDrawing = await response.json();
      setDrawings((prev) => [newDrawing, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCroppedBlob(null);
      setCroppedPreview("");
    }
  }

  function handleCancelDetails() {
    setCroppedBlob(null);
    setCroppedPreview("");
  }

  async function handleSaveEdit(fields, imageBlob) {
    try {
      let response;
      if (imageBlob) {
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => { if (v != null) formData.append(k, v); });
        formData.append("image", imageBlob, "cropped-drawing.jpg");
        response = await fetch(`${API_URL}/api/drawings/${drawingToEdit.id}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        response = await fetch(`${API_URL}/api/drawings/${drawingToEdit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
      }
      if (!response.ok) throw new Error("Failed to update drawing");
      const updated = await response.json();
      setDrawings((prev) => prev.map((d) => d.id === updated.id ? updated : d));
    } catch (err) {
      setError(err.message);
    } finally {
      setDrawingToEdit(null);
    }
  }

  async function handleConfirmDelete() {
    try {
      const response = await fetch(`${API_URL}/api/drawings/${drawingToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete drawing");
      setDrawings((prev) => prev.filter((d) => d.id !== drawingToDelete.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDrawingToDelete(null);
    }
  }

  async function handleAddArtist(e) {
    e.preventDefault();
    if (!newArtistName.trim()) return;
    try {
      const response = await fetch(`${API_URL}/api/artists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newArtistName.trim() }),
      });
      if (!response.ok) throw new Error("Failed to create artist");
      const artist = await response.json();
      setArtists((prev) => [...prev, artist]);
    } catch (err) {
      setError(err.message);
    } finally {
      setNewArtistName("");
      setShowNewArtistInput(false);
    }
  }

  async function handleConfirmDeleteArtist() {
    try {
      const response = await fetch(`${API_URL}/api/artists/${artistToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete artist");
      setArtists((prev) => prev.filter((a) => a.id !== artistToDelete.id));
      setDrawings((prev) => prev.filter((d) => d.artist_id !== artistToDelete.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setArtistToDelete(null);
    }
  }

  if (loading) return <p>Loading drawings...</p>;

  return (
    <main className="app">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}
      <h1>Daily Drawings</h1>

      <UploadCard onFileSelect={handleFileSelect} />

      <CropModal
        imageSrc={imageSrc}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />

      {croppedPreview && (
        <UploadDetailsModal
          previewUrl={croppedPreview}
          artists={artists}
          onCancel={handleCancelDetails}
          onSubmit={handleSubmitDetails}
        />
      )}

      {drawingToEdit && (
        <EditModal
          drawing={drawingToEdit}
          artists={artists}
          onCancel={() => setDrawingToEdit(null)}
          onSave={handleSaveEdit}
        />
      )}

      {drawingToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Delete this drawing?</h2>
            <p>"{drawingToDelete.title}" will be permanently removed.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDrawingToDelete(null)}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={handleConfirmDelete}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {artistToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Delete this column?</h2>
            <p>"{artistToDelete.name}" and all their drawings will be permanently removed.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setArtistToDelete(null)}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={handleConfirmDeleteArtist}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="artists-bar">
        {showNewArtistInput ? (
          <form className="new-artist-form" onSubmit={handleAddArtist}>
            <input
              type="text"
              value={newArtistName}
              onChange={(e) => setNewArtistName(e.target.value)}
              placeholder="Artist name"
              autoFocus
            />
            <button type="submit" className="primary-button">Add</button>
            <button type="button" className="secondary-button" onClick={() => setShowNewArtistInput(false)}>Cancel</button>
          </form>
        ) : (
          <button className="add-artist-button" onClick={() => setShowNewArtistInput(true)}>
            + Add Artist Column
          </button>
        )}
      </div>

      {artists.length === 0 ? (
        <p>No artist columns yet. Add one above to get started.</p>
      ) : (() => {
        const sortedDates = [...new Set(drawings.map((d) => d.date).filter(Boolean))].sort().reverse();
        return (
          <div className="timeline">
            <div className="timeline-row timeline-header">
              <div className="date-label"></div>
              {artists.map((a) => (
                <div key={a.id} className="timeline-cell artist-name">{a.name}</div>
              ))}
            </div>

            {sortedDates.length === 0 ? (
              <p className="empty-column">No drawings yet.</p>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="timeline-row">
                  <div className="date-label">{date}</div>
                  {artists.map((artist) => {
                    const cellDrawings = drawings.filter(
                      (d) => d.artist_id === artist.id && d.date === date
                    );
                    return (
                      <div key={artist.id} className="timeline-cell">
                        {cellDrawings.map((drawing) => (
                          <article key={drawing.id} className="drawing-card">
                            {drawing.image_url && (
                              <img
                                src={drawing.image_url}
                                alt={drawing.title}
                                className="drawing-image"
                              />
                            )}
                            <div className="drawing-content">
                              <h2>{drawing.title}</h2>
                              <p>{drawing.caption}</p>
                              <div className="card-actions">
                                <button
                                  type="button"
                                  className="edit-button"
                                  onClick={() => setDrawingToEdit(drawing)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="delete-button"
                                  onClick={() => setDrawingToDelete(drawing)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        );
      })()}
    </main>
  );
}

export default App;
