# Image Upload Feature for Assessment Questions

## Overview
Added functionality to upload images to assessment questions. Employers can now attach images to questions when creating or editing assessments.

## Changes Made

### Backend Changes

1. **Assessment Model** (`backend/models/Assessment.js`)
   - Added `imageUrl` field to questions schema to store image paths

2. **Assessment Controller** (`backend/controllers/assessmentController.js`)
   - Added `uploadQuestionImage` function to handle image uploads
   - Updated `createAssessment` and `updateAssessment` to save imageUrl

3. **Upload Middleware** (`backend/middlewares/upload.js`)
   - Added disk storage configuration for question images
   - Created `uploadQuestionImage` multer configuration
   - Supports JPG, PNG, GIF, WEBP formats (max 5MB)

4. **Routes** (`backend/routes/employer.js`)
   - Added POST `/api/employer/assessments/upload-question-image` endpoint

5. **Server** (`backend/server.js`)
   - Added static file serving for `/uploads` directory

### Frontend Changes

1. **CreateassessmentModal Component** (`frontend/src/app/pannels/employer/components/assessments/CreateassessmentModal.jsx`)
   - Added `imageUrl` to question state
   - Added `handleImageUpload` function to upload images
   - Added file input field for each question
   - Added image preview with remove button

## How to Use

1. **Create/Edit Assessment**
   - Open the Create Assessment modal
   - For any question, you'll see a "Question Image (Optional)" field
   - Click "Choose File" and select an image (JPG, PNG, GIF, or WEBP)
   - The image will be uploaded immediately and a preview will appear
   - Click "Remove" to delete the uploaded image

2. **Image Requirements**
   - Supported formats: JPG, JPEG, PNG, GIF, WEBP
   - Maximum size: 5MB
   - Images are stored in `backend/uploads/` directory

## API Endpoint

**Upload Question Image**
- **URL**: `POST /api/employer/assessments/upload-question-image`
- **Auth**: Required (Employer token)
- **Body**: FormData with `image` field
- **Response**: `{ success: true, imageUrl: "/uploads/question-xxxxx.jpg" }`

## Notes

- Images are stored on disk in the `backend/uploads/` directory
- Image URLs are relative paths (e.g., `/uploads/question-123456.jpg`)
- Images are displayed in the frontend using `http://localhost:5000${imageUrl}`
- The feature is optional - questions can be created without images
