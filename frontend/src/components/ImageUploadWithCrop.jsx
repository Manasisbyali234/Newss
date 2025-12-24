import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Info, AlertCircle } from 'lucide-react';
import SimpleCropper from './SimpleCropper';
import { showError, showSuccess } from '../utils/popupNotification';
import './ImageUploadWithCrop.css';

const ImageUploadWithCrop = ({
  label,
  currentImage,
  onImageUpdate,
  aspectRatio = 1,
  targetWidth = 300,
  targetHeight = 300,
  cropShape = 'rect',
  acceptedFormats = '.jpg,.jpeg,.png',
  maxFileSize = 5, // MB
  minDimensions = { width: 100, height: 100 },
  uploadEndpoint,
  fieldName,
  description,
  className = ''
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedImage) => {
    console.log('Crop completed, processing image...');
    setShowCropper(false);
    setIsUploading(true);

    try {
      const token = localStorage.getItem('employerToken');
      if (!token) {
        showError('Please login again to upload files.');
        return;
      }

      console.log('Uploading cropped image...');
      const formData = new FormData();
      formData.append(fieldName, croppedImage.file);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.success) {
        onImageUpdate(data[fieldName] || data.logo || data.coverImage);
        showSuccess(`${label} uploaded successfully!`);
        
        // Trigger profile update event
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
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getAspectRatioText = () => {
    if (aspectRatio === 1) return '1:1 (Square)';
    if (aspectRatio === 16/9) return '16:9 (Widescreen)';
    if (aspectRatio === 4/3) return '4:3 (Standard)';
    if (aspectRatio === 3/2) return '3:2 (Photo)';
    return `${aspectRatio}:1`;
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
              src={currentImage} 
              alt={label}
              className="preview-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p className="success-text">✓ {label} uploaded successfully</p>
          </div>
        )}

        <div className="upload-info">
          <div className="info-item">
            <Info size={14} />
            <span>Target size: {targetWidth} × {targetHeight} pixels</span>
          </div>
          <div className="info-item">
            <Info size={14} />
            <span>Aspect ratio: {getAspectRatioText()}</span>
          </div>
          <div className="info-item">
            <Info size={14} />
            <span>Minimum: {minDimensions.width} × {minDimensions.height} pixels</span>
          </div>
          {description && (
            <div className="info-item description">
              <AlertCircle size={14} />
              <span>{description}</span>
            </div>
          )}
        </div>
      </div>

      {showCropper && selectedImage && (
        <SimpleCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
          title={`Crop ${label}`}
          targetWidth={targetWidth}
          targetHeight={targetHeight}
        />
      )}
    </div>
  );
};

export default ImageUploadWithCrop;