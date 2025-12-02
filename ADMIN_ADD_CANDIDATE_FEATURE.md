# Admin Add New Candidate Feature

## Overview
Implemented a feature that allows admins to create new candidates directly from the admin panel at `/admin/placement-credits`. The admin can create candidates with the following information:
- First Name
- Last Name
- Email ID
- Password
- College Name
- Credits (0-10000)

## Features Implemented

### Backend Changes

1. **Route Added** (`backend/routes/admin.js`)
   - `POST /api/admin/candidates/create` - Create a new candidate

2. **Controller Function** (`backend/controllers/adminController.js`)
   - `createCandidate` - Handles candidate creation with validation
   - Creates candidate account with `registrationMethod: 'admin'`
   - Creates candidate profile with college name
   - Sends welcome email with login credentials
   - Validates email uniqueness
   - Validates required fields
   - Sets credits (0-10000 range)

### Frontend Changes

1. **New Component** (`frontend/src/app/pannels/admin/components/admin-add-candidate.jsx`)
   - Form to create new candidate
   - Input fields for all required information
   - Form validation
   - Success/error notifications
   - Navigation back to placement credits page

2. **API Function** (`frontend/src/utils/api.js`)
   - `createCandidate(data)` - API call to create candidate

3. **Route Added** (`frontend/src/routing/admin-routes.jsx`)
   - `/admin/placement-credits/add-candidate` - Route for add candidate page

4. **UI Enhancement** (`frontend/src/app/pannels/admin/components/admin-individual-credit.jsx`)
   - Added "Add New Candidate" button on placement credits page
   - Button navigates to the add candidate form

## User Flow

1. Admin navigates to `/admin/placement-credits`
2. Clicks "Add New Candidate" button (green button with plus icon)
3. Fills in the candidate information form:
   - First Name (required)
   - Last Name (required)
   - Email ID (required)
   - Password (required, min 6 characters)
   - College Name (required)
   - Credits (optional, 0-10000)
4. Clicks "Create Candidate" button
5. System validates and creates the candidate
6. Candidate receives welcome email with:
   - Login credentials (email and password)
   - Credit score
   - Link to create new password (optional)
   - Instructions to login
7. Admin sees success message and is redirected back to placement credits page

## Email Notification

The candidate receives a comprehensive welcome email that includes:
- Greeting with their name
- Approval message from Admin
- Login credentials (email and password)
- Credit score assigned
- Login button to candidate dashboard
- Option to create a new secure password
- Security tips
- Quick access information
- Support contact details

## Technical Details

### Candidate Creation
- Registration method: `admin`
- Status: `active`
- Verified: `true`
- Password: Stored as plain text for admin-created candidates (similar to placement candidates)
- Profile: Automatically created with college name

### Validation
- Email uniqueness check
- Required field validation
- Credits range validation (0-10000)
- Password minimum length (6 characters)

### Security
- Admin authentication required
- JWT token validation
- Email validation
- Password requirements enforced

## Access
- **URL**: `http://localhost:3000/admin/placement-credits`
- **Button**: "Add New Candidate" (green button with plus icon)
- **Form URL**: `http://localhost:3000/admin/placement-credits/add-candidate`

## Benefits
1. Quick candidate creation without Excel upload
2. Immediate credit assignment
3. Automatic welcome email with credentials
4. No need for placement officer involvement
5. Direct admin control over candidate accounts
6. Streamlined onboarding process
