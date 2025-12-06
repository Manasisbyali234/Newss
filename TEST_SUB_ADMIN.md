# Sub-Admin Feature Testing Guide

## Quick Test Steps

### Step 1: Create a Sub-Admin (Main Admin)
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Login as main admin at `http://localhost:3000/admin-login`
4. Navigate to "Sub Admin" in the sidebar
5. Click "Add New Sub Admin"
6. Fill in the form:
   ```
   First Name: Test
   Last Name: SubAdmin
   Username: testsubadmin
   Email: test@subadmin.com
   Phone: 1234567890
   Employer Code: TEST001
   Permissions: Select all three (Employers, Placement Officers, Registered Candidates)
   Password: Test@123
   Confirm Password: Test@123
   ```
7. Click "Add Sub Admin"
8. Verify success message appears
9. Verify sub-admin appears in the list

### Step 2: Test Sub-Admin Login
1. Logout from admin panel (or open incognito window)
2. Visit `http://localhost:3000/sub-admin-login`
3. Enter credentials:
   ```
   Email: test@subadmin.com
   Password: Test@123
   ```
4. Click "Login as Sub Admin"
5. Verify redirect to `/admin/dashboard`

### Step 3: Verify Profile Display
After login, you should see:

1. **Dashboard Header**: "Sub Admin Dashboard" (not "Admin Dashboard")
2. **Profile Card** with purple gradient background showing:
   - Full Name: "Test SubAdmin"
   - Username: "testsubadmin"
   - Email: "test@subadmin.com"
   - Phone: "1234567890"
   - Employer Code: "TEST001"
   - Status: "Active" (with green indicator)
   - Permissions: Three badges showing:
     - EMPLOYERS
     - PLACEMENT OFFICERS
     - REGISTERED CANDIDATES

3. **Analytics Section**: Charts and graphs below the profile

### Step 4: Test API Endpoint Directly

Using Postman or curl:

1. First, login to get token:
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@subadmin.com",
    "password": "Test@123"
  }'
```

2. Copy the token from response

3. Get sub-admin profile:
```bash
curl -X GET http://localhost:5000/api/admin/sub-admin/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "subAdmin": {
    "_id": "...",
    "name": "Test SubAdmin",
    "firstName": "Test",
    "lastName": "SubAdmin",
    "username": "testsubadmin",
    "email": "test@subadmin.com",
    "phone": "1234567890",
    "employerCode": "TEST001",
    "permissions": ["employers", "placement_officers", "registered_candidates"],
    "role": "sub-admin",
    "status": "active",
    "createdBy": {
      "_id": "...",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Expected Results

### ✅ Success Indicators
- [ ] Sub-admin created successfully
- [ ] Sub-admin appears in list
- [ ] Login successful with correct credentials
- [ ] Redirect to dashboard works
- [ ] Profile card displays with all information
- [ ] All permissions shown as badges
- [ ] Status shows as "Active"
- [ ] Analytics charts visible below profile

### ❌ Common Issues

**Issue**: "Access denied. This login is for sub-admins only."
- **Solution**: Make sure you're using the sub-admin login page, not the main admin login

**Issue**: Profile card not showing
- **Solution**: 
  1. Check browser console for errors
  2. Verify localStorage has "subAdminData"
  3. Check network tab for API call to `/api/admin/sub-admin/profile`

**Issue**: "Invalid credentials"
- **Solution**: 
  1. Verify email and password are correct
  2. Check sub-admin status is "active" in database
  3. Verify sub-admin exists in database

**Issue**: Token expired
- **Solution**: Login again to get a new token

## Database Verification

Check MongoDB directly:

```javascript
// Connect to MongoDB
use tale_jobportal

// Find all sub-admins
db.subadmins.find().pretty()

// Find specific sub-admin
db.subadmins.findOne({ email: "test@subadmin.com" })

// Verify fields
db.subadmins.findOne(
  { email: "test@subadmin.com" },
  { 
    name: 1, 
    username: 1, 
    email: 1, 
    phone: 1, 
    employerCode: 1, 
    permissions: 1, 
    status: 1 
  }
)
```

## Browser Console Checks

Open browser console (F12) and check:

```javascript
// Check if sub-admin data is stored
console.log(localStorage.getItem('subAdminData'));

// Check if token is stored
console.log(localStorage.getItem('adminToken'));

// Parse sub-admin data
console.log(JSON.parse(localStorage.getItem('subAdminData')));
```

## Network Tab Verification

1. Open browser DevTools (F12)
2. Go to Network tab
3. Login as sub-admin
4. Look for these requests:
   - `POST /api/admin/login` - Should return 200 with token
   - `GET /api/admin/sub-admin/profile` - Should return 200 with profile data
   - `GET /api/admin/dashboard/stats` - Should return 200 with stats

## Clean Up After Testing

```javascript
// Remove test sub-admin from database
db.subadmins.deleteOne({ email: "test@subadmin.com" })
```

Or use the admin panel:
1. Login as main admin
2. Go to Sub Admin section
3. Find "Test SubAdmin"
4. Click Delete button
5. Confirm deletion

## Production Testing

For testing on `https://taleglobal.cloud`:

1. Update API URLs in code to production URLs
2. Create sub-admin on production
3. Visit `https://taleglobal.cloud/sub-admin-login`
4. Login with sub-admin credentials
5. Verify profile displays correctly

## Security Testing

1. **Test unauthorized access**:
   - Try accessing `/api/admin/sub-admin/profile` without token
   - Should return 401 Unauthorized

2. **Test with main admin token**:
   - Login as main admin
   - Try accessing `/api/admin/sub-admin/profile` with admin token
   - Should return 403 Forbidden (only sub-admins can access)

3. **Test expired token**:
   - Use an old/expired token
   - Should return 401 with "Token expired" message

## Performance Testing

1. Create multiple sub-admins (10-20)
2. Login as each one
3. Verify profile loads quickly (< 1 second)
4. Check database query performance

## Accessibility Testing

1. Test with keyboard navigation
2. Test with screen reader
3. Verify all form fields have labels
4. Check color contrast ratios

## Mobile Testing

1. Open on mobile device
2. Verify profile card is responsive
3. Check all information is readable
4. Test login form on mobile

## Report Issues

If you find any issues, report with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots/console errors
5. Browser and version
6. Environment (dev/production)
