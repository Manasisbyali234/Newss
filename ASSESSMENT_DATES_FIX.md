# Assessment Dates Display Fix

## Problem
The candidate status page at `http://localhost:3000/candidate/status` was displaying default/placeholder data instead of actual assessment dates from the database.

## Root Cause
The issue was caused by two problems:

1. **Backend Population Issue**: When fetching applications with interviews, the Job model was being populated without explicitly selecting the assessment date fields (`assessmentStartDate` and `assessmentEndDate`).

2. **Date Conversion Issue**: When creating or updating jobs, assessment dates were not being properly converted from strings to Date objects before saving to the database.

## Fixes Applied

### 1. Fixed Backend Controller (`candidateController.js`)
**File**: `backend/controllers/candidateController.js`
**Function**: `getCandidateApplicationsWithInterviews`

**Change**: Added explicit field selection when populating the Job model to ensure assessment dates are included:

```javascript
.populate({ 
  path: 'jobId',
  select: 'title location jobType status interviewRoundsCount interviewRoundTypes interviewRoundDetails interviewRoundOrder assessmentId assessmentStartDate assessmentEndDate assessmentInstructions assessmentPassingPercentage',
  options: { lean: false } 
})
```

### 2. Fixed Job Creation (`employerController.js`)
**File**: `backend/controllers/employerController.js`
**Function**: `createJob`

**Change**: Added proper date conversion for assessment dates:

```javascript
// Handle nested assessment object from frontend
if (jobData.assessment && jobData.assessment.assessmentId) {
  jobData.assessmentId = jobData.assessment.assessmentId;
  if (jobData.assessment.fromDate) {
    jobData.assessmentStartDate = new Date(jobData.assessment.fromDate);
  }
  if (jobData.assessment.toDate) {
    jobData.assessmentEndDate = new Date(jobData.assessment.toDate);
  }
  delete jobData.assessment;
}

// Also handle direct assessment date fields
if (jobData.assessmentStartDate && typeof jobData.assessmentStartDate === 'string') {
  jobData.assessmentStartDate = new Date(jobData.assessmentStartDate);
}
if (jobData.assessmentEndDate && typeof jobData.assessmentEndDate === 'string') {
  jobData.assessmentEndDate = new Date(jobData.assessmentEndDate);
}
```

### 3. Fixed Job Update (`employerController.js`)
**File**: `backend/controllers/employerController.js`
**Function**: `updateJob`

**Change**: Applied the same date conversion logic as in job creation.

## Testing

### Run Diagnostic Script
To verify that jobs in the database have assessment dates properly set:

```bash
cd backend
node check-assessment-dates.js
```

This script will:
- Connect to MongoDB
- Find all jobs with assessments
- Display their assessment dates
- Warn if any jobs are missing dates

### Manual Testing Steps

1. **Restart the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Clear browser cache** or open in incognito mode

3. **Navigate to candidate status page**:
   ```
   http://localhost:3000/candidate/status
   ```

4. **Verify**:
   - Assessment dates should now display actual dates from the database
   - Dates should be in the format: "DD MMM YYYY - DD MMM YYYY"
   - If no dates are set, it should show "Dates TBD"

## Expected Behavior After Fix

### Before Fix
- Assessment dates showed as "Dates TBD" even when dates were set in the database
- Or showed placeholder/default dates

### After Fix
- Assessment dates display correctly from the database
- Format: "01 Jan 2024 - 31 Jan 2024"
- If dates are not set, shows "Dates TBD"

## Files Modified

1. `backend/controllers/candidateController.js` - Fixed job population
2. `backend/controllers/employerController.js` - Fixed date conversion in createJob and updateJob
3. `backend/check-assessment-dates.js` - New diagnostic script (created)

## Additional Notes

- The frontend code in `application-status.jsx` was already correctly handling the dates
- The issue was purely on the backend side with data retrieval and storage
- No database migration is needed
- Existing jobs with assessments may need to be re-saved by employers to have dates properly stored

## Verification Checklist

- [x] Backend explicitly selects assessment date fields when populating jobs
- [x] Job creation converts assessment dates to Date objects
- [x] Job update converts assessment dates to Date objects
- [x] Diagnostic script created to verify database state
- [ ] Backend server restarted
- [ ] Browser cache cleared
- [ ] Candidate status page tested
- [ ] Assessment dates display correctly
