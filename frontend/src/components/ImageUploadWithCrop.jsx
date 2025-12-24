import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Info, AlertCircle } from 'lucide-react';
import { showError, showSuccess } from '../utils/popupNotification';
import './ImageUploadWithCrop.css';

const ImageUploadWithCrop = ({
  label,
  currentImage,
  onImageUpdate,
  acceptedFormats = '.jpg,.jpeg,.png',
  maxFileSize = 5, // MB
  minDimensions = { width: 100, height: 100 },
  uploadEndpoint,
  fieldName,
  description,
  className = '',
  targetWidth = 300,
  targetHeight = 300,
  aspectRatio = 1,
  cropShape = 'rect'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file size
    const maxBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxBytes) {
      showError(`File is too large. Maximum size is ${maxFileSize}MB.`);
      return false;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showError('Invalid file type. Only JPG and PNG files are allowed.');
      return false;
    }

    return true;
  };

  const validateImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const { width, height } = img;
        URL.revokeObjectURL(objectUrl);
        
        if (width < minDimensions.width || height < minDimensions.height) {
          showError(`Image too small. Minimum ${minDimensions.width}x${minDimensions.height}px required.`);
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        showError('Unable to read image. Please try a different file.');
        resolve(false);
      };
      
      img.src = objectUrl;
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    const isDimensionsValid = await validateImageDimensions(file);
    if (!isDimensionsValid) {
      e.target.value = '';
      return;
    }

    // Direct upload without cropping
    handleDirectUpload(file);
  };

  const handleDirectUpload = async (file) => {
    setIsUploading(true);

    try {
      const token = localStorage.getItem('employerToken');
      if (!token) {
        showError('Please login again to upload files.');
        return;
      }

      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onImageUpdate(data[fieldName] || data.logo || data.coverImage);
        showSuccess(`${label} uploaded successfully!`);
        
        window.dispatchEvent(new Event('employerProfileUpdated'));
      } else {
        showError(data.message || `${label} upload failed`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError(`${label} upload failed. Please try again.`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getAspectRatioText = () => {
    return 'Direct Upload';
  };

  return (
    <div className={`image-upload-with-crop ${className}`}>
      <div className="upload-section">
        <label className="upload-label">
          <ImageIcon size={16} className="me-2" />
          {label}
        </label>
        
        <div className="upload-area" onClick={handleUploadClick}>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
          
          <div className="upload-content">
            <Upload size={24} className="upload-icon" />
            <p className="upload-text">
              {isUploading ? 'Uploading...' : 'Click to select image'}
            </p>
            <p className="upload-subtext">
              {acceptedFormats.replace(/\./g, '').toUpperCase()} • Max {maxFileSize}MB
            </p>
          </div>
        </div>

        {currentImage && (
          <div className="current-image-preview">
            <img 
              src={currentImage.startsWith('data:') ? currentImage : `data:image/jpeg;base64,${currentImage}`} 
              alt={label}
              className="preview-image"
              onError={(e) => {
                console.log('Image load error for:', label, 'URL:', e.target.src);
                // Try different formats
                if (e.target.src.startsWith('data:image/jpeg;base64,')) {
                  // Try PNG format
                  e.target.src = currentImage.startsWith('data:') ? currentImage : `data:image/png;base64,${currentImage}`;
                } else if (e.target.src.startsWith('data:image/png;base64,')) {
                  // Try direct URL
                  e.target.src = currentImage.startsWith('http') ? currentImage : `http://localhost:5000${currentImage}`;
                } else {
                  e.target.style.display = 'none';
                  console.error('Failed to load image after trying multiple formats');
                }
              }}
            />
            <p className="success-text">✓ {label} uploaded successfully</p>
          </div>
        )}

        <div className="upload-info">
          <div className="info-item">
            <Info size={14} />
            <span>Max file size: {maxFileSize}MB</span>
          </div>
          <div className="info-item">
            <Info size={14} />
            <span>Minimum: {minDimensions.width} × {minDimensions.height} pixels</span>
          </div>
          <div className="info-item">
            <Info size={14} />
            <span>Formats: {acceptedFormats.replace(/\./g, '').toUpperCase()}</span>
          </div>
          {description && (
            <div className="info-item description">
              <AlertCircle size={14} />
              <span>{description}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadWithCrop;