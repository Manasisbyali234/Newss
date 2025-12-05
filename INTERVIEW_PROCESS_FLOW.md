# Interview Process Flow Documentation

## Overview
The interview process system manages the complete hiring workflow from application to final decision, including multiple interview stages, assessments, scheduling, and communication tracking.

---

## Architecture Components

### 1. Database Models

#### **InterviewProcess Model** (`backend/models/InterviewProcess.js`)
Main model that tracks the entire interview lifecycle for each application.

**Key Fields:**
- `applicationId` - Reference to the job application
- `jobId` - Reference to the job posting
- `candidateId` - Reference to the candidate
- `employerId` - Reference to the employer
- `processStatus` - Overall status: `not_started`, `in_progress`, `completed`, `rejected`, `hired`
- `stages[]` - Array of interview stages/rounds
- `finalDecision` - Final hiring decision: `pending`, `selected`, `rejected`, `on_hold`
- `offerDetails` - Salary, joining date, offer acceptance tracking
- `communications[]` - Log of all communications sent

**Stage Structure:**
Each stage in the `stages` array contains:
- `stageType` - Type: `assessment`, `technical`, `hr`, `managerial`, `final`, `nonTechnical`, `custom`
- `stageName` - Display name (e.g., "Technical Round")
- `stageOrder` - Sequence number
- `status` - Stage status: `pending`, `scheduled`, `in_progress`, `completed`, `passed`, `failed`, `cancelled`
- `scheduledDate` / `scheduledTime` - For fixed-time interviews
- `fromDate` / `toDate` - For flexible scheduling (assessments)
- `location` - Physical or "Online"
- `interviewerName` / `interviewerEmail` - Interviewer details
- `meetingLink` - Video conference URL
- `feedback` / `interviewerNotes` - Interview feedback
- `rating` - 1-5 rating scale
- `assessmentId` / `assessmentScore` - For assessment stages
- `statusHistory[]` - Audit trail of status changes

**Key Methods:**
- `updateStageStatus(stageIndex, newStatus, notes, changedBy, changedByModel)` - Updates stage status and tracks history
- `updateProcessStatus()` - Recalculates overall process status based on stage statuses
- `addCommunication(type, message, subject, sentBy, sentByModel)` - Logs communication

**Virtual Fields:**
- `completionPercentage` - Calculated as (completedStages / totalStages) * 100

#### **Application Model** (`backend/models/Application.js`)
Tracks job applications and links to interview process.

**Interview-Related Fields:**
- `interviewProcessId` - Reference to InterviewProcess document
- `assessmentStatus` - Status of assessment: `not_required`, `pending`, `available`, `in_progress`, `completed`, `expired`
- `assessmentScore` / `assessmentPercentage` / `assessmentResult` - Assessment results
- `interviewInvite` - Interview invitation details and status
- `candidateResponse` - Candidate's response to interview invite
- `interviewRounds[]` - Legacy field for backward compatibility
- `interviewProcesses[]` - Legacy field for backward compatibility

---

### 2. API Endpoints

#### **Interview Process Management** (`backend/routes/employer.js`)

**Create/Update Interview Process:**
```
POST /api/employer/applications/:applicationId/interview-process
```
- Creates new or updates existing interview process
- Body: `{ stages: [], processStatus: '', finalDecision: '' }`
- Validates employer owns the application
- Auto-calculates process status based on stages

**Get Interview Process:**
```
GET /api/employer/applications/:applicationId/interview-process
```
- Retrieves complete interview process with populated candidate, job, and employer details
- Returns null if no process exists

**Update Stage Status:**
```
PUT /api/employer/applications/:applicationId/interview-process/stages/:stageIndex/status
```
- Updates specific stage status
- Body: `{ status: '', feedback: '', notes: '' }`
- Automatically updates process status
- Tracks status history with timestamp and user

**Schedule Interview Stage:**
```
PUT /api/employer/applications/:applicationId/interview-process/stages/:stageIndex/schedule
```
- Schedules interview with date/time or date range
- Body: `{ scheduledDate, scheduledTime, fromDate, toDate, location, interviewerName, interviewerEmail, meetingLink, instructions }`
- Sets stage status to 'scheduled'

#### **Legacy Interview Endpoints:**
```
POST /api/employer/send-interview-invite/:applicationId
POST /api/employer/confirm-interview/:applicationId
GET /api/employer/interview-responses/:applicationId
```

---

### 3. Controller Logic

#### **interviewController.js** (`backend/controllers/interviewController.js`)

**createOrUpdateInterviewProcess:**
1. Validates application exists and belongs to employer
2. Finds existing InterviewProcess or creates new one
3. Updates stages array and status fields
4. Calls `updateProcessStatus()` to recalculate overall status
5. Saves and returns updated process

**getInterviewProcess:**
1. Validates employer authorization
2. Retrieves process with populated references
3. Returns process or null

**updateStageStatus:**
1. Validates employer authorization
2. Updates stage status, feedback, and notes
3. Calls `updateStageStatus()` method to track history
4. Auto-updates process status
5. Returns updated process

**scheduleInterviewStage:**
1. Validates employer authorization
2. Updates scheduling fields (dates, times, location, interviewer, meeting link)
3. Sets stage status to 'scheduled'
4. Returns updated process

---

## Process Flow

### Stage 1: Application Submission
1. Candidate applies for job → Application document created
2. Application status: `pending`
3. No InterviewProcess exists yet

### Stage 2: Employer Reviews Application
1. Employer views application
2. Employer decides to proceed with interview process
3. Employer creates InterviewProcess with stages

### Stage 3: Interview Process Creation
1. Employer defines interview stages:
   - Assessment (with fromDate/toDate range)
   - Technical Round (with scheduledDate/time)
   - HR Round
   - Final Round
2. Each stage has:
   - Type, name, order
   - Status (initially 'pending')
   - Scheduling details
3. Process status: `in_progress`

### Stage 4: Stage Execution
For each stage:
1. **Pending → Scheduled:**
   - Employer schedules the stage
   - Sets date/time or date range
   - Adds interviewer details, location, meeting link
   - Status: `scheduled`

2. **Scheduled → In Progress:**
   - Interview/assessment begins
   - Status: `in_progress`

3. **In Progress → Completed/Passed/Failed:**
   - Stage completes
   - Employer adds feedback, notes, rating
   - Status: `completed`, `passed`, or `failed`
   - `completedStages` counter increments
   - If failed: process status → `rejected`, finalDecision → `rejected`

### Stage 5: Process Completion
1. All stages completed successfully
2. Process status: `completed`
3. Final decision: `selected` (auto-set) or manually set to `rejected`/`on_hold`

### Stage 6: Offer Management (if selected)
1. Employer fills offer details:
   - Salary, currency, joining date
2. Offer letter sent: `offerLetterSent: true`
3. Candidate accepts: `offerAccepted: true`, `offerAcceptedAt: Date`
4. Process status: `hired`

---

## Status Flow Diagram

```
Application Created
       ↓
[pending] → Employer creates interview process
       ↓
InterviewProcess Created
       ↓
[not_started] → First stage scheduled
       ↓
[in_progress] → Stages execute
       ↓
    ┌──────┴──────┐
    ↓             ↓
[completed]   [rejected]
    ↓             ↓
[hired]      (Process ends)
```

### Stage Status Flow:
```
[pending] → [scheduled] → [in_progress] → [completed/passed]
                                      ↓
                                  [failed] → Process rejected
```

---

## Key Features

### 1. Flexible Scheduling
- **Fixed Time:** `scheduledDate` + `scheduledTime` for interviews
- **Date Range:** `fromDate` + `toDate` for assessments
- Supports online and physical locations

### 2. Assessment Integration
- Stages can reference Assessment documents
- Tracks assessment scores and results
- Links to AssessmentAttempt for detailed results

### 3. Status Tracking
- Complete audit trail via `statusHistory`
- Tracks who changed status (Employer/Admin/System)
- Timestamps for all changes

### 4. Communication Logging
- All emails, SMS, notifications logged in `communications[]`
- Tracks delivery and read status
- Links to sender (Employer/Admin/System)

### 5. Progress Calculation
- Auto-calculates `completionPercentage`
- Tracks `currentStage` number
- Counts `completedStages` vs `totalStages`

### 6. Multi-Stage Support
- Unlimited number of stages
- Customizable stage types
- Flexible ordering

---

## Database Indexes

Performance optimizations:
```javascript
applicationId: 1
candidateId: 1
jobId: 1
employerId: 1
processStatus: 1
'stages.status': 1
```

---

## Integration Points

### With Application Model:
- `Application.interviewProcessId` → `InterviewProcess._id`
- Application status syncs with process status

### With Assessment System:
- `stages[].assessmentId` → `Assessment._id`
- Assessment results populate stage fields

### With Notification System:
- Process events trigger notifications
- Communications logged in process

### With Email Service:
- Interview invites sent via email
- Logged in communications array

---

## Testing

Test script: `test-interview-process.js`
- Validates model structure
- Tests stage creation
- Verifies completion percentage calculation

---

## Best Practices

1. **Always validate employer authorization** before any operation
2. **Use updateStageStatus() method** to maintain audit trail
3. **Call updateProcessStatus()** after stage changes to sync overall status
4. **Log all communications** for compliance and tracking
5. **Handle failed stages** by setting process to rejected
6. **Populate references** when returning data to frontend

---

## Future Enhancements

- [ ] Automated email notifications on stage changes
- [ ] Calendar integration for scheduling
- [ ] Candidate self-scheduling portal
- [ ] Interview feedback templates
- [ ] Bulk stage operations
- [ ] Interview recording/notes attachments
- [ ] Integration with video conferencing platforms
- [ ] Analytics and reporting dashboard
