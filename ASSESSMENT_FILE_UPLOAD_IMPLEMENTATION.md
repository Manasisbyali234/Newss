# Assessment Answer File Upload - Implementation Complete

## ✅ Feature: Save Uploaded Answer Files to Backend

Candidates can now upload files as answers to assessment questions (Upload File and Upload Image types), and these files are saved to the backend disk storage.

## Implementation Details

### 1. Upload Middleware (`backend/middlewares/upload.js`)

**New Configuration Added:**
```javascript
const answerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // backend/uploads/
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'answer-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadAnswerFile = multer({
  storage: answerStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and image files are allowed'), false);
    }
  },
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
```

**Storage Details:**
- Location: `backend/uploads/`
- Filename format: `answer-{timestamp}-{random}.{ext}`
- Example: `answer-1734567890123-987654321.pdf`

### 2. API Route (`backend/routes/candidate.js`)

**Updated Route:**
```javascript
router.post('/assessments/upload-answer', 
  uploadAnswerFile.single('answerFile'), 
  assessmentController.uploadFileAnswer
);
```

**Endpoint:** `POST /api/candidate/assessments/upload-answer`
**Auth:** Required (Candidate token)
**Content-Type:** `multipart/form-data`

**Request Body:**
- `answerFile` (file): The uploaded file
- `attemptId` (string): Assessment attempt ID
- `questionIndex` (number): Question index
- `timeSpent` (number): Time spent on question (optional)

**Response:**
```json
{
  "success": true,
  "uploadedFile": {
    "filename": "answer-1734567890123-987654321.pdf",
    "originalName": "my-answer.pdf",
    "mimetype": "application/pdf",
    "size": 245678,
    "path": "/uploads/answer-1734567890123-987654321.pdf",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Controller (`backend/controllers/assessmentController.js`)

**Updated uploadFileAnswer Method:**
```javascript
exports.uploadFileAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, timeSpent } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment not in progress' });
    }
    
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment || !assessment.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const question = assessment.questions[questionIndex];
    
    if (question.type !== 'upload' && question.type !== 'image') {
      return res.status(400).json({ success: false, message: 'Question is not an upload type' });
    }
    
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === parseInt(questionIndex));
    const answerData = {
      questionIndex: parseInt(questionIndex),
      selectedAnswer: null,
      textAnswer: null,
      uploadedFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        uploadedAt: new Date()
      },
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = Math.max(attempt.currentQuestion || 0, parseInt(questionIndex) + 1);
    attempt.markModified('answers');
    await attempt.save();
    
    res.json({ success: true, uploadedFile: answerData.uploadedFile });
  } catch (error) {
    console.error('Upload file answer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### 4. Database Model (`backend/models/AssessmentAttempt.js`)

**Updated Schema:**
```javascript
answers: [{
  questionIndex: { type: Number, required: true },
  selectedAnswer: { type: Number },
  textAnswer: { type: String },
  uploadedFile: {
    filename: { type: String },
    originalName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    path: { type: String },  // ✅ NEW: File URL path
    uploadedAt: { type: Date }
  },
  timeSpent: { type: Number },
  answeredAt: { type: Date }
}]
```

## File Specifications

**Allowed File Types:**
- **Documents:** PDF, DOC, DOCX
- **Images:** JPG, JPEG, PNG, GIF, WEBP

**File Size Limits:**
- Upload File questions: 10MB max
- Upload Image questions: 10MB max

**Storage:**
- Files saved to: `backend/uploads/`
- Filename format: `answer-{timestamp}-{random}.{ext}`
- Access URL: `http://localhost:5000/uploads/answer-xxx.pdf`

## How It Works

1. **Candidate takes assessment** → Encounters Upload File or Upload Image question
2. **Selects file** → File sent to backend via FormData
3. **Backend validates** → Checks file type, size, and question type
4. **File saved to disk** → Stored in `backend/uploads/` with unique name
5. **Database updated** → File metadata and path saved in AssessmentAttempt
6. **Response sent** → Returns file details to frontend
7. **Assessment submitted** → File reference stored with answer

## Frontend Integration

**Example Upload Code:**
```javascript
const uploadAnswerFile = async (attemptId, questionIndex, file) => {
  const formData = new FormData();
  formData.append('answerFile', file);
  formData.append('attemptId', attemptId);
  formData.append('questionIndex', questionIndex);
  
  const response = await fetch('http://localhost:5000/api/candidate/assessments/upload-answer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${candidateToken}`
    },
    body: formData
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('File uploaded:', data.uploadedFile.path);
  }
};
```

## Accessing Uploaded Files

**View File:**
```
http://localhost:5000/uploads/answer-1734567890123-987654321.pdf
```

**Download File:**
```javascript
const downloadFile = (filePath) => {
  window.open(`http://localhost:5000${filePath}`, '_blank');
};
```

## Security Features

✅ File type validation (whitelist)
✅ File size limits (10MB)
✅ Unique filenames (prevents overwrites)
✅ Authentication required
✅ Candidate ownership verification
✅ Assessment status validation

## Testing

1. Start backend: `cd backend && npm start`
2. Navigate to assessment page
3. Start an assessment with Upload File or Upload Image questions
4. Upload a file (PDF, DOC, or image)
5. Check `backend/uploads/` folder for saved file
6. Verify file metadata in database
7. Submit assessment
8. Employer can view uploaded files in assessment results

## Notes

- Files are permanently stored on disk
- No automatic cleanup (implement if needed)
- Files accessible via static file serving
- Path stored in database for easy retrieval
- Supports re-uploading (replaces previous file in database, but old file remains on disk)

## Status: ✅ COMPLETE

All assessment answer file uploads now save to backend disk storage with proper validation and metadata tracking.
