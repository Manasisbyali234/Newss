const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();

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
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body Parser Middleware with error handling
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf, encoding) => {
    // Log request size for debugging
    if (buf && buf.length > 10 * 1024 * 1024) { // 10MB
      // Removed console debug line for security;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle payload too large errors
app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request too large. Please upload files individually and try saving again.'
    });
  }
  next(error);
});

// Note: Static file serving removed - all files now stored as Base64 in database

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