# Candidate Status Page Fix

## Problem
The candidate status page at `/candidate/status` was showing:
- "Position Not Available" instead of actual job titles
- Default interview rounds (Technical, HR, Final) instead of actual rounds from backend
- "Dates TBD" for all rounds even when dates were set

## Root Cause
The Job model had a fixed schema for `interviewRoundTypes` and `interviewRoundDetails` that only supported static keys (technical, hr, final, etc.). However, the new system uses dynamic unique keys like `technical_1764388004810` to support multiple rounds of the same type.

## Changes Made

### 1. Backend Model Update (`backend/models/Job.js`)

**Changed `interviewRoundTypes` from fixed schema to Mixed type:**
```javascript
// Before:
interviewRoundTypes: {
  technical: { type: Boolean, default: false },
  managerial: { type: Boolean, default: false },
  nonTechnical: { type: Boolean, default: false },
  final: { type: Boolean, default: false },
  hr: { type: Boolean, default: false }
}

// After:
interviewRoundTypes: {
  type: mongoose.Schema.Types.Mixed,
  default: {
    technical: false,
    managerial: false,
    nonTechnical: false,
    final: false,
    hr: false
  }
}
```

**Changed `interviewRoundDetails` from fixed schema to Mixed type:**
```javascript
// Before: Fixed schema with technical, hr, final, etc. keys

// After:
interviewRoundDetails: {
  type: mongoose.Schema.Types.Mixed,
  default: {}
}
```

### 2. Backend Controller Update (`backend/controllers/candidateController.js`)

**Fixed `getCandidateApplicationsWithInterviews` function:**
- Changed from extracting round type by splitting unique key
- Now properly uses `interviewRoundTypes[uniqueKey]` to get the round type
- Normalizes data to support both unique keys and round type keys

```javascript
// Now correctly maps: technical_1764388004810 -> 'technical' -> round details
app.jobId.interviewRoundOrder.forEach(uniqueKey => {
  const roundType = app.jobId.interviewRoundTypes[uniqueKey];
  if (roundType && app.jobId.interviewRoundDetails[roundType]) {
    const details = app.jobId.interviewRoundDetails[roundType];
    normalizedDetails[uniqueKey] = details;
    normalizedDetails[roundType] = details;
  }
});
```

## How It Works Now

1. **Job Creation**: Employer creates a job with interview rounds
   - Each round gets a unique key: `technical_1764388004810`
   - `interviewRoundTypes` maps: `{ 'technical_1764388004810': 'technical' }`
   - `interviewRoundDetails` stores: `{ 'technical': { description, fromDate, toDate, time } }`
   - `interviewRoundOrder` maintains order: `['technical_1764388004810', 'hr_1764388004820']`

2. **Candidate Views Status**: 
   - Backend fetches applications with populated job data
   - Normalizes the data to map unique keys to their details
   - Frontend receives both unique key and round type mappings
   - Displays actual job title, company name, and interview rounds with dates

## Testing Steps

1. Restart the backend server
2. Navigate to `http://localhost:3000/candidate/status`
3. Verify:
   - Job titles are displayed correctly (not "Position Not Available")
   - Company names are shown
   - Interview rounds match what employer configured
   - Dates are displayed correctly (not "Dates TBD")

## Files Modified

1. `backend/models/Job.js` - Updated schema to support dynamic keys
2. `backend/controllers/candidateController.js` - Fixed data normalization logic

## Next Steps

After restarting the backend server, the candidate status page should display:
- Correct job positions
- Actual interview rounds configured by employer
- Proper dates for each round
- Assessment information if assigned
