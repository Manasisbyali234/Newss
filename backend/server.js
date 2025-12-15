require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');

const { connectDB } = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const { initializeWebSocket } = require('./utils/websocket');
const Application = require('./models/Application');
const { sendAssessmentNotificationEmail } = require('./utils/emailService');

// Import Routes
const publicRoutes = require('./routes/public');
const candidateRoutes = require('./routes/candidate');
const employerRoutes = require('./routes/employer');
const adminRoutes = require('./routes/admin');
const placementRoutes = require('./routes/placement');
const holidaysRoutes = require('./routes/holidays');
const cacheRoutes = require('./routes/cache');

const app = express();

const startAssessmentNotificationScheduler = () => {
  const intervalMs = 5 * 60 * 1000;
  const reminderWindowMs = 60 * 60 * 1000;
  const startAlertGraceMs = 15 * 60 * 1000;
  let isRunning = false;

  const runCheck = async () => {
    if (isRunning) {
      return;
    }
    isRunning = true;
    try {
      const now = new Date();
      const applications = await Application.find({
        assessmentStatus: { $in: ['pending', 'available', 'in_progress'] },
        $or: [
          { assessmentReminderSent: { $ne: true } },
          { assessmentStartAlertSent: { $ne: true } }
        ]
      })
        .populate('candidateId', 'email name')
        .populate('jobId', 'title assessmentStartDate');

      for (const application of applications) {
        try {
          const job = application.jobId;
          if (!job || !job.assessmentStartDate) {
            continue;
          }
          const startDate = new Date(job.assessmentStartDate);
          if (Number.isNaN(startDate.getTime())) {
            continue;
          }

          const email = application.isGuestApplication ? application.applicantEmail : application.candidateId?.email;
          if (!email) {
            continue;
          }
          const name = application.isGuestApplication ? application.applicantName : application.candidateId?.name;
          const jobTitle = job.title || 'Assessment';
          const timeToStart = startDate.getTime() - now.getTime();

          if (timeToStart > 0 && timeToStart <= reminderWindowMs && !application.assessmentReminderSent) {
            await sendAssessmentNotificationEmail({
              email,
              name,
              jobTitle,
              startDate,
              type: 'reminder'
            });
            await Application.updateOne({ _id: application._id }, { $set: { assessmentReminderSent: true } });
          }

          if (timeToStart <= 0 && timeToStart >= -startAlertGraceMs && !application.assessmentStartAlertSent) {
            await sendAssessmentNotificationEmail({
              email,
              name,
              jobTitle,
              startDate,
              type: 'start'
            });
            await Application.updateOne({ _id: application._id }, { $set: { assessmentStartAlertSent: true } });
          }
        } catch (schedulerError) {
          console.error('Failed to process assessment notification for application', application._id, schedulerError);
        }
      }
    } catch (error) {
      console.error('Assessment notification scheduler error:', error);
    } finally {
      isRunning = false;
    }
  };

  runCheck();
  const interval = setInterval(runCheck, intervalMs);
  if (interval.unref) {
    interval.unref();
  }
};

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL, 
    'http://localhost:3000',
    'https://taleglobal.cloud',
    'https://www.taleglobal.cloud'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'pragma']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Skip body parsing for file uploads
app.use('/api/employer/profile/gallery', (req, res, next) => next());

// Body Parser Middleware with increased limits for file uploads
app.use(express.json({ limit: '60mb', parameterLimit: 50000 }));
app.use(express.urlencoded({ extended: true, limit: '60mb', parameterLimit: 50000 }));

// Set timeout for requests
app.use((req, res, next) => {
  // Set timeout to 5 minutes for file uploads
  if (req.path.includes('/gallery') || req.path.includes('/upload')) {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
  }
  next();
});

// Handle body parser and upload errors
app.use((error, req, res, next) => {
  console.log('Global error handler caught:', error.code, error.message);
  
  // Handle multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      success: false, 
      message: 'File size exceeds the limit. Please upload a file smaller than 10MB.' 
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      success: false, 
      message: 'Unexpected file field. Please use the correct form field name.' 
    });
  }
  
  // Handle entity too large errors
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ 
      success: false, 
      message: 'File size exceeds the limit. Please upload a file smaller than 10MB.' 
    });
  }
  
  // Handle payload too large errors
  if (error.code === 'LIMIT_FIELD_SIZE' || error.status === 413) {
    return res.status(413).json({ 
      success: false, 
      message: 'Upload size too large. Please compress your files or upload fewer files.' 
    });
  }
  
  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid request format. Please try again.' 
    });
  }
  
  // Handle connection errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return res.status(408).json({ 
      success: false, 
      message: 'Upload timeout. Please try uploading a smaller file or check your internet connection.' 
    });
  }
  
  // Handle file filter errors (from multer)
  if (error.message && error.message.includes('Only')) {
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
  
  next(error);
});

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle preflight requests
app.options('*', cors());

// API Routes
app.use('/api/public', publicRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api', holidaysRoutes);
app.use('/api/cache', cacheRoutes);

// Test page for interview status
app.get('/test-interview-status', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-interview-status.html'));
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tale Job Portal API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tale Job Portal API is running' });
});

// Error Handling Middleware
app.use(errorHandler);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server and initialize WebSocket
const server = http.createServer(app);
initializeWebSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Tale Job Portal API running on port ${PORT}`);
  console.log('WebSocket server initialized for real-time updates');
  startAssessmentNotificationScheduler();
});