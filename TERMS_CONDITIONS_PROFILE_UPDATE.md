# Terms & Conditions Profile Page Update

## Summary
Updated the Terms & Conditions modal to show role-specific content for Employer and Candidate profile pages, filtered from the main Terms & Conditions page.

## Changes Made

### 1. Updated TermsModal Component
**File:** `frontend/src/components/TermsModal.jsx`

Added two new role types to the `termsContent` object:
- `candidateProfile` - Shows candidate-specific terms for the candidate profile page
- `employerProfile` - Shows employer-specific terms for the employer profile page

#### Content for Candidate Profile (`candidateProfile`)
Displays the following sections from the main Terms & Conditions page:
1. Registration and Profile Creation
2. Application and Fees
3. Conduct
4. Data and Privacy
5. Liability

#### Content for Employer Profile (`employerProfile`)
Displays the following sections from the main Terms & Conditions page:
1. Registration and Verification
2. Job Posting and Process

### 2. Updated Candidate Profile Page
**File:** `frontend/src/app/pannels/candidate/sections/profile/section-can-basic-info.jsx`

Changed the TermsModal role from `"candidate"` to `"candidateProfile"`:
```jsx
<TermsModal 
    role="candidateProfile"
    // ... other props
/>
```

### 3. Employer Profile Page (Already Configured)
**File:** `frontend/src/app/pannels/employer/components/emp-company-profile.jsx`

Already uses `role="employerProfile"`:
```jsx
<TermsModal 
    role="employerProfile"
    // ... other props
/>
```

## How It Works

1. When a user visits their profile page (either candidate or employer) and tries to save without accepting terms
2. The TermsModal opens with role-specific content
3. The modal shows only the relevant sections from the main Terms & Conditions page based on their role
4. User must scroll to bottom and check the acceptance box
5. Upon acceptance, the profile is saved

## URLs Affected

- **Candidate Profile:** `http://localhost:3000/candidate/profile`
  - Shows candidate-specific terms (Registration, Application & Fees, Conduct, Data & Privacy, Liability)

- **Employer Profile:** `http://localhost:3000/employer/profile`
  - Shows employer-specific terms (Registration & Verification, Job Posting & Process)

- **Main Terms Page:** `http://localhost:3000/terms-conditions`
  - Shows complete terms for all roles (unchanged)

## Testing

To test the implementation:

1. **For Candidate Profile:**
   - Navigate to `http://localhost:3000/candidate/profile`
   - Make changes to profile
   - Click "Save Profile"
   - Verify the Terms modal shows only candidate-specific sections

2. **For Employer Profile:**
   - Navigate to `http://localhost:3000/employer/profile`
   - Make changes to profile
   - Click "Save Profile"
   - Verify the Terms modal shows only employer-specific sections

3. **For Main Terms Page:**
   - Navigate to `http://localhost:3000/terms-conditions`
   - Verify all sections are visible (About TaleGlobal, Employer Terms, Candidate Terms, Consultancy Terms, Legal Compliance, etc.)

## Benefits

1. **User Experience:** Users only see terms relevant to their role when updating their profile
2. **Clarity:** Reduces information overload by showing only applicable terms
3. **Compliance:** Ensures users acknowledge role-specific terms before profile updates
4. **Maintainability:** Single source of truth for terms content in the main terms page
5. **Flexibility:** Easy to add more role-specific views in the future

## Notes

- The main Terms & Conditions page (`/terms-conditions`) remains unchanged and shows all content
- The TermsModal component now supports 5 roles: `candidate`, `candidateProfile`, `employer`, `employerProfile`, and `placement`
- Content is filtered at the component level, not at the API level
- No backend changes were required for this implementation
