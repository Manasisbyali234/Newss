# Assessment Submission Troubleshooting Guide

## Issue: Failed to submit assessment on http://localhost:3000/candidate/status

### Root Cause Analysis
The assessment submission failure can occur due to several reasons:

1. **Backend API Issues**
2. **Frontend Error Handling**
3. **Database Connection Problems**
4. **Authentication Issues**
5. **Network Connectivity**

### Fixes Applied

#### 1. Backend Controller Improvements (`assessmentController.js`)

**Enhanced Error Handling:**
- Added comprehensive input validation
- Improved error messages with specific details
- Added logging for debugging
- Fixed scoring logic for different question types
- Added proper status checks

**Key Changes:**
- `submitAssessment`: Enhanced validation, better error handling, improved scoring logic
- `submitAnswer`: Added proper validation and error responses
- `startAssessment`: Added input validation and better error handling
- `recordViolation`: Improved validation and error handling

#### 2. Frontend Component Improvements (`AssessmentQuiz.jsx`)

**Enhanced Error Handling:**
- Added timeout handling for API requests
- Improved error messages for users
- Added validation before API calls
- Better handling of network errors

**Key Changes:**
- `handleSubmit`: Added comprehensive error handling and user feedback
- `handleNext`: Enhanced validation and error handling

#### 3. Debug Middleware Added (`candidate.js`)

Added logging middleware to track assessment API requests for easier debugging.

### Testing Steps

1. **Check Server Status:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Run Test Script:**
   ```bash
   node test-assessment-submission.js
   ```

3. **Check Server Logs:**
   Look for assessment-related logs in the backend console.

4. **Browser Console:**
   Check for JavaScript errors in the browser's developer console.

### Common Issues and Solutions

#### Issue 1: "Assessment attempt not found"
**Solution:** Ensure the assessment was properly started and the attemptId is valid.

#### Issue 2: "Authentication token not found"
**Solution:** Check if the user is properly logged in and the token is stored in localStorage.

#### Issue 3: "Failed to save answer"
**Solution:** Check network connectivity and server status.

#### Issue 4: Database connection issues
**Solution:** Verify MongoDB is running and connection string is correct.

### Verification Steps

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test the assessment flow:**
   - Login as a candidate
   - Navigate to available assessments
   - Start an assessment
   - Answer questions
   - Submit the assessment

### Monitoring

The enhanced logging will show:
- API request details
- Authentication status
- Request body content
- Error details
- Success/failure status

### Additional Debugging

If issues persist, check:

1. **Network Tab in Browser DevTools:**
   - Look for failed API requests
   - Check response status codes
   - Verify request payloads

2. **Backend Console Logs:**
   - Assessment API request logs
   - Database operation logs
   - Error stack traces

3. **Database State:**
   - Check AssessmentAttempt collection
   - Verify Application status updates
   - Check Assessment data integrity

### Emergency Fixes

If the issue persists, try these emergency fixes:

1. **Clear Browser Storage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Restart Services:**
   - Restart backend server
   - Restart frontend development server
   - Restart MongoDB service

3. **Check Environment Variables:**
   - Verify `.env` file in backend
   - Check database connection string
   - Verify JWT secret

### Contact Information

For further assistance, check:
- Server logs in backend console
- Browser console errors
- Network requests in DevTools
- Database connection status