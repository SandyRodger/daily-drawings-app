import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

function UploadCard({ onFileSelect }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
    noClick: true,
  });

  return (
    <section className="upload-card" {...getRootProps()}>
      <input {...getInputProps()} />
      <h2>Add a new drawing</h2>
      <p>
        {isDragActive
          ? "Drop the image here..."
          : "Drag and drop an image here"}
      </p>
      <p className="upload-divider">or</p>
      <button type="button" className="upload-button" onClick={open}>
        Choose from files
      </button>
    </section>
  );
}

export default UploadCard;