# Camera Capture Implementation for Assessment System

## Overview
The assessment system now includes automatic camera capture functionality that takes pictures of candidates every 5 minutes during assessments. These captured images are stored and can be viewed by employers in the assessment results page.

## Implementation Details

### 1. Backend Implementation

#### Database Schema
- **AssessmentAttempt Model** (`backend/models/AssessmentAttempt.js`)
  - Added `captures: [{ type: String }]` field to store image paths
  - Each capture is stored as a file path string (e.g., `/uploads/capture_1234567890.jpg`)

#### API Endpoints
- **Upload Capture Endpoint** (`backend/controllers/assessmentController.js`)
  - `POST /api/candidate/assessments/capture`
  - Accepts multipart form data with capture image
  - Validates attempt ID and candidate authentication
  - Stores image in `/uploads/` directory
  - Limits to maximum 5 captures per assessment
  - Returns capture path and count

#### File Upload Configuration
- **Upload Middleware** (`backend/middlewares/upload.js`)
  - Uses `uploadAnswerFile` multer configuration
  - Accepts JPEG images up to 10MB
  - Generates unique filenames with timestamp

### 2. Frontend Implementation

#### Assessment Quiz Component (`frontend/src/app/pannels/candidate/components/AssessmentQuiz.jsx`)

**Camera Initialization:**
```javascript
const initWebcam = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { 
      width: { ideal: 640 },
      height: { ideal: 480 }
    } 
  });
  videoRef.current.srcObject = stream;
};
```

**Automatic Capture System:**
- **Timing**: First capture after 30 seconds, then every 5 minutes (300,000ms)
- **Process**: 
  1. Draw video frame to canvas
  2. Convert canvas to JPEG blob (80% quality)
  3. Upload via FormData to backend API
  4. Track capture count (max 5)

**Capture Function:**
```javascript
const captureImage = async () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('capture', blob, `capture_${Date.now()}.jpg`);
    formData.append('attemptId', attemptId);
    
    const response = await axios.post('/api/candidate/assessments/capture', formData);
  }, 'image/jpeg', 0.8);
};
```

### 3. Employer View Implementation

#### Assessment Results Page (`frontend/src/app/pannels/employer/components/pages/AssessmentResults.jsx`)

**Captures Column:**
- Shows capture count for each candidate
- "View (X)" button to open captures modal
- Modal displays all captured images in a grid layout

**Captures Modal Features:**
- Grid layout showing all captured images
- Image thumbnails (250px width, 200px height)
- Fallback error handling for missing images
- Timestamp labels for each capture

## Routes and URLs

### Candidate Routes
- `/candidate/status` - View assessment status and start assessments
- `/candidate/start-tech-assessment` - Start assessment with camera capture
- Assessment automatically captures images every 5 minutes

### Employer Routes  
- `/employer/assessment-results/:assessmentId` - View assessment results with captures
- Click "View (X)" in Captures column to see captured images

## File Storage

### Directory Structure
```
backend/uploads/
├── capture_1234567890.jpg
├── capture_1234567891.jpg
└── ...
```

### Image Specifications
- **Format**: JPEG
- **Quality**: 80%
- **Max Size**: 10MB per image
- **Dimensions**: 640x480 (ideal, may vary based on device)
- **Naming**: `capture_${timestamp}.jpg`

## Security Features

### Authentication
- Candidate must be authenticated with valid JWT token
- Attempt ID validation ensures candidate can only upload to their own assessment
- Employer authentication required to view captures

### File Validation
- Only JPEG images accepted
- File size limits enforced
- Maximum 5 captures per assessment attempt
- Unique filenames prevent conflicts

### Privacy
- Images only accessible to the employer who created the assessment
- Secure file paths prevent direct access
- Images deleted when assessment attempt is removed

## Error Handling

### Camera Access Issues
- Permission denied: Clear error message to candidate
- No camera found: Graceful fallback
- Camera busy: Retry mechanism

### Upload Failures
- Network issues: Retry with exponential backoff
- Server errors: Log and continue assessment
- File size exceeded: Compress and retry

### Display Issues
- Missing images: Show placeholder with error message
- Broken image URLs: Fallback to "Image not found" display

## Testing

### Test File
- `test-camera-capture.html` - Standalone test page for camera functionality
- Tests camera access, image capture, and auto-capture timing
- Simulates the assessment environment

### Manual Testing Steps
1. Open assessment as candidate
2. Grant camera permissions
3. Verify camera starts automatically
4. Wait for automatic captures (or use test button)
5. Complete assessment
6. Login as employer
7. View assessment results
8. Click "View" in Captures column
9. Verify all images display correctly

## Browser Compatibility

### Supported Browsers
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 12+

### Required Features
- `navigator.mediaDevices.getUserMedia()`
- Canvas API
- Blob API
- FormData API

### Fallback Behavior
- If camera not available: Assessment continues without captures
- If upload fails: Assessment continues, captures stored locally until retry
- If browser unsupported: Warning message, assessment proceeds normally

## Performance Considerations

### Image Optimization
- JPEG compression at 80% quality
- Canvas resizing to standard dimensions
- Blob creation with optimal settings

### Network Efficiency
- Images uploaded immediately after capture
- Retry mechanism for failed uploads
- Progress indication for large uploads

### Memory Management
- Canvas cleared after each capture
- Video stream properly disposed on component unmount
- Blob URLs revoked after use

## Configuration Options

### Capture Timing
- **Current**: 30 seconds initial delay, then every 5 minutes
- **Configurable**: Can be adjusted in `startPeriodicCapture()` function

### Image Quality
- **Current**: 80% JPEG quality
- **Configurable**: Adjust in `canvas.toBlob()` call

### Maximum Captures
- **Current**: 5 captures per assessment
- **Configurable**: Adjust in backend validation

## Troubleshooting

### Common Issues

1. **Camera not starting**
   - Check browser permissions
   - Ensure HTTPS connection (required for camera access)
   - Verify camera not in use by other applications

2. **Images not uploading**
   - Check network connectivity
   - Verify backend server running
   - Check file size limits

3. **Images not displaying in employer view**
   - Verify file paths in database
   - Check file permissions in uploads directory
   - Ensure images exist on server

### Debug Information
- Console logs show capture attempts and results
- Network tab shows upload requests and responses
- Backend logs show file storage operations

## Future Enhancements

### Potential Improvements
1. **Real-time monitoring**: Live camera feed for employers
2. **Face detection**: Verify candidate presence
3. **Motion detection**: Alert on suspicious activity
4. **Cloud storage**: Store images in AWS S3 or similar
5. **Image analysis**: AI-powered proctoring features
6. **Bandwidth optimization**: Adaptive quality based on connection
7. **Mobile optimization**: Better mobile camera handling

### Scalability Considerations
- Image compression for storage efficiency
- CDN integration for faster image delivery
- Database optimization for large numbers of captures
- Automated cleanup of old assessment images