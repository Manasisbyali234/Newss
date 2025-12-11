# Interview Process Status & Remarks Storage

## Overview
The interview process status and remarks are stored in the backend database when employers review candidates on the `localhost:3000/employer/emp-candidate-review/` page.

## Backend Storage Structure

### Database Model: Application
The interview process data is stored in the `Application` model with the following fields:

```javascript
// Interview processes and remarks
interviewProcesses: [{
  id: { type: String },           // Process ID (e.g., "technical-1", "hr-1")
  name: { type: String },         // Process name (e.g., "Technical Round")
  type: { type: String },         // Process type (e.g., "technical", "hr")
  status: { type: String },       // Current status (e.g., "completed", "pending")
  isCompleted: { type: Boolean }, // Whether process is completed
  result: { type: String }        // Result (e.g., "pass", "fail")
}],
processRemarks: { type: Map, of: String }, // Map of process ID to remarks
employerRemarks: { type: String },         // Overall employer remarks
reviewedAt: { type: Date }                 // When the review was saved
```

## API Endpoints

### 1. Save Interview Review
**Endpoint:** `PUT /api/employer/applications/:applicationId/review`

**Request Body:**
```json
{
  "interviewProcesses": [
    {
      "id": "technical-1",
      "name": "Technical Round",
      "type": "technical",
      "status": "completed",
      "isCompleted": true,
      "result": "pass"
    }
  ],
  "processRemarks": {
    "technical-1": "Excellent problem-solving skills"
  },
  "remarks": "Overall good candidate"
}
```

### 2. Get Interview Process Status
**Endpoint:** `GET /api/employer/applications/:applicationId/interview-status`

**Response:**
```json
{
  "success": true,
  "data": {
    "interviewProcesses": [...],
    "processRemarks": {...},
    "employerRemarks": "Overall remarks",
    "reviewedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## How It Works

1. **Frontend Interaction:**
   - Employer visits `localhost:3000/employer/emp-candidate-review/:applicationId`
   - Reviews candidate and fills in interview process status and remarks
   - Clicks "Save" button

2. **Backend Processing:**
   - Frontend sends PUT request to `/api/employer/applications/:applicationId/review`
   - Backend validates the data and stores it in the Application document
   - Interview processes are stored as an array of objects
   - Process-specific remarks are stored as a Map (key-value pairs)
   - Overall employer remarks are stored as a string

3. **Data Persistence:**
   - All data is immediately saved to MongoDB
   - Data persists across sessions and can be retrieved later
   - Each save operation updates the `reviewedAt` timestamp

## Testing

### Test Page
Access the test page at: `http://localhost:5000/test-interview-status`

This page allows you to:
- Enter an Application ID and Employer Token
- Fetch stored interview process data
- View sample data structure

### Manual Testing Steps
1. Go to the employer candidate review page
2. Fill in interview process status and remarks
3. Save the review
4. Use the test page to verify data was stored
5. Check the API endpoint directly with tools like Postman

## Data Flow

```
Employer Review Page → Frontend JavaScript → API Call → Backend Controller → Database Storage
                                                                                      ↓
Test Page ← API Response ← Backend Controller ← Database Retrieval ← API Call ← Test Interface
```

## Key Features

- **Real-time Storage:** Data is saved immediately when employer clicks save
- **Structured Data:** Interview processes are stored with complete metadata
- **Process-specific Remarks:** Each interview process can have its own remarks
- **Overall Remarks:** General employer feedback is stored separately
- **Audit Trail:** `reviewedAt` timestamp tracks when reviews were last updated
- **Data Integrity:** Backend validation ensures data consistency

## Example Usage

```javascript
// Frontend code to save interview review
const saveReview = async () => {
  const response = await fetch(`/api/employer/applications/${applicationId}/review`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      interviewProcesses: processesData,
      processRemarks: remarksData,
      remarks: overallRemarks
    })
  });
};

// Backend code to retrieve stored data
const getInterviewStatus = async (applicationId) => {
  const application = await Application.findById(applicationId)
    .select('interviewProcesses processRemarks employerRemarks reviewedAt');
  return application;
};
```

This system ensures that all interview process status and remarks entered by employers are properly stored in the backend and can be retrieved for reporting, analytics, or candidate communication purposes.