# MongoDB Atlas Setup Guide

## 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Verify your email address

## 2. Create a New Cluster
1. Click "Create" to create a new cluster
2. Choose "M0 Sandbox" (Free tier)
3. Select your preferred cloud provider (AWS/Google Cloud/Azure)
4. Choose a region close to your location
5. Name your cluster (e.g., "tale-jobportal-cluster")
6. Click "Create Cluster"

## 3. Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

## 5. Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `tale_jobportal`

## 6. Update Environment Variables
Replace the MongoDB URI in your `.env` file:
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/tale_jobportal?retryWrites=true&w=majority
```

## 7. Test Connection
Run your backend server to test the connection:
```bash
cd backend
npm start
```

## Security Best Practices
- Use strong passwords for database users
- Restrict IP access in production
- Enable MongoDB Atlas monitoring
- Regular backup configuration
- Use environment-specific databases (dev/staging/prod)

## Environment-Specific Databases
Consider using different database names for different environments:
- Development: `tale_jobportal_dev`
- Staging: `tale_jobportal_staging`
- Production: `tale_jobportal_prod`