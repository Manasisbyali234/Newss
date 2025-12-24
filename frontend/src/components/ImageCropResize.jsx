import React, { useState, useRef, useEffect } from 'react';

const ImageCropResize = ({ 
  image, 
  onComplete, 
  onCancel, 
  aspectRatio = 1, 
  targetWidth = 300,
  targetHeight = 300,
  title = 'Crop & Resize Image'
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const outputCanvasRef = useRef(null);

  // Update preview in real-time
  const updatePreview = () => {
    if (!imageRef.current || !previewCanvasRef.current || !containerRef.current) return;
    
    try {
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (!img.complete || img.naturalWidth === 0) return;
      
      canvas.width = 100;
      canvas.height = 100;
      
      // Simple center crop without complex calculations
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      const x = (img.naturalWidth - size) / 2;
      const y = (img.naturalHeight - size) / 2;
      
      ctx.drawImage(img, x, y, size, size, 0, 0, 100, 100);
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      updatePreview();
    }
  }, []);

  // Mouse handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Process and crop image
  const handleProcess = async () => {
    setIsProcessing(true);
    
    try {
      const canvas = outputCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Simple center crop
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const cropAspect = aspectRatio;
      
      let cropWidth, cropHeight, cropX, cropY;
      
      if (imgAspect > cropAspect) {
        cropHeight = img.naturalHeight;
        cropWidth = cropHeight * cropAspect;
        cropX = (img.naturalWidth - cropWidth) / 2;
        cropY = 0;
      } else {
        cropWidth = img.naturalWidth;
        cropHeight = cropWidth / cropAspect;
        cropX = 0;
        cropY = (img.naturalHeight - cropHeight) / 2;
      }
      
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, targetWidth, targetHeight
      );
      
      // Convert to file
      canvas.toBlob((blob) => {
        const file = new File([blob], 'processed-image.jpg', { type: 'image/jpeg' });
        onComplete({
          file: file,
          url: canvas.toDataURL('image/jpeg', 0.9)
        });
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '95vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
            {title}
          </h2>
          <button onClick={onCancel} style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px',
            color: '#6b7280'
          }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Instructions */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            color: '#92400e'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Drag to position • Use zoom controls • Preview shows final result</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {/* Crop Area */}
            <div style={{ flex: 1 }}>
              <div 
                ref={containerRef}
                style={{
                  position: 'relative !important',
                  width: '100% !important',
                  height: '400px !important',
                  backgroundColor: '#f3f4f6 !important',
                  borderRadius: '8px !important',
                  overflow: 'hidden !important',
                  cursor: 'default !important',
                  border: '2px solid #e5e7eb !important',
                  display: 'flex !important',
                  alignItems: 'center !important',
                  justifyContent: 'center !important'
                }}
              >
                <img
                  ref={imageRef}
                  src={image}
                  alt="Crop"
                  style={{
                    width: '100% !important',
                    height: '100% !important',
                    objectFit: 'contain !important',
                    userSelect: 'none !important',
                    pointerEvents: 'none !important',
                    display: 'block !important'
                  }}
                  draggable={false}
                  onLoad={updatePreview}
                />
                
                {/* Crop Frame */}
                <div style={{
                  position: 'absolute !important',
                  top: '50% !important',
                  left: '50% !important',
                  width: '80% !important',
                  height: '80% !important',
                  aspectRatio: aspectRatio + ' !important',
                  border: '3px solid #f97316 !important',
                  borderRadius: '8px !important',
                  transform: 'translate(-50%, -50%) !important',
                  pointerEvents: 'none !important',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3) !important'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#f97316',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    CROP AREA
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f97316',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Zoom Out
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 500, minWidth: '70px', textAlign: 'center' }}>
                    {zoom.toFixed(1)}x
                  </span>
                  <button 
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f97316',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Zoom In
                  </button>
                </div>
                
                <button 
                  onClick={() => { setPosition({ x: 0, y: 0 }); setZoom(1); }}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div style={{
              width: '200px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 600 }}>
                Live Preview
              </h4>
              
              <div style={{
                width: aspectRatio === 1 ? '100px' : '120px',
                height: aspectRatio === 1 ? '100px' : '67px',
                borderRadius: aspectRatio === 1 ? '50%' : '8px',
                overflow: 'hidden',
                border: '3px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                margin: '0 auto 15px auto',
                backgroundColor: '#f3f4f6'
              }}>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block'
                  }}
                />
              </div>
              
              <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#6b7280' }}>
                {aspectRatio === 1 ? 'Logo (Circular)' : 'Cover Image'}
              </p>
              
              <div style={{
                padding: '10px',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#0369a1'
              }}>
                Output: {targetWidth}×{targetHeight}px
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button 
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleProcess}
              disabled={isProcessing}
              style={{
                padding: '10px 20px',
                backgroundColor: isProcessing ? '#9ca3af' : '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isProcessing ? 'Processing...' : 'Crop & Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for output */}
      <canvas ref={outputCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropResize;