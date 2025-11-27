# Employer Interview Process Management View

## What Employer Sees at: http://localhost:3000/employer/emp-candidate-review/[applicationId]

### Interview Process Management Section

The Interview Process Management section now displays three distinct states:

---

## 1. After Sending Interview Invitation

```
┌─────────────────────────────────────────────────────────────┐
│ 📧 Interview Invitation Sent                                │
├─────────────────────────────────────────────────────────────┤
│ Proposed Date: Monday, January 15, 2025                     │
│ Proposed Time: 10:00 AM                                     │
│ Meeting Link: https://meet.google.com/abc-defg             │
│ Instructions: Please ensure stable internet connection      │
│ Sent on: 1/10/2025, 2:30:45 PM                            │
└─────────────────────────────────────────────────────────────┘
```

**Visual Style:**
- Orange/amber background (#fff3e0)
- Orange border (#ff6600)
- Paper plane icon
- Shows all details that were sent to candidate

---

## 2. After Candidate Responds

```
┌─────────────────────────────────────────────────────────────┐
│ 📧 Interview Invitation Sent                                │
├─────────────────────────────────────────────────────────────┤
│ Proposed Date: Monday, January 15, 2025                     │
│ Proposed Time: 10:00 AM                                     │
│ Meeting Link: https://meet.google.com/abc-defg             │
│ Instructions: Please ensure stable internet connection      │
│ Sent on: 1/10/2025, 2:30:45 PM                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✓ Candidate Has Responded!                                  │
├─────────────────────────────────────────────────────────────┤
│ Available Date: Tuesday, January 16, 2025                   │
│ Available Time: 2:00 PM                                     │
│                                                              │
│ Message:                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ I'm available on Tuesday afternoon. The proposed time   │ │
│ │ on Monday doesn't work for me due to a prior           │ │
│ │ commitment. I can also do Wednesday morning if needed.  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Responded on: 1/10/2025, 4:15:30 PM                        │
│                                                              │
│ [ ✓ Confirm This Schedule ]                                 │
└─────────────────────────────────────────────────────────────┘
```

**Visual Style:**
- Green background (#d4edda)
- Green border (#28a745)
- Check circle icon
- Candidate's message in white box
- Green "Confirm" button

---

## 3. After Confirming Schedule

```
┌─────────────────────────────────────────────────────────────┐
│ 📧 Interview Invitation Sent                                │
├─────────────────────────────────────────────────────────────┤
│ Proposed Date: Monday, January 15, 2025                     │
│ Proposed Time: 10:00 AM                                     │
│ Meeting Link: https://meet.google.com/abc-defg             │
│ Instructions: Please ensure stable internet connection      │
│ Sent on: 1/10/2025, 2:30:45 PM                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✓ Interview Confirmed                                       │
├─────────────────────────────────────────────────────────────┤
│ Confirmed Date: Tuesday, January 16, 2025                   │
│ Confirmed Time: 2:00 PM                                     │
│ Confirmed on: 1/10/2025, 4:45:20 PM                        │
└─────────────────────────────────────────────────────────────┘
```

**Visual Style:**
- Blue background (#cfe2ff)
- Blue border (#0d6efd)
- Calendar check icon
- Shows final confirmed schedule

---

## Security Features

### 1. Authentication
- Only authenticated employers can access this page
- JWT token validation on every API call
- Employer can only see their own applications

### 2. Authorization
- Employer ID verification on backend
- Application ownership check
- Cannot access other employers' candidate data

### 3. Data Protection
- Sensitive data (email, phone) only shown to authorized employer
- Candidate responses encrypted in transit (HTTPS)
- No direct database access from frontend

### 4. API Endpoints Security

**GET /api/employer/applications/:applicationId**
```javascript
// Verifies:
- Valid JWT token
- Employer role
- Application belongs to this employer
```

**POST /api/employer/send-interview-invite/:applicationId**
```javascript
// Verifies:
- Valid JWT token
- Employer role
- Application belongs to this employer
- Valid date/time format
```

**POST /api/employer/confirm-interview/:applicationId**
```javascript
// Verifies:
- Valid JWT token
- Employer role
- Application belongs to this employer
- Candidate has responded
```

---

## Complete Flow Visualization

```
EMPLOYER                          SYSTEM                      CANDIDATE
   |                                |                             |
   |--[1. Send Invite]------------->|                             |
   |                                |--[Email with link]--------->|
   |                                |                             |
   |<-[Show sent invitation]--------|                             |
   |                                |                             |
   |                                |<-[2. Respond via platform]--|
   |                                |                             |
   |<-[Email notification]----------|                             |
   |<-[Show response in UI]---------|                             |
   |                                |                             |
   |--[3. Confirm schedule]-------->|                             |
   |                                |--[Confirmation email]------>|
   |                                |                             |
   |<-[Show confirmed status]-------|                             |
   |                                |                             |
```

---

## UI Components Structure

```
Interview Process Management Card
├── Header
│   ├── Title: "Interview Process Management"
│   └── Button: "Send Invite"
│
├── Body
│   ├── [1] Interview Invitation Sent (Orange Box)
│   │   ├── Proposed Date
│   │   ├── Proposed Time
│   │   ├── Meeting Link
│   │   ├── Instructions
│   │   └── Sent timestamp
│   │
│   ├── [2] Candidate Response (Green Box) - If responded
│   │   ├── Available Date
│   │   ├── Available Time
│   │   ├── Message (if provided)
│   │   ├── Responded timestamp
│   │   └── "Confirm This Schedule" button
│   │
│   ├── [3] Interview Confirmed (Blue Box) - If confirmed
│   │   ├── Confirmed Date
│   │   ├── Confirmed Time
│   │   └── Confirmed timestamp
│   │
│   └── Interview Stages (if configured)
│       └── Stage details...
│
└── Footer
    └── "Save Interview Process" button (if stages exist)
```

---

## Benefits

1. **Complete Visibility** - Employer sees entire communication history
2. **Organized Layout** - Clear visual separation of states
3. **Secure** - All data protected with authentication/authorization
4. **Real-time Updates** - Auto-refresh after actions
5. **Professional** - Clean, modern UI with proper styling
6. **Actionable** - Clear call-to-action buttons
7. **Informative** - Timestamps for audit trail

---

## Technical Implementation

### Frontend Components
- `InterviewProcessManager.jsx` - Main component
- State management for invite, response, and confirmation
- Auto-refresh after actions

### Backend APIs
- `GET /api/employer/applications/:applicationId` - Fetch all data
- `POST /api/employer/send-interview-invite/:applicationId` - Send invite
- `POST /api/employer/confirm-interview/:applicationId` - Confirm schedule

### Database Schema
```javascript
Application {
  interviewInvite: {
    sentAt: Date,
    proposedDate: String,
    proposedTime: String,
    meetingLink: String,
    instructions: String,
    status: 'pending' | 'responded' | 'confirmed',
    confirmedDate: String,
    confirmedTime: String,
    confirmedAt: Date
  },
  candidateResponse: {
    availableDate: String,
    availableTime: String,
    message: String,
    respondedAt: Date
  }
}
```
