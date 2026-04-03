import { useState } from "react";
import ReactCrop, { centerCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function CropModal({ imageSrc, onCancel, onConfirm }) {
  const [crop, setCrop] = useState();
  const [percentCrop, setPercentCrop] = useState(null);
  const [imageRef, setImageRef] = useState(null);

  if (!imageSrc) return null;

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;

    const initialCrop = centerCrop(
      {
        unit: "%",
        width: 30,
        height: 30,
        x: 0,
        y: 0,
      },
      width,
      height
    );

    setCrop(initialCrop);
    setPercentCrop(initialCrop);
    setImageRef(e.currentTarget);
  }

  function handleConfirm() {
    if (!percentCrop || !imageRef) return;

    const pixelCrop = convertToPixelCrop(
      percentCrop,
      imageRef.naturalWidth,
      imageRef.naturalHeight
    );

    onConfirm(pixelCrop);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="cropper-wrapper freeform-cropper">
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop, percentCrop) => {
              setCrop(pixelCrop);
              setPercentCrop(percentCrop);
            }}
          >
            <img
              src={imageSrc}
              alt="Crop source"
              onLoad={onImageLoad}
              className="crop-source-image"
            />
          </ReactCrop>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onCancel} className="secondary-button">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="primary-button">
            Use cropped image
          </button>
        </div>
      </div>
    </div>
  );
}

export default CropModal;