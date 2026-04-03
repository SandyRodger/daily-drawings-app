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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [imageSrc, setImageSrc] = useState("");
  const [croppedPreview, setCroppedPreview] = useState("");
  const [croppedBlob, setCroppedBlob] = useState(null);

  const [drawingToDelete, setDrawingToDelete] = useState(null);
  const [drawingToEdit, setDrawingToEdit] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/drawings`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("failed to fetch drawings");
        }
        return res.json();
      })
      .then((data) => {
        setDrawings(data);
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

  async function handleSubmitDetails({ title, caption, date, notes }) {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("caption", caption);
      formData.append("date", date);
      formData.append("notes", notes);
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

  async function handleSaveEdit(fields) {
    try {
      const response = await fetch(`${API_URL}/api/drawings/${drawingToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
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

  if (loading) return <p>Loading drawings...</p>;
  if (error) return <p>Error: {error}</p>

  return (
    <main className="app">
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
          onCancel={handleCancelDetails}
          onSubmit={handleSubmitDetails}
        />
      )}

      {drawingToEdit && (
        <EditModal
          drawing={drawingToEdit}
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
              <button
                type="button"
                className="secondary-button"
                onClick={() => setDrawingToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={handleConfirmDelete}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      { drawings.length === 0 ? (
        <p>No drawings yet.</p>
      ) : (
        <section className="drawings-grid">
          {drawings.map((drawing) => (
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
                <small>{drawing.date}</small>
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
          </section>
        )}
      </main>
  );
}

export default App;