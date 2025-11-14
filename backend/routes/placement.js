const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const placementController = require('../controllers/placementController');
const handleValidationErrors = require('../middlewares/validation');
const { upload } = require('../middlewares/upload');
const { auth } = require('../middlewares/auth');

// Registration route without file upload
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('collegeName').notEmpty().withMessage('College name is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, placementController.registerPlacement);

router.post('/create-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, placementController.createPassword);

// Login route
router.post('/login', placementController.loginPlacement);

router.post('/check-email', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, placementController.checkEmail);

router.post('/password/send-otp', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, placementController.sendOTP);

router.post('/password/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, placementController.verifyOTPAndResetPassword);

router.post('/password/update-reset', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, placementController.updatePasswordReset);

// Get placement officer's student data
router.get('/students', auth(['placement']), placementController.getMyStudents);

// Get placement officer profile
router.get('/profile', auth(['placement']), async (req, res) => {
  try {
    const Placement = require('../models/Placement');
    const placementId = req.user._id || req.user.id;
    const placement = await Placement.findById(placementId)
      .select('name firstName lastName email phone collegeName status logo idCard fileHistory credits')
      .lean();
    
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    console.log('Placement profile data:', {
      id: placement._id,
      name: placement.name,
      hasLogo: !!placement.logo,
      hasIdCard: !!placement.idCard,
      fileHistoryCount: placement.fileHistory?.length || 0
    });
    
    res.json({ success: true, placement });
  } catch (error) {
    console.error('Error getting placement profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get placement dashboard stats
router.get('/dashboard', auth(['placement']), placementController.getPlacementDashboard);

// Upload student data file
router.post('/upload-student-data', auth(['placement']), upload.single('studentData'), placementController.uploadStudentData);

// View specific file data
router.get('/files/:fileId/view', auth(['placement']), placementController.viewFileData);

// Get placement data (for placement officers to view their own data)
router.get('/data', auth(['placement']), async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const students = await Candidate.find({ placementId: req.user.id })
      .select('name email phone course credits')
      .limit(100)
      .lean();
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting placement data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save dashboard state
router.post('/save-dashboard-state', auth(['placement']), placementController.saveDashboardState);

// Upload logo
router.post('/upload-logo', auth(['placement']), placementController.uploadLogo);

// Upload ID card
router.post('/upload-id-card', auth(['placement']), placementController.uploadIdCard);

// Update placement profile
router.put('/profile', auth(['placement']), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('collegeName').optional().notEmpty().withMessage('College name cannot be empty')
], handleValidationErrors, placementController.updateProfile);

module.exports = router;