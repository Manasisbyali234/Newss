# Interview Invitation System - Quick Reference

## Summary

The system now has a complete interview invitation and response flow with proper UI display on the employer's candidate review page.

---

## What Employer Sees

### Location
`http://localhost:3000/employer/emp-candidate-review/[applicationId]`

### Interview Process Management Section Shows:

#### 1. **Sent Invitation** (Orange Box)
- Proposed date and time
- Meeting link (if provided)
- Instructions (if provided)
- When it was sent

#### 2. **Candidate Response** (Green Box) - When candidate responds
- Candidate's available date
- Candidate's available time
- Candidate's message (if provided)
- When they responded
- "Confirm This Schedule" button

#### 3. **Confirmed Schedule** (Blue Box) - After confirmation
- Final confirmed date
- Final confirmed time
- When it was confirmed

---

## What Candidate Receives

### Email Content:
```
Subject: Interview Invitation - [Job Title]

Dear [Name],

We would like to invite you for an interview for [Job Title].

Preferred Date: [Date]
Preferred Time: [Time]
Meeting Link: [Link if provided]
Instructions: [Instructions if provided]

Please log in to your dashboard to confirm your availability 
or suggest alternative time slots.

[Respond to Invitation Button]

Best regards,
[Company Name]
```

### Candidate Can:
1. Click button in email → Goes to dashboard
2. Or manually go to Application Status page
3. Click "Respond to Invitation"
4. Fill form with their available date/time
5. Add optional message
6. Submit response

---

## Security Features

✓ JWT authentication required
✓ Employer can only see their applications
✓ Candidate can only respond to their applications
✓ All API calls validated
✓ Data encrypted in transit

---

## Files Modified/Created

### Frontend
- `InterviewProcessManager.jsx` - Updated to show all states
- `interview-response-modal.jsx` - NEW - Candidate response form

### Backend
- `candidateController.js` - Added `respondToInterviewInvite` method
- `employerController.js` - Updated email template
- `candidate.js` routes - Added response endpoint
- `Application.js` model - Already had required fields

### Documentation
- `INTERVIEW_INVITE_FLOW.md` - Complete flow documentation
- `EMPLOYER_INTERVIEW_VIEW.md` - Employer UI documentation
- `QUICK_REFERENCE.md` - This file

---

## API Endpoints

### Employer
- `POST /api/employer/send-interview-invite/:applicationId`
- `POST /api/employer/confirm-interview/:applicationId`
- `GET /api/employer/applications/:applicationId`

### Candidate
- `POST /api/candidate/respond-interview/:applicationId`

---

## Testing Checklist

- [ ] Employer can send interview invite
- [ ] Candidate receives email with button
- [ ] Candidate can respond with date/time
- [ ] Employer sees response in UI
- [ ] Employer receives email notification
- [ ] Employer can confirm schedule
- [ ] Candidate receives confirmation email
- [ ] All three states display correctly
- [ ] Security: Cannot access other's data
- [ ] Timestamps are accurate

---

## Color Coding

- **Orange** (#ff6600) - Sent invitation
- **Green** (#28a745) - Candidate responded
- **Blue** (#0d6efd) - Confirmed schedule

---

## Next Steps (Optional Enhancements)

1. Add calendar integration (Google Calendar, Outlook)
2. Add reminder notifications
3. Add ability to reschedule
4. Add video call integration
5. Add interview feedback form
6. Add interview recording option
