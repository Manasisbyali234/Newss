# Sub-Admin URLs Quick Reference

## Development URLs (localhost)

### Frontend URLs
- **Main Admin Login**: `http://localhost:3000/admin-login`
- **Sub-Admin Login**: `http://localhost:3000/sub-admin-login`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **Sub-Admin Management**: `http://localhost:3000/admin/sub-admin`

### Backend API URLs
- **Login (Both Admin & Sub-Admin)**: `POST http://localhost:5000/api/admin/login`
- **Get Sub-Admin Profile**: `GET http://localhost:5000/api/admin/sub-admin/profile`
- **List All Sub-Admins (Admin Only)**: `GET http://localhost:5000/api/admin/sub-admins`
- **Create Sub-Admin (Admin Only)**: `POST http://localhost:5000/api/admin/sub-admins`
- **Update Sub-Admin (Admin Only)**: `PUT http://localhost:5000/api/admin/sub-admins/:id`
- **Delete Sub-Admin (Admin Only)**: `DELETE http://localhost:5000/api/admin/sub-admins/:id`

## Production URLs (taleglobal.cloud)

### Frontend URLs
- **Main Admin Login**: `https://taleglobal.cloud/admin-login`
- **Sub-Admin Login**: `https://taleglobal.cloud/sub-admin-login`
- **Admin Dashboard**: `https://taleglobal.cloud/admin/dashboard`
- **Sub-Admin Management**: `https://taleglobal.cloud/admin/sub-admin`

### Backend API URLs
Replace `YOUR_API_DOMAIN` with your actual production API domain:

- **Login (Both Admin & Sub-Admin)**: `POST https://YOUR_API_DOMAIN/api/admin/login`
- **Get Sub-Admin Profile**: `GET https://YOUR_API_DOMAIN/api/admin/sub-admin/profile`
- **List All Sub-Admins (Admin Only)**: `GET https://YOUR_API_DOMAIN/api/admin/sub-admins`
- **Create Sub-Admin (Admin Only)**: `POST https://YOUR_API_DOMAIN/api/admin/sub-admins`
- **Update Sub-Admin (Admin Only)**: `PUT https://YOUR_API_DOMAIN/api/admin/sub-admins/:id`
- **Delete Sub-Admin (Admin Only)**: `DELETE https://YOUR_API_DOMAIN/api/admin/sub-admins/:id`

## User Flow

### Main Admin Flow
1. Visit: `http://localhost:3000/admin-login`
2. Login with admin credentials
3. Navigate to: `http://localhost:3000/admin/sub-admin`
4. Create new sub-admin
5. Sub-admin details are saved in database

### Sub-Admin Flow
1. Visit: `http://localhost:3000/sub-admin-login` (or `https://taleglobal.cloud/sub-admin-login`)
2. Login with sub-admin credentials
3. Redirected to: `http://localhost:3000/admin/dashboard`
4. Profile details are displayed on dashboard
5. Can access features based on assigned permissions

## API Request Examples

### 1. Sub-Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subadmin@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "subAdmin": {
    "id": "...",
    "name": "John Doe",
    "email": "subadmin@example.com",
    "role": "sub-admin",
    "permissions": ["employers", "registered_candidates"]
  }
}
```

### 2. Get Sub-Admin Profile
```bash
curl -X GET http://localhost:5000/api/admin/sub-admin/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
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
    "email": "subadmin@example.com",
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

### 3. Create Sub-Admin (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/sub-admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "name": "Jane Smith",
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "phone": "9876543210",
    "employerCode": "EMP002",
    "permissions": ["employers", "placement_officers"],
    "password": "SecurePass123"
  }'
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tale_jobportal
JWT_SECRET=tale_jwt_secret_key_2024
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Database Collections

### SubAdmin Collection
```javascript
{
  _id: ObjectId,
  name: String,
  firstName: String,
  lastName: String,
  username: String (unique),
  email: String (unique),
  phone: String,
  employerCode: String,
  password: String (hashed),
  permissions: [String], // ['employers', 'placement_officers', 'registered_candidates']
  role: String, // 'sub-admin'
  status: String, // 'active' or 'inactive'
  createdBy: ObjectId (ref: 'Admin'),
  resetPasswordOTP: String,
  resetPasswordOTPExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## LocalStorage Keys

After successful login, these keys are stored:

```javascript
// For Sub-Admin
localStorage.setItem('adminToken', 'JWT_TOKEN');
localStorage.setItem('subAdminData', JSON.stringify({
  id: '...',
  name: 'John Doe',
  email: 'subadmin@example.com',
  role: 'sub-admin',
  permissions: ['employers', 'registered_candidates']
}));

// For Main Admin
localStorage.setItem('adminToken', 'JWT_TOKEN');
localStorage.setItem('adminData', JSON.stringify({
  id: '...',
  name: 'Admin Name',
  email: 'admin@example.com',
  role: 'admin'
}));
```

## Permission Types

Sub-admins can have these permissions:

1. **employers**: Manage employer accounts
2. **placement_officers**: Manage placement officers and students
3. **registered_candidates**: Manage candidate accounts

## Status Values

- **active**: Sub-admin can login and access the system
- **inactive**: Sub-admin cannot login

## Role Values

- **admin**: Main administrator (full access)
- **sub-admin**: Sub administrator (limited access based on permissions)

## Quick Navigation

### For Developers
- Backend Code: `backend/controllers/adminController.js`
- Backend Routes: `backend/routes/admin.js`
- Frontend Dashboard: `frontend/src/app/pannels/admin/components/admin-dashboard.jsx`
- Frontend Login: `frontend/src/app/sub-admin-login/page.js`
- Sub-Admin Management: `frontend/src/app/pannels/admin/components/admin-sub-admin.jsx`

### For Testing
- Test Guide: `TEST_SUB_ADMIN.md`
- Implementation Guide: `SUB_ADMIN_IMPLEMENTATION.md`

## Support

For issues or questions:
1. Check the implementation guide: `SUB_ADMIN_IMPLEMENTATION.md`
2. Follow the testing guide: `TEST_SUB_ADMIN.md`
3. Check browser console for errors
4. Verify database connection
5. Check API responses in Network tab
