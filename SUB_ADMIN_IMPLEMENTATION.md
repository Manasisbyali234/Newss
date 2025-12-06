# Sub-Admin Implementation Guide

## Overview
This document describes the implementation of the sub-admin feature where sub-admins created at `http://localhost:3000/admin/sub-admin` can login at `https://taleglobal.cloud/sub-admin-login` and view their profile details.

## Changes Made

### Backend Changes

#### 1. Controller Updates (`backend/controllers/adminController.js`)
- **Added `getSubAdminProfile` function**: New endpoint to fetch the logged-in sub-admin's profile details
  - Returns sub-admin information including name, username, email, phone, employer code, permissions, and status
  - Excludes password for security
  - Populates the `createdBy` field to show which admin created the sub-admin

#### 2. Route Updates (`backend/routes/admin.js`)
- **Added sub-admin profile route**: `GET /api/admin/sub-admin/profile`
  - Protected with authentication middleware for sub-admin role only
  - Returns the logged-in sub-admin's profile data
- **Restricted sub-admin management routes**: Only main admins can create, update, or delete sub-admins
  - `GET /api/admin/sub-admins` - List all sub-admins (Admin only)
  - `POST /api/admin/sub-admins` - Create new sub-admin (Admin only)
  - `PUT /api/admin/sub-admins/:id` - Update sub-admin (Admin only)
  - `DELETE /api/admin/sub-admins/:id` - Delete sub-admin (Admin only)

### Frontend Changes

#### 1. Dashboard Updates (`frontend/src/app/pannels/admin/components/admin-dashboard.jsx`)
- **Added sub-admin profile display**: When a sub-admin logs in, their profile is displayed prominently at the top of the dashboard
- **Profile information shown**:
  - Full Name
  - Username
  - Email
  - Phone Number
  - Employer Code
  - Account Status (Active/Inactive)
  - Assigned Permissions (displayed as badges)
- **Conditional rendering**: 
  - Sub-admins see their profile card and analytics
  - Main admins see the standard dashboard with statistics
- **Visual design**: Beautiful gradient card with icons for each field

#### 2. Login Page Updates (`frontend/src/app/sub-admin-login/page.js`)
- **Improved redirect logic**: Uses `window.location.href` for proper page reload after login
- **Better data storage**: Stores sub-admin data in localStorage for persistence
- **Enhanced error handling**: Clear error messages for authentication failures

## How It Works

### Sub-Admin Creation Flow
1. Main admin logs in at `http://localhost:3000/admin-login`
2. Navigates to "Sub Admin" section in the admin panel
3. Clicks "Add New Sub Admin" button
4. Fills in the form with:
   - First Name & Last Name
   - Username (unique)
   - Email (unique)
   - Phone Number
   - Employer Code
   - Permissions (Employers, Placement Officers, Registered Candidates)
   - Password
5. Submits the form
6. Sub-admin account is created in the database

### Sub-Admin Login Flow
1. Sub-admin visits `https://taleglobal.cloud/sub-admin-login` (or `http://localhost:3000/sub-admin-login`)
2. Enters their email and password
3. System authenticates against the SubAdmin collection
4. On success:
   - JWT token is generated and stored in localStorage
   - Sub-admin data is stored in localStorage
   - User is redirected to `/admin/dashboard`
5. Dashboard loads and:
   - Detects sub-admin role from localStorage
   - Fetches complete profile from `/api/admin/sub-admin/profile`
   - Displays profile information in a beautiful card
   - Shows analytics and charts below

### Profile Display
The sub-admin profile card shows:
- **Personal Information**: Name, username, email, phone
- **Account Details**: Employer code, status
- **Permissions**: Visual badges showing assigned permissions
- **Visual Design**: Gradient purple background with white text and icons

## API Endpoints

### Get Sub-Admin Profile
```
GET /api/admin/sub-admin/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "subAdmin": {
    "_id": "...",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "1234567890",
    "employerCode": "EMP001",
    "permissions": ["employers", "registered_candidates"],
    "role": "sub-admin",
    "status": "active",
    "createdBy": {
      "_id": "...",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

1. **Authentication Required**: All sub-admin routes require valid JWT token
2. **Role-Based Access**: Sub-admins can only access their own profile
3. **Password Excluded**: Password is never returned in API responses
4. **Permission-Based Access**: Sub-admins can only access features based on their assigned permissions
5. **Separate Login**: Sub-admins have a dedicated login page separate from main admin

## Testing

### Test Sub-Admin Creation
1. Login as main admin
2. Go to Sub Admin section
3. Create a new sub-admin with test credentials
4. Verify the sub-admin appears in the list

### Test Sub-Admin Login
1. Logout from admin panel
2. Visit `/sub-admin-login`
3. Enter sub-admin credentials
4. Verify redirect to dashboard
5. Verify profile information is displayed correctly
6. Check that all assigned permissions are shown

### Test Profile Display
1. Login as sub-admin
2. Navigate to dashboard
3. Verify profile card shows:
   - Correct name, username, email
   - Correct phone and employer code
   - Correct status (Active)
   - All assigned permissions as badges
4. Verify analytics charts are visible below profile

## Environment Configuration

Make sure your `.env` file has:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tale_jobportal
JWT_SECRET=tale_jwt_secret_key_2024
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Production Deployment

For production deployment at `https://taleglobal.cloud`:

1. Update API base URLs in frontend:
   - Change `http://localhost:5000` to your production API URL
   - Update in `admin-dashboard.jsx` and `page.js`

2. Update FRONTEND_URL in backend `.env`:
   ```
   FRONTEND_URL=https://taleglobal.cloud
   ```

3. Ensure CORS is configured for production domain

4. Use HTTPS for all API calls

## Permissions System

Sub-admins can be assigned the following permissions:

1. **employers**: Manage employer accounts
   - View employer list
   - Approve/reject employers
   - View employer profiles
   - Manage employer documents

2. **placement_officers**: Manage placement officers
   - View placement officer list
   - Approve/reject placement officers
   - Manage student files
   - Assign credits

3. **registered_candidates**: Manage candidate accounts
   - View candidate list
   - View candidate profiles
   - Manage candidate credits
   - View applications

## Future Enhancements

1. **Profile Editing**: Allow sub-admins to edit their own profile
2. **Activity Logs**: Track sub-admin actions
3. **Permission-Based UI**: Hide/show menu items based on permissions
4. **Notification System**: Notify sub-admins of important events
5. **Password Reset**: Allow sub-admins to reset their password via email

## Troubleshooting

### Sub-Admin Can't Login
- Verify sub-admin status is "active"
- Check email and password are correct
- Verify JWT_SECRET is same in backend
- Check browser console for errors

### Profile Not Displaying
- Check localStorage has "subAdminData"
- Verify API endpoint is accessible
- Check network tab for API errors
- Verify token is valid

### Permissions Not Working
- Verify permissions are saved in database
- Check auth middleware is working
- Verify role is "sub-admin" in token

## Support

For issues or questions, contact the development team.
