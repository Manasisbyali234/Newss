const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const handleValidationErrors = require('../middlewares/validation');
const { checkPermission } = require('../middlewares/permissions');

// Authentication Routes (No auth required)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, adminController.loginAdmin);

router.post('/password/send-otp', [
  body('email').isEmail().withMessage('Valid email is required')
], handleValidationErrors, adminController.sendOTP);

router.post('/password/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, adminController.verifyOTPAndResetPassword);

router.post('/sub-admin-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, adminController.loginAdmin);

// Protected Routes
router.use(auth(['admin', 'sub-admin']));

// Dashboard Route
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/chart-data', adminController.getChartData);

// User Management Routes
router.get('/users', adminController.getUsers);
router.delete('/users/:userType/:userId', adminController.deleteUser);
router.put('/users/:userType/:userId', adminController.updateUser);

// Job Management Routes
router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', adminController.deleteJob);
router.put('/jobs/:jobId/approve', adminController.approveJob);
router.put('/jobs/:jobId/reject', adminController.rejectJob);

// Employer Management Routes
router.get('/employers', checkPermission('employers'), adminController.getAllEmployers);
router.get('/employers/pending-approval', checkPermission('employers'), adminController.getEmployersPendingApproval);
router.get('/employer-profile/:id', checkPermission('employers'), adminController.getEmployerProfile);
router.put('/employer-profile/:id', checkPermission('employers'), adminController.updateEmployerProfile);
router.get('/download-document/:employerId/:documentType', checkPermission('employers'), adminController.downloadDocument);
router.put('/employers/:id/status', checkPermission('employers'), adminController.updateEmployerStatus);
router.delete('/employers/:id', checkPermission('employers'), adminController.deleteEmployer);
router.get('/employer-jobs/:employerId', checkPermission('employers'), adminController.getEmployerJobs);
router.post('/employers/:employerId/authorization-letters/:letterId/approve', checkPermission('employers'), adminController.approveAuthorizationLetter);
router.post('/employers/:employerId/authorization-letters/:letterId/reject', checkPermission('employers'), adminController.rejectAuthorizationLetter);

// Candidate Management Routes
router.get('/candidates', checkPermission('registered_candidates'), adminController.getAllCandidates);
router.get('/registered-candidates', checkPermission('registered_candidates'), adminController.getRegisteredCandidates);
router.get('/candidates/:candidateId', checkPermission('registered_candidates'), adminController.getCandidateDetails);
router.delete('/candidates/:id', checkPermission('registered_candidates'), adminController.deleteCandidate);

// Credit Management Routes
router.put('/candidates/:candidateId/credits', adminController.updateCandidateCredits);
router.put('/candidates/credits/bulk', adminController.bulkUpdateCandidateCredits);

// Content Management Routes
router.post('/content/:type', upload.single('image'), [
  body('title').optional().notEmpty(),
  body('content').optional().notEmpty(),
  body('name').optional().notEmpty()
], handleValidationErrors, adminController.createContent);

router.put('/content/:type/:contentId', upload.single('image'), adminController.updateContent);
router.delete('/content/:type/:contentId', adminController.deleteContent);

// Contact Form Management Routes
router.get('/contacts', adminController.getContactForms);
router.delete('/contacts/:contactId', adminController.deleteContactForm);

// Support Ticket Management Routes
router.get('/support-tickets', adminController.getSupportTickets);
router.get('/support-tickets/:id', adminController.getSupportTicketById);
router.put('/support-tickets/:id/status', adminController.updateSupportTicketStatus);
router.delete('/support-tickets/:id', adminController.deleteSupportTicket);
router.get('/support-tickets/:ticketId/attachments/:attachmentIndex', adminController.downloadSupportAttachment);

// Applications Routes
router.get('/applications', adminController.getApplications);

// Placement Management Routes
router.get('/placements', checkPermission('placement_officers'), adminController.getAllPlacements);
router.get('/placements/:id', checkPermission('placement_officers'), adminController.getPlacementDetails);
router.get('/placements/:id/candidates', checkPermission('placement_officers'), require('../controllers/placementController').getPlacementCandidates);
router.put('/placements/:id/status', checkPermission('placement_officers'), adminController.updatePlacementStatus);


router.post('/placements/:id/process', checkPermission('placement_officers'), require('../controllers/placementController').processPlacementApproval);
router.get('/placements/:id/download', checkPermission('placement_officers'), adminController.downloadPlacementFile);
router.get('/placements/:id/data', checkPermission('placement_officers'), require('../controllers/placementController').getPlacementData);
router.put('/placements/:id/credits', checkPermission('placement_officers'), adminController.assignPlacementCredits);
router.post('/placement-login-token', checkPermission('placement_officers'), adminController.generatePlacementLoginToken);
router.post('/placements/:id/files/:fileId/approve', checkPermission('placement_officers'), adminController.approveIndividualFile);
router.post('/placements/:id/files/:fileId/reject', checkPermission('placement_officers'), adminController.rejectIndividualFile);
router.post('/placements/:id/files/:fileId/process', checkPermission('placement_officers'), require('../controllers/placementController').processFileApproval);
router.get('/placements/:placementId/files/:fileId/data', checkPermission('placement_officers'), require('../controllers/placementController').getFileData);
router.put('/placements/:placementId/files/:fileId/credits', checkPermission('placement_officers'), require('../controllers/placementController').updateFileCredits);
router.put('/placements/:placementId/bulk-credits', checkPermission('placement_officers'), adminController.assignBulkFileCredits);
router.post('/placements/:id/store-excel-data', checkPermission('placement_officers'), adminController.storeExcelDataInMongoDB);
router.get('/placements/:id/stored-excel-data', checkPermission('placement_officers'), adminController.getStoredExcelData);
router.get('/placements/:id/stored-excel-data/:fileId', checkPermission('placement_officers'), adminController.getStoredExcelData);
router.post('/placements/:id/sync-excel-credits', checkPermission('placement_officers'), adminController.syncExcelCreditsWithCandidates);
router.get('/placements/:id/download-id-card', checkPermission('placement_officers'), adminController.downloadPlacementIdCard);

// Sub Admin Management Routes (Only for main admins)
router.post('/sub-admins', auth(['admin']), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('permissions').isArray({ min: 1 }).withMessage('At least one permission is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, adminController.createSubAdmin);

router.get('/sub-admins', auth(['admin']), adminController.getAllSubAdmins);
router.put('/sub-admins/:id', auth(['admin']), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('permissions').isArray({ min: 1 }).withMessage('At least one permission is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters if provided')
], handleValidationErrors, adminController.updateSubAdmin);
router.delete('/sub-admins/:id', auth(['admin']), adminController.deleteSubAdmin);

// Site Settings Routes
router.get('/settings', adminController.getSettings);
router.put('/settings', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), adminController.updateSettings);

module.exports = router;