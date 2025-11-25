const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const placementController = require('../controllers/placementController');
const handleValidationErrors = require('../middlewares/validation');
const { upload } = require('../middlewares/upload');
const { auth } = require('../middlewares/auth');
const { requiredPhoneValidationRules, phoneValidationRules } = require('../middlewares/phoneValidation');

// Registration route without file upload
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('collegeName').notEmpty().withMessage('College name is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ...requiredPhoneValidationRules()
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
    
    console.log('=== GET PROFILE REQUEST ===');
    console.log('Placement ID:', placementId);
    console.log('User object:', req.user);
    
    const placement = await Placement.findById(placementId)
      .select('name firstName lastName email phone collegeName status logo idCard fileHistory credits')
      .lean();
    
    if (!placement) {
      console.log('Placement not found:', placementId);
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    // Ensure firstName and lastName are populated from name if they don't exist
    if (placement.name && (!placement.firstName || !placement.lastName)) {
      const nameParts = placement.name.split(' ');
      if (nameParts.length >= 2) {
        placement.firstName = placement.firstName || nameParts[0];
        placement.lastName = placement.lastName || nameParts.slice(1).join(' ');
      } else {
        placement.firstName = placement.firstName || placement.name;
        placement.lastName = placement.lastName || '';
      }
    }
    
    console.log('Placement profile data:', {
      id: placement._id,
      name: placement.name,
      firstName: placement.firstName,
      lastName: placement.lastName,
      email: placement.email,
      phone: placement.phone,
      collegeName: placement.collegeName,
      hasLogo: !!placement.logo,
      hasIdCard: !!placement.idCard,
      fileHistoryCount: placement.fileHistory?.length || 0
    });
    
    res.json({ success: true, placement });
  } catch (error) {
    console.error('=== GET PROFILE ERROR ===');
    console.error('Error details:', error);
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
  body('collegeName').optional().notEmpty().withMessage('College name cannot be empty'),
  body('phone').optional().isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10-15 digits')
], handleValidationErrors, placementController.updateProfile);

module.exports = router;