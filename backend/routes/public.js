const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const publicController = require('../controllers/publicController');
const handleValidationErrors = require('../middlewares/validation');
const { upload } = require('../middlewares/upload');
const performanceMiddleware = require('../middlewares/performance');

// Apply performance monitoring to all routes
router.use(performanceMiddleware);

// Job Routes
router.get('/jobs', publicController.getJobs);
router.get('/jobs/search', publicController.searchJobs);
router.get('/jobs/:id', publicController.getJobById);
router.get('/jobs/category/:category', publicController.getJobsByCategory);

// Blog Routes
router.get('/blogs', publicController.getBlogs);
router.get('/blogs/:id', publicController.getBlogById);

// Contact Route
router.post('/contact', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required')
], handleValidationErrors, publicController.submitContactForm);

// Support Route
router.post('/support', upload.array('attachments', 3), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('userType').isIn(['employer', 'candidate', 'guest']).withMessage('Valid user type is required'),
  body('category').optional().isIn(['technical', 'billing', 'account', 'job-posting', 'application', 'general']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], handleValidationErrors, publicController.submitSupportTicket);

// Content Routes
router.get('/testimonials', publicController.getTestimonials);
router.get('/partners', publicController.getPartners);
router.get('/faqs', publicController.getFAQs);

// Public Stats
router.get('/stats', publicController.getPublicStats);

// Employer Profile
router.get('/employers/:id', publicController.getEmployerProfile);
router.get('/employers', publicController.getEmployers);
router.get('/top-recruiters', publicController.getTopRecruiters);

// Apply for job without login
router.post('/apply-job', upload.single('resume'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('jobId').notEmpty().withMessage('Job ID is required')
], handleValidationErrors, publicController.applyForJob);

// Review Routes
router.get('/employers/:employerId/reviews', publicController.getEmployerReviews);
router.post('/employers/:employerId/reviews', [
  body('reviewerName').notEmpty().withMessage('Name is required'),
  body('reviewerEmail').isEmail().withMessage('Valid email is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('description').notEmpty().withMessage('Review description is required')
], handleValidationErrors, publicController.submitEmployerReview);
router.get('/employers/:employerId/submitted-reviews', publicController.getSubmittedReviews);

module.exports = router;