import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

function CellUploadCard({ onFileSelect }) {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
  });

  return (
    <div
      className={`cell-upload-card${isDragActive ? " cell-upload-card--drag" : ""}`}
      {...getRootProps()}
      onClick={open}
    >
      <input {...getInputProps()} />
      <span className="cell-upload-plus">+</span>
    </div>
  );
}

export default CellUploadCard;
