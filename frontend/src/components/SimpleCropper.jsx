import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Crop, X } from 'lucide-react';
import './SimpleCropper.css';

const SimpleCropper = ({ 
  image, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, 
  targetWidth = 300,
  targetHeight = 300,
  title = 'Crop Image'
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const getCroppedImage = async () => {
    if (!imageRef.current || !containerRef.current) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        const container = containerRef.current.getBoundingClientRect();
        const cropArea = {
          width: container.width * 0.8,
          height: container.width * 0.8 / aspectRatio
        };
        
        const scaleX = img.naturalWidth / (container.width * zoom);
        const scaleY = img.naturalHeight / (container.height * zoom);
        
        const sourceX = Math.max(0, (container.width / 2 - cropArea.width / 2 - position.x) * scaleX);
        const sourceY = Math.max(0, (container.height / 2 - cropArea.height / 2 - position.y) * scaleY);
        const sourceWidth = cropArea.width * scaleX;
        const sourceHeight = cropArea.height * scaleY;

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        );

        canvas.toBlob((blob) => {
          resolve({
            file: blob,
            url: canvas.toDataURL('image/jpeg', 0.9)
          });
        }, 'image/jpeg', 0.9);
      };
      img.src = image;
    });
  };

  const handleCropSave = async () => {
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImage();
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="simple-cropper-overlay">
      <div className="simple-cropper-modal">
        <div className="simple-cropper-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="simple-cropper-content">
          <div className="crop-instructions">
            <p><strong>How to crop:</strong> Drag the image to position it, use zoom controls to resize</p>
          </div>

          <div 
            ref={containerRef}
            className="simple-crop-container"
            onMouseDown={handleMouseDown}
          >
            <img
              ref={imageRef}
              src={image}
              alt="Crop preview"
              className="crop-image"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              draggable={false}
            />
            
            {/* Crop Frame */}
            <div className="crop-frame" style={{ aspectRatio }}>
              <div className="crop-corner top-left"></div>
              <div className="crop-corner top-right"></div>
              <div className="crop-corner bottom-left"></div>
              <div className="crop-corner bottom-right"></div>
              <div className="crop-label">CROP AREA</div>
            </div>

            {/* Overlay */}
            <div className="crop-overlay">
              <div className="overlay-top"></div>
              <div className="overlay-middle">
                <div className="overlay-left"></div>
                <div className="overlay-center"></div>
                <div className="overlay-right"></div>
              </div>
              <div className="overlay-bottom"></div>
            </div>
          </div>

          <div className="simple-crop-controls">
            <div className="zoom-controls">
              <button onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ZoomOut size={16} />
              </button>
              <span className="zoom-display">Zoom: {zoom.toFixed(1)}x</span>
              <button onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomIn size={16} />
              </button>
            </div>
            
            <div className="position-controls">
              <button onClick={() => setPosition({ x: 0, y: 0 })}>
                Center Image
              </button>
            </div>
          </div>

          <div className="output-info">
            <p>Output: {targetWidth} × {targetHeight} pixels</p>
          </div>
        </div>

        <div className="simple-cropper-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="btn-save" 
            onClick={handleCropSave}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Crop & Save'}
            <Crop size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleCropper;