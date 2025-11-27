# Education Save Test

## Issue
New education level data is not storing in the DB

## Current Flow
1. Frontend: User selects education level from dropdown (e.g., "B.Tech (AI / Data Science / ML / Cybersecurity)")
2. Frontend: User fills in form fields
3. Frontend: Clicks "Save Details" → adds to `educationEntries` array
4. Frontend: Clicks "Save All Education Details" → calls `handleSaveAll()`
5. Frontend: Maps data to backend format in `handleSaveAll()`:
   ```javascript
   const educationArray = educationEntries.map(entry => ({
       degreeName: entry.schoolCollegeName,
       collegeName: entry.boardUniversityName,
       passYear: entry.yearOfPassing,
       registrationNumber: entry.registrationNumber,
       state: entry.state,
       specialization: entry.courseName || entry.specialization,
       percentage: entry.percentage,
       cgpa: entry.cgpa,
       grade: entry.result,
       marksheet: entry.documentBase64
   }));
   ```
6. Backend: Receives data and normalizes field names (lines 176-195 in candidateController.js)
7. Backend: Saves to database

## Potential Issues
- The mapping looks correct
- The backend normalization looks correct
- Database schema supports all fields

## Solution
The code appears to be correct. The issue might be:
1. User not clicking "Save All Education Details" button after adding entries
2. API call failing silently
3. Validation errors not being displayed

## Recommendation
Add console.log statements to track the data flow and ensure the API call is successful.
