# Interview Schedule Time Display Fix

## Problem
The interview schedule time was showing differently for candidates compared to what the employer set. This was due to timezone handling issues where times were stored and displayed without proper timezone conversion.

## Root Cause
1. **Backend**: Interview times were stored as simple time strings (e.g., "14:00") without timezone information
2. **Frontend**: Times were displayed directly without converting to the candidate's local timezone
3. **No timezone context**: The system wasn't tracking or converting between timezones

## Solution Implemented

### 1. Backend Changes (`backend/controllers/interviewController.js`)
- Updated `scheduleInterviewStage` function to combine date and time into a full datetime object
- This ensures proper timezone handling when storing interview schedules
- The datetime is stored in UTC and can be converted to any timezone when displayed

### 2. Frontend Utility (`frontend/src/utils/timeUtils.js`)
Created comprehensive timezone utility functions:
- `formatTimeToLocal()`: Converts time string to candidate's local timezone
- `formatDateTimeToLocal()`: Formats full datetime with timezone conversion
- `getTimezoneOffset()`: Gets current timezone offset (e.g., "GMT+5:30")
- `formatInterviewTime()`: Formats interview time with timezone information displayed

### 3. Frontend Components Updated

#### a. Popup Component (`frontend/src/app/common/popups/popup-interview-round-details.jsx`)
- Updated `formatTime` function to properly handle timezone conversion
- Now creates a proper Date object and converts to local time

#### b. Application Status Component (`frontend/src/app/pannels/candidate/components/application-status.jsx`)
- Imported `formatInterviewTime` utility
- Updated interview time display to show time in candidate's local timezone with timezone indicator
- Example output: "02:00 PM (GMT+5:30)" instead of just "14:00"

## How It Works

### Before Fix:
```
Employer sets: 14:00 (their timezone)
Candidate sees: 14:00 (displayed as-is, wrong timezone)
```

### After Fix:
```
Employer sets: 14:00 (stored as full datetime in UTC)
Candidate sees: 02:00 PM (GMT+5:30) (converted to their local timezone)
```

## Benefits
1. **Accurate Time Display**: Candidates see interview times in their local timezone
2. **Timezone Awareness**: Times are displayed with timezone information (e.g., GMT+5:30)
3. **No Confusion**: Clear indication of what time zone the interview is scheduled in
4. **Automatic Conversion**: Browser automatically handles timezone conversion based on candidate's location

## Testing Recommendations
1. Test with employer and candidate in different timezones
2. Verify time displays correctly in Interview Process Details modal
3. Check that timezone offset is shown correctly (e.g., GMT+5:30, GMT-8:00)
4. Ensure times are consistent across all interview-related displays

## Files Modified
1. `backend/controllers/interviewController.js` - Backend datetime handling
2. `frontend/src/utils/timeUtils.js` - New utility file for timezone functions
3. `frontend/src/app/common/popups/popup-interview-round-details.jsx` - Popup time display
4. `frontend/src/app/pannels/candidate/components/application-status.jsx` - Main status page time display

## Note
The fix ensures that all interview times are properly converted to the candidate's local timezone while maintaining the original scheduled time in the database. This provides a seamless experience for both employers and candidates regardless of their geographic locations.
