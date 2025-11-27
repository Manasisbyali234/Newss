# Interview Invitation Flow - Complete Guide

## What Happens When Employer Clicks "Send Invite"

### 1. Email Sent to Candidate

The candidate receives an email with the following information:

**Subject:** Interview Invitation - [Job Title]

**Email Content:**
```
Interview Invitation

Dear [Candidate Name],

We would like to invite you for an interview for the position of [Job Title].

Preferred Date: [Selected Date]
Preferred Time: [Selected Time]
Meeting Link: [If provided - Google Meet/Zoom link]
Instructions: [Any additional instructions]

Please log in to your dashboard to confirm your availability or suggest alternative time slots.

[Respond to Invitation Button] ← Links to candidate dashboard

Best regards,
[Company Name]
```

### 2. Candidate Response Options

#### Option A: Accept Proposed Time
- Candidate logs into their dashboard
- Goes to "Application Status" page
- Sees the interview invitation
- Clicks "Respond to Invitation" button
- Confirms the proposed date and time
- Optionally adds a message

#### Option B: Suggest Alternative Time
- Candidate logs into their dashboard
- Goes to "Application Status" page
- Clicks "Respond to Invitation" button
- Enters their available date and time
- Adds a message explaining why they need different timing
- Submits response

### 3. Response Form Fields

When candidate clicks "Respond to Invitation", they see a modal with:

1. **Your Available Date** (Required)
   - Date picker
   - Minimum date: Today
   
2. **Your Available Time** (Required)
   - Time picker
   
3. **Additional Message** (Optional)
   - Text area for any additional information
   - Can mention alternative time slots
   - Can ask questions about the interview

### 4. What Employer Sees

After candidate responds, the employer sees:

**In the Interview Process Manager:**
```
✓ Candidate Has Responded!

Available Date: [Candidate's chosen date]
Available Time: [Candidate's chosen time]
Message: [Candidate's message if provided]
Responded on: [Timestamp]

[Confirm This Schedule Button]
```

**Employer also receives an email:**
```
Subject: Interview Response - [Job Title]

Dear [Company Name],

The candidate [Candidate Name] has responded to your interview invitation 
for the position of [Job Title].

Candidate's Available Date: [Date]
Candidate's Available Time: [Time]
Message: [If provided]

Please log in to your dashboard to confirm the interview schedule.

Best regards,
Job Portal Team
```

### 5. Confirmation Flow

1. Employer reviews candidate's response
2. Clicks "Confirm This Schedule" button
3. System sends confirmation email to candidate:
   ```
   Subject: Interview Confirmed - [Job Title]
   
   Dear [Candidate Name],
   
   Your interview for the position of [Job Title] has been confirmed.
   
   Date: [Confirmed Date]
   Time: [Confirmed Time]
   
   We look forward to meeting you!
   
   Best regards,
   [Company Name]
   ```

## Technical Implementation

### Frontend Components
- `InterviewResponseModal.jsx` - Candidate response form
- `InterviewProcessManager.jsx` - Employer view with response display
- `application-status.jsx` - Candidate dashboard integration

### Backend APIs

#### Candidate Endpoints
- `POST /api/candidate/respond-interview/:applicationId`
  - Body: `{ availableDate, availableTime, message }`
  - Saves response to Application model
  - Sends email to employer

#### Employer Endpoints
- `POST /api/employer/send-interview-invite/:applicationId`
  - Body: `{ interviewDate, interviewTime, meetingLink, instructions }`
  - Sends email to candidate with response link
  
- `GET /api/employer/interview-responses/:applicationId`
  - Returns candidate's response if available
  
- `POST /api/employer/confirm-interview/:applicationId`
  - Body: `{ confirmedDate, confirmedTime }`
  - Sends confirmation email to candidate

### Database Schema

**Application Model - New Fields:**
```javascript
candidateResponse: {
  availableDate: String,
  availableTime: String,
  message: String,
  respondedAt: Date
},
interviewInvite: {
  sentAt: Date,
  proposedDate: String,
  proposedTime: String,
  meetingLink: String,
  instructions: String,
  status: String, // 'pending', 'responded', 'confirmed'
  confirmedDate: String,
  confirmedTime: String,
  confirmedAt: Date
}
```

## Benefits of This System

1. **Centralized Communication** - All interview scheduling happens within the platform
2. **Email Notifications** - Both parties receive email updates
3. **Flexibility** - Candidates can suggest alternative times
4. **Tracking** - Complete history of interview scheduling
5. **Professional** - Structured and organized process
6. **Time-Saving** - No back-and-forth emails needed

## Usage Instructions

### For Candidates:
1. Check your email for interview invitation
2. Click the "Respond to Invitation" button in email
3. Or log in to dashboard → Application Status
4. Find the application with interview invite
5. Click "Respond" button
6. Fill in your available date/time
7. Submit response
8. Wait for employer confirmation

### For Employers:
1. Go to candidate review page
2. Click "Send Invite" button
3. Fill in preferred date, time, and details
4. Send invitation
5. Wait for candidate response (you'll get email notification)
6. Review candidate's available time
7. Click "Confirm This Schedule"
8. Interview is confirmed!
