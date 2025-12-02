# Troubleshooting Guide - Add Candidate Feature

## Error: 404 Not Found on `/api/admin/candidates/create`

### Solution Steps:

### 1. **RESTART THE BACKEND SERVER** (Most Important!)
The backend server needs to be restarted to pick up the new route and controller changes.

**Steps:**
1. Stop the backend server (Ctrl+C in the terminal running the backend)
2. Start it again:
   ```bash
   cd backend
   npm start
   ```
   OR
   ```bash
   node server.js
   ```

### 2. Verify the Backend is Running
- Check that the backend is running on port 5000
- You should see: `Tale Job Portal API running on port 5000`

### 3. Test the Endpoint
After restarting, test if the endpoint is accessible:

**Using Browser Console (when logged in as admin):**
```javascript
// Get the admin token
const token = localStorage.getItem('adminToken');
console.log('Admin Token:', token ? 'exists' : 'missing');

// Test the API
fetch('http://localhost:5000/api/admin/candidates/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'test123',
    collegeName: 'Test College',
    credits: 100
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### 4. Check Authentication
Make sure you're logged in as admin:
```javascript
// Check if admin token exists
console.log('Admin Token:', localStorage.getItem('adminToken'));

// If no token, login first at:
// http://localhost:3000/admin/login
```

### 5. Verify Files Were Updated
Check that these files have the new code:

**Backend:**
- `backend/routes/admin.js` - Should have line 36: `router.post('/candidates/create', adminController.createCandidate);`
- `backend/controllers/adminController.js` - Should have `exports.createCandidate` function

**Frontend:**
- `frontend/src/utils/api.js` - Should have `createCandidate` function
- `frontend/src/app/pannels/admin/components/admin-add-candidate.jsx` - Should exist
- `frontend/src/routing/admin-routes.jsx` - Should have route for `/placement-credits/add-candidate`

### 6. Clear Browser Cache
Sometimes the browser caches old JavaScript files:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 7. Check Console for Errors
Open browser console (F12) and check for:
- Network errors
- JavaScript errors
- Authentication errors

## Common Issues:

### Issue 1: "401 Unauthorized"
**Solution:** You're not logged in as admin. Go to `/admin/login` and login first.

### Issue 2: "Email already registered"
**Solution:** The email you're trying to use already exists. Use a different email.

### Issue 3: Backend not responding
**Solution:** 
1. Check if backend is running: `http://localhost:5000/health`
2. Check MongoDB is running
3. Check .env file has correct settings

### Issue 4: CORS errors
**Solution:** Make sure backend CORS is configured for `http://localhost:3000`

## Quick Test Checklist:

- [ ] Backend server restarted
- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Logged in as admin
- [ ] Admin token exists in localStorage
- [ ] Browser cache cleared
- [ ] No console errors

## Access the Feature:

1. Login as admin: `http://localhost:3000/admin/login`
2. Go to: `http://localhost:3000/admin/placement-credits`
3. Click the green "Add New Candidate" button
4. Fill in the form and submit

## Need More Help?

If the issue persists after restarting the backend:

1. Check backend console for errors
2. Check if the route is registered:
   ```bash
   # In backend directory
   node -e "const routes = require('./routes/admin'); console.log(routes.stack.map(r => r.route?.path))"
   ```

3. Verify the controller function exists:
   ```bash
   # In backend directory
   node -e "const controller = require('./controllers/adminController'); console.log('createCandidate exists:', typeof controller.createCandidate)"
   ```
