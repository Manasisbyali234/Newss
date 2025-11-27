const jwt = require('jsonwebtoken');
const Employer = require('../models/Employer');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Message = require('../models/Message');
const Subscription = require('../models/Subscription');
const { sendWelcomeEmail } = require('../utils/emailService');
const { cacheInvalidation } = require('../utils/cacheInvalidation');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Authentication Controllers
exports.registerEmployer = async (req, res) => {
  try {
    console.log('=== EMPLOYER REGISTRATION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { name, email, password, phone, companyName, employerCategory, employerType, sendWelcomeEmail: shouldSendEmail } = req.body;

    const existingEmployer = await Employer.findOne({ email });
    if (existingEmployer) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const finalEmployerType = employerType || (employerCategory === 'consultancy' ? 'consultant' : 'company');

    // Create employer without password - they will create it via email link
    const employer = await Employer.create({ 
      name, 
      email, 
      phone, 
      companyName,
      employerType: finalEmployerType
    });
    
    await EmployerProfile.create({ 
      employerId: employer._id,
      employerCategory: employerCategory || finalEmployerType,
      companyName: companyName,
      email: email,
      phone: phone,
      description: 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.',
      location: 'Bangalore, India'
    });
    
    await Subscription.create({ employerId: employer._id });

    // Send welcome email with password creation link
    try {
      await sendWelcomeEmail(email, companyName, 'employer');
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send welcome email. Please try again.' });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to create your password.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Removed console debug line for security

    const employer = await Employer.findOne({ email });
    if (!employer) {
      // Removed console debug line for security
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await employer.comparePassword(password);
    if (!isPasswordValid) {
      // Removed console debug line for security;
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (employer.status !== 'active') {
      // Removed console debug line for security;
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const token = generateToken(employer._id, 'employer');
    // Removed console debug line for security;

    res.json({
      success: true,
      token,
      employer: {
        id: employer._id,
        name: employer.name,
        email: employer.email,
        companyName: employer.companyName,
        employerType: employer.employerType
      }
    });
  } catch (error) {
    console.error('Employer login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Profile Controllers
exports.getProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ employerId: req.user._id })
      .populate('employerId', 'name email phone companyName isApproved');
    
    if (!profile) {
      return res.json({ success: true, profile: null });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Log request size for debugging
    const requestSize = JSON.stringify(req.body).length;
    // Removed console debug line for security;
    
    // Remove employerCategory from update data to prevent modification
    const updateData = { ...req.body };
    delete updateData.employerCategory;
    
    // Explicitly preserve text fields that should be saved
    // Use $set operator to ensure fields are actually updated
    const textFieldsToPreserve = ['whyJoinUs', 'googleMapsEmbed', 'description', 'location'];
    const setOperations = {};
    
    textFieldsToPreserve.forEach(field => {
      if (req.body[field] !== undefined) {
        setOperations[field] = req.body[field];
      }
    });
    
    // Remove any Base64 data that should not be in profile updates
    // (these should be uploaded via separate endpoints)
    const fieldsToExclude = ['logo', 'coverImage', 'panCardImage', 'cinImage', 'gstImage', 'certificateOfIncorporation', 'companyIdCardPicture', 'authorizationLetters', 'gallery'];
    fieldsToExclude.forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string' && updateData[field].startsWith('data:')) {
        console.log(`Excluding Base64 field: ${field}`);
        delete updateData[field];
      }
    });
    
    // Merge the text field set operations into updateData to ensure they're saved
    Object.assign(updateData, setOperations);
    
    // Force include whyJoinUs and googleMapsEmbed even if empty strings
    if (req.body.hasOwnProperty('whyJoinUs')) {
      updateData.whyJoinUs = req.body.whyJoinUs || '';
    }
    if (req.body.hasOwnProperty('googleMapsEmbed')) {
      updateData.googleMapsEmbed = req.body.googleMapsEmbed || '';
    }
    
    // Ensure description and location always have default values if empty
    if (req.body.hasOwnProperty('description')) {
      updateData.description = req.body.description || 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.';
    }
    if (req.body.hasOwnProperty('location')) {
      updateData.location = req.body.location || 'Bangalore, India';
    }

    // Verify that text fields are included in updateData
    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('Profile update - companyName:', updateData.companyName);
    console.log('Profile update - description:', updateData.description?.substring(0, 50));
    console.log('Profile update - location:', updateData.location?.substring(0, 50));
    console.log('Profile update - whyJoinUs:', updateData.whyJoinUs?.substring(0, 50));
    console.log('Profile update - googleMapsEmbed:', updateData.googleMapsEmbed?.substring(0, 50));
    console.log('Profile update - teamSize:', updateData.teamSize);
    console.log('Profile update - establishedSince:', updateData.establishedSince);
    console.log('Profile update - industrySector:', updateData.industrySector);
    console.log('Profile update - companyType:', updateData.companyType);
    console.log('Profile update - website:', updateData.website);
    console.log('Profile update - corporateAddress:', updateData.corporateAddress);
    console.log('Profile update - all updateData keys:', Object.keys(updateData));
    console.log('=== END DEBUG ===');

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      updateData,
      { new: true, upsert: true, runValidators: false }
    ).populate('employerId', 'name email phone companyName');

    // Verify fields were saved to database
    console.log('=== SAVED PROFILE DEBUG ===');
    console.log('Saved profile - companyName:', profile.companyName);
    console.log('Saved profile - description:', profile.description?.substring(0, 50));
    console.log('Saved profile - location:', profile.location?.substring(0, 50));
    console.log('Saved profile - whyJoinUs:', profile.whyJoinUs?.substring(0, 50));
    console.log('Saved profile - googleMapsEmbed:', profile.googleMapsEmbed?.substring(0, 50));
    console.log('Saved profile - teamSize:', profile.teamSize);
    console.log('Saved profile - establishedSince:', profile.establishedSince);
    console.log('Saved profile - industrySector:', profile.industrySector);
    console.log('Saved profile - companyType:', profile.companyType);
    console.log('Saved profile - website:', profile.website);
    console.log('Saved profile - corporateAddress:', profile.corporateAddress);
    console.log('=== END SAVED DEBUG ===');

    // Check if profile is now complete and notify admin for approval
    try {
      const { createNotification } = require('./notificationController');
      const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
      const isProfileComplete = requiredFields.every(field => profile[field]);
      
      if (isProfileComplete && !req.user.isApproved) {
        // Profile is complete but not yet approved - notify admin
        await createNotification({
          title: 'Company Profile Ready for Review',
          message: `${profile.companyName || 'A company'} has completed their profile and is ready for admin approval to post jobs.`,
          type: 'profile_submitted',
          role: 'admin',
          relatedId: profile._id,
          createdBy: req.user._id
        });
        
        // Update employer status to indicate profile is submitted for review
        await Employer.findByIdAndUpdate(req.user._id, { 
          profileSubmittedForReview: true,
          profileSubmittedAt: new Date()
        });
      } else {
        // Regular profile update notification
        await createNotification({
          title: 'Company Profile Updated',
          message: `${profile.companyName || 'A company'} has updated their profile`,
          type: 'profile_updated',
          role: 'admin',
          relatedId: profile._id,
          createdBy: req.user._id
        });
      }
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }

    // Clear employer-related caches when profile is updated
    cacheInvalidation.clearEmployerGridCaches();

    // Check if this is the first time profile is being completed
    const employer = await Employer.findById(req.user._id);
    const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
    const isProfileComplete = requiredFields.every(field => profile[field]);
    
    let message = 'Profile updated successfully!';
    if (isProfileComplete && !employer.isApproved && !employer.profileSubmittedForReview) {
      message = 'Profile completed successfully! Your profile has been submitted for admin review. You will be able to post jobs once approved.';
    } else if (isProfileComplete && employer.profileSubmittedForReview && !employer.isApproved) {
      message = 'Profile updated successfully! Your profile is currently under admin review.';
    } else if (isProfileComplete && employer.isApproved) {
      message = 'Profile updated successfully! You can now post jobs.';
    }
    
    res.json({ 
      success: true, 
      profile,
      message,
      isProfileComplete,
      isApproved: employer.isApproved,
      profileSubmittedForReview: employer.profileSubmittedForReview
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.type === 'entity.too.large') {
      res.status(413).json({ success: false, message: 'Request too large. Please upload files individually and try again.' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const logoBase64 = fileToBase64(req.file);

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { logo: logoBase64 },
      { new: true, upsert: true }
    );

    // Clear employer grid caches when logo is updated
    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, logo: logoBase64, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const coverBase64 = fileToBase64(req.file);

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { coverImage: coverBase64 },
      { new: true, upsert: true }
    );

    // Clear employer grid caches when cover image is updated
    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, coverImage: coverBase64, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const { fieldName } = req.body;
    const documentBase64 = fileToBase64(req.file);
    const updateData = { [fieldName]: documentBase64 };

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      updateData,
      { new: true, upsert: true }
    );

    // Clear employer grid caches when document is updated
    cacheInvalidation.clearEmployerGridCaches();

    res.json({ success: true, filePath: documentBase64, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAuthorizationLetter = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const documentBase64 = fileToBase64(req.file);
    
    const newDocument = {
      fileName: req.file.originalname,
      fileData: documentBase64,
      uploadedAt: new Date(),
      companyName: req.body.companyName || ''
    };

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { $push: { authorizationLetters: newDocument } },
      { new: true, upsert: true }
    );

    res.json({ success: true, document: newDocument, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAuthorizationLetter = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { $pull: { authorizationLetters: { _id: documentId } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, message: 'Authorization letter deleted successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAuthorizationCompanies = async (req, res) => {
  try {
    const { authorizationLetters } = req.body;
    
    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { authorizationLetters },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, message: 'Authorization company names updated successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const { fileToBase64 } = require('../middlewares/upload');
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    const currentGallery = profile?.gallery || [];

    if (currentGallery.length + req.files.length > 10) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot upload ${req.files.length} images. Maximum 10 images allowed. Current: ${currentGallery.length}` 
      });
    }

    const newImages = req.files.map(file => ({
      url: fileToBase64(file),
      fileName: file.originalname,
      uploadedAt: new Date()
    }));

    const updatedProfile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { $push: { gallery: { $each: newImages } } },
      { new: true, upsert: true }
    );

    res.json({ success: true, gallery: updatedProfile.gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId: req.user._id },
      { $pull: { gallery: { _id: imageId } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, message: 'Gallery image deleted successfully', gallery: profile.gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Job Management Controllers
exports.createJob = async (req, res) => {
  try {
    // Check if company profile is complete
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    
    if (!profile) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please complete your company profile before posting jobs.',
        requiresProfile: true
      });
    }

    // Check required profile fields - be more flexible with validation
    const requiredFields = ['companyName', 'description', 'location', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => {
      const value = profile[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    // Log for debugging
    console.log('Profile validation check:', {
      companyName: profile.companyName,
      description: profile.description,
      location: profile.location,
      phone: profile.phone,
      email: profile.email,
      missingFields
    });
    
    if (missingFields.length > 0) {
      return res.status(403).json({ 
        success: false, 
        message: `Please complete your company profile. Missing fields: ${missingFields.join(', ')}`,
        requiresProfile: true,
        missingFields
      });
    }

    // Check if employer is approved by admin
    if (!req.user.isApproved) {
      const employer = await Employer.findById(req.user._id);
      if (!employer.profileSubmittedForReview) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please complete and save your company profile first to submit it for admin review.',
          requiresProfile: true
        });
      }
      return res.status(403).json({ 
        success: false, 
        message: 'Your company profile is under admin review. You can post jobs once approved by admin.',
        requiresApproval: true
      });
    }

    const jobData = { ...req.body, employerId: req.user._id, status: 'active' };
    
    console.log('=== FULL REQUEST BODY DEBUG ===');
    console.log('Full req.body:', JSON.stringify(req.body, null, 2));
    console.log('jobData keys:', Object.keys(jobData));
    console.log('=== END FULL DEBUG ===');
    
    // Handle rolesAndResponsibilities field conversion
    console.log('=== DEBUG ROLES & RESPONSIBILITIES ===');
    console.log('rolesAndResponsibilities field:', jobData.rolesAndResponsibilities);
    console.log('rolesAndResponsibilities type:', typeof jobData.rolesAndResponsibilities);
    console.log('rolesAndResponsibilities length:', jobData.rolesAndResponsibilities ? jobData.rolesAndResponsibilities.length : 0);
    
    if (jobData.rolesAndResponsibilities && typeof jobData.rolesAndResponsibilities === 'string') {
      // Convert rich text to array of responsibilities
      // Remove HTML tags and split by line breaks or bullet points
      let cleanText = jobData.rolesAndResponsibilities
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      console.log('Clean text after processing:', cleanText);
      console.log('Clean text length:', cleanText.length);
      
      if (cleanText && cleanText.length > 0) {
        // Try multiple splitting strategies
        let responsibilities = [];
        
        // First try splitting by common patterns
        if (cleanText.includes('\n')) {
          // Split by line breaks
          responsibilities = cleanText
            .split(/\n|\r\n|\r/)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*•]\s*/, '')); // Remove bullet points
        } else if (cleanText.includes('.') && cleanText.split('.').length > 2) {
          // Split by periods if multiple sentences
          responsibilities = cleanText
            .split('.')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*•]\s*/, ''));
        } else {
          // Use the entire text as a single responsibility
          responsibilities = [cleanText];
        }
        
        console.log('Final responsibilities array:', responsibilities);
        jobData.responsibilities = responsibilities;
      } else {
        console.log('Clean text is empty, setting empty responsibilities array');
        jobData.responsibilities = [];
      }
      
      // Remove the original field to avoid confusion
      delete jobData.rolesAndResponsibilities;
    } else {
      console.log('No valid rolesAndResponsibilities field found in jobData');
      jobData.responsibilities = [];
    }
    console.log('Final jobData.responsibilities:', jobData.responsibilities);
    console.log('=== END DEBUG ===');
    
    // Map assignedAssessment to assessmentId
    if (jobData.assignedAssessment) {
      jobData.assessmentId = jobData.assignedAssessment;
      delete jobData.assignedAssessment;
    }
    
    // Handle nested assessment object from frontend
    if (jobData.assessment && jobData.assessment.assessmentId) {
      jobData.assessmentId = jobData.assessment.assessmentId;
      if (jobData.assessment.fromDate) jobData.assessmentStartDate = jobData.assessment.fromDate;
      if (jobData.assessment.toDate) jobData.assessmentEndDate = jobData.assessment.toDate;
      delete jobData.assessment;
    }

    // If assessment is selected, automatically enable technical interview round
    if (jobData.assessmentId) {
      if (!jobData.interviewRoundTypes) {
        jobData.interviewRoundTypes = {
          technical: false,
          managerial: false,
          nonTechnical: false,
          final: false,
          hr: false
        };
      }
      jobData.interviewRoundTypes.technical = true;
      // Set interview rounds count if not set
      if (!jobData.interviewRoundsCount || jobData.interviewRoundsCount < 1) {
        jobData.interviewRoundsCount = 1;
      }
    }

    // Remove assessment from interviewRoundTypes (it's stored separately in assessmentId)
    if (jobData.interviewRoundTypes && jobData.interviewRoundTypes.assessment) {
      delete jobData.interviewRoundTypes.assessment;
    }
    
    // Ensure interviewRoundOrder is properly handled
    if (!jobData.interviewRoundOrder) {
      jobData.interviewRoundOrder = [];
    }
    
    // Process and validate interview round details dates
    if (jobData.interviewRoundDetails) {
      Object.keys(jobData.interviewRoundDetails).forEach(roundKey => {
        const roundDetails = jobData.interviewRoundDetails[roundKey];
        if (roundDetails) {
          // Convert date strings to Date objects for proper storage
          if (roundDetails.fromDate && typeof roundDetails.fromDate === 'string') {
            roundDetails.fromDate = new Date(roundDetails.fromDate);
          }
          if (roundDetails.toDate && typeof roundDetails.toDate === 'string') {
            roundDetails.toDate = new Date(roundDetails.toDate);
          }
          
          // Validate date range
          if (roundDetails.fromDate && roundDetails.toDate && 
              roundDetails.fromDate > roundDetails.toDate) {
            throw new Error(`Invalid date range for ${roundKey}: From Date cannot be after To Date`);
          }
        }
      });
    }
    
    // Parse CTC from string format to proper structure
    if (jobData.ctc && typeof jobData.ctc === 'string') {
      const ctcStr = jobData.ctc.trim();
      const rangeMatch = ctcStr.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/i);
      if (rangeMatch) {
        jobData.ctc = {
          min: parseFloat(rangeMatch[1]) * 100000,
          max: parseFloat(rangeMatch[2]) * 100000
        };
      } else {
        const singleValue = parseFloat(ctcStr.replace(/[^\d.]/g, ''));
        if (singleValue && singleValue > 0) {
          jobData.ctc = {
            min: singleValue * 100000,
            max: singleValue * 100000
          };
        }
      }
    }
    
    if (jobData.netSalary && typeof jobData.netSalary === 'string') {
      const netMatch = jobData.netSalary.match(/(\d+(?:,\d+)*)\s*(?:-|to)?\s*(\d+(?:,\d+)*)?/i);
      if (netMatch) {
        jobData.netSalary = {
          min: parseInt(netMatch[1].replace(/,/g, '')),
          max: parseInt((netMatch[2] || netMatch[1]).replace(/,/g, ''))
        };
      }
    }
    
    console.log('Creating job with data:', JSON.stringify(jobData, null, 2)); // Debug log
    console.log('Company fields:', {
      companyLogo: jobData.companyLogo ? 'Present' : 'Missing',
      companyName: jobData.companyName,
      companyDescription: jobData.companyDescription ? 'Present' : 'Missing',
      category: jobData.category,
      typeOfEmployment: jobData.typeOfEmployment
    });
    console.log('Parsed CTC:', jobData.ctc);
    console.log('Parsed Net Salary:', jobData.netSalary);
    
    // Check if interview rounds are scheduled
    const hasScheduledRounds = jobData.interviewRoundDetails && 
      Object.values(jobData.interviewRoundDetails).some(round => 
        round && (round.date || round.fromDate) && round.time && round.description
      );
    
    console.log('Interview rounds scheduled check:', {
      hasScheduledRounds,
      interviewRoundDetails: jobData.interviewRoundDetails
    });
    
    if (hasScheduledRounds) {
      jobData.interviewScheduled = true;
    }
    
    const job = await Job.create(jobData);
    console.log('Job created successfully with typeOfEmployment:', job.typeOfEmployment);
    console.log('Job created:', JSON.stringify(job, null, 2));

    // If job has assessment, update existing applications to set assessmentStatus to 'available'
    if (job.assessmentId) {
      try {
        await Application.updateMany(
          { jobId: job._id },
          { assessmentStatus: 'available' }
        );
        console.log('Updated existing applications with assessment status');
      } catch (updateError) {
        console.error('Error updating existing applications:', updateError);
        // Don't fail job creation if this update fails
      }
    }

    // Clear job-related caches immediately
    cacheInvalidation.clearJobCaches();

    // Notifications are sent to candidates when they apply for jobs
    // No need to create general notifications here

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Job creation error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`);
      return res.status(400).json({ success: false, message: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    console.log('Update job request body:', req.body);
    console.log('Job ID:', req.params.jobId);
    
    const oldJob = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
    if (!oldJob) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Handle rolesAndResponsibilities field conversion
    console.log('=== UPDATE JOB - DEBUG ROLES & RESPONSIBILITIES ===');
    console.log('rolesAndResponsibilities field:', req.body.rolesAndResponsibilities);
    console.log('rolesAndResponsibilities type:', typeof req.body.rolesAndResponsibilities);
    console.log('rolesAndResponsibilities length:', req.body.rolesAndResponsibilities ? req.body.rolesAndResponsibilities.length : 0);
    
    if (req.body.rolesAndResponsibilities && typeof req.body.rolesAndResponsibilities === 'string') {
      // Convert rich text to array of responsibilities
      // Remove HTML tags and split by line breaks or bullet points
      let cleanText = req.body.rolesAndResponsibilities
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      console.log('Clean text after processing:', cleanText);
      console.log('Clean text length:', cleanText.length);
      
      if (cleanText && cleanText.length > 0) {
        // Try multiple splitting strategies
        let responsibilities = [];
        
        // First try splitting by common patterns
        if (cleanText.includes('\n')) {
          // Split by line breaks
          responsibilities = cleanText
            .split(/\n|\r\n|\r/)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*•]\s*/, '')); // Remove bullet points
        } else if (cleanText.includes('.') && cleanText.split('.').length > 2) {
          // Split by periods if multiple sentences
          responsibilities = cleanText
            .split('.')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[\u2022\-\*•]\s*/, ''));
        } else {
          // Use the entire text as a single responsibility
          responsibilities = [cleanText];
        }
        
        console.log('Final responsibilities array:', responsibilities);
        req.body.responsibilities = responsibilities;
      } else {
        console.log('Clean text is empty, setting empty responsibilities array');
        req.body.responsibilities = [];
      }
      
      // Remove the original field to avoid confusion
      delete req.body.rolesAndResponsibilities;
    } else {
      console.log('No valid rolesAndResponsibilities field found in req.body');
      req.body.responsibilities = [];
    }
    console.log('Final req.body.responsibilities:', req.body.responsibilities);
    console.log('=== END UPDATE DEBUG ===');
    
    // Parse CTC from string format to proper structure
    if (req.body.ctc && typeof req.body.ctc === 'string') {
      const ctcStr = req.body.ctc.trim();
      const rangeMatch = ctcStr.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/i);
      if (rangeMatch) {
        req.body.ctc = {
          min: parseFloat(rangeMatch[1]) * 100000,
          max: parseFloat(rangeMatch[2]) * 100000
        };
      } else {
        const singleValue = parseFloat(ctcStr.replace(/[^\d.]/g, ''));
        if (singleValue && singleValue > 0) {
          req.body.ctc = {
            min: singleValue * 100000,
            max: singleValue * 100000
          };
        }
      }
    }
    
    if (req.body.netSalary && typeof req.body.netSalary === 'string') {
      const netMatch = req.body.netSalary.match(/(\d+(?:,\d+)*)\s*(?:-|to)?\s*(\d+(?:,\d+)*)?/i);
      if (netMatch) {
        req.body.netSalary = {
          min: parseInt(netMatch[1].replace(/,/g, '')),
          max: parseInt((netMatch[2] || netMatch[1]).replace(/,/g, ''))
        };
      }
    }
    
    // Check if interview rounds are being scheduled/updated
    const hasScheduledRounds = req.body.interviewRoundDetails && 
      Object.values(req.body.interviewRoundDetails).some(round => 
        round && (round.date || round.fromDate) && round.time && round.description
      );
    
    console.log('Update job - Interview rounds scheduled check:', {
      hasScheduledRounds,
      interviewRoundDetails: req.body.interviewRoundDetails
    });
    
    const wasScheduled = oldJob.interviewScheduled;
    
    if (hasScheduledRounds) {
      req.body.interviewScheduled = true;
    }
    
    // Map assignedAssessment to assessmentId
    if (req.body.assignedAssessment) {
      req.body.assessmentId = req.body.assignedAssessment;
      delete req.body.assignedAssessment;
    }
    
    // Handle nested assessment object from frontend
    if (req.body.assessment && req.body.assessment.assessmentId) {
      req.body.assessmentId = req.body.assessment.assessmentId;
      if (req.body.assessment.fromDate) req.body.assessmentStartDate = req.body.assessment.fromDate;
      if (req.body.assessment.toDate) req.body.assessmentEndDate = req.body.assessment.toDate;
      delete req.body.assessment;
    }
    
    // Remove assessment from interviewRoundTypes (it's stored separately in assessmentId)
    if (req.body.interviewRoundTypes && req.body.interviewRoundTypes.assessment) {
      delete req.body.interviewRoundTypes.assessment;
    }
    
    // Ensure interviewRoundOrder is included in the update
    if (req.body.interviewRoundOrder) {
      // Keep the interview round order as provided from frontend
    }
    
    // Ensure interviewRoundDetails is properly set
    if (req.body.interviewRoundDetails) {
      // Process and validate interview round details dates
      Object.keys(req.body.interviewRoundDetails).forEach(key => {
        const round = req.body.interviewRoundDetails[key];
        if (!round || (!round.description && !round.fromDate && !round.toDate && !round.time)) {
          delete req.body.interviewRoundDetails[key];
        } else {
          // Convert date strings to Date objects for proper storage
          if (round.fromDate && typeof round.fromDate === 'string') {
            round.fromDate = new Date(round.fromDate);
          }
          if (round.toDate && typeof round.toDate === 'string') {
            round.toDate = new Date(round.toDate);
          }
          
          // Validate date range
          if (round.fromDate && round.toDate && round.fromDate > round.toDate) {
            throw new Error(`Invalid date range for ${key}: From Date cannot be after To Date`);
          }
        }
      });
    }
    
    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, employerId: req.user._id },
      req.body,
      { new: true, runValidators: false }
    );

    // If assessment was added to the job, update existing applications
    if (!oldJob.assessmentId && job.assessmentId) {
      try {
        await Application.updateMany(
          { jobId: job._id },
          { assessmentStatus: 'available' }
        );
        console.log('Updated existing applications with assessment status after job update');
      } catch (updateError) {
        console.error('Error updating existing applications after job update:', updateError);
      }
    }

    // Clear job-related caches immediately
    cacheInvalidation.clearJobCaches();
    // Also clear candidate application caches to ensure they see updated job data
    cacheInvalidation.clearCandidateApplicationCaches();

    // Notify only candidates who have applied for this job
    if (hasScheduledRounds) {
      try {
        const { createNotification } = require('./notificationController');
        const applications = await Application.find({ jobId: job._id }).select('candidateId');
        
        for (const app of applications) {
          await createNotification({
            title: wasScheduled ? 'Interview Schedule Updated' : 'Interview Rounds Scheduled',
            message: wasScheduled ? `Interview schedule has been updated for ${job.title} position at ${req.user.companyName}` : `Interview rounds have been scheduled for ${job.title} position at ${req.user.companyName}`,
            type: wasScheduled ? 'interview_updated' : 'interview_scheduled',
            role: 'candidate',
            relatedId: job._id,
            candidateId: app.candidateId,
            createdBy: req.user._id
          });
        }
      } catch (notifError) {
        console.error('Notification creation failed:', notifError);
      }
    }

    console.log('Updated job with typeOfEmployment:', job.typeOfEmployment);
    console.log('Updated job:', job);
    res.json({ success: true, job });
  } catch (error) {
    console.error('Update job error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`);
      return res.status(400).json({ success: false, message: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ 
      _id: req.params.jobId, 
      employerId: req.user._id 
    });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Clear job-related caches immediately
    cacheInvalidation.clearJobCaches();

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Application Management Controllers
exports.reviewApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.applicationId,
      employerId: req.user._id
    })
    .populate('candidateId', 'name email phone')
    .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const application = await Application.findOneAndUpdate(
      { _id: req.params.applicationId, employerId: req.user._id },
      { 
        status,
        $push: {
          statusHistory: {
            status,
            changedBy: req.user._id,
            changedByModel: 'Employer',
            notes
          }
        }
      },
      { new: true }
    ).populate('candidateId', 'name email')
    .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    try {
      const { createNotification } = require('./notificationController');
      const statusLabels = {
        pending: 'Pending',
        shortlisted: 'Shortlisted',
        interviewed: 'Interviewed',
        hired: 'Hired',
        rejected: 'Rejected',
        not_attended: 'Not Attended',
        offer_shared: 'Offer Shared'
      };
      const statusLabel = statusLabels[status] || status;
      const trimmedNotes = typeof notes === 'string' ? notes.trim() : '';
      const jobTitle = application.jobId?.title || 'the position';
      const candidateName = application.candidateId?.name || 'Candidate';

      if (application.candidateId?._id) {
        let candidateMessage = `Your application for ${jobTitle} is now ${statusLabel}.`;
        if (trimmedNotes) {
          candidateMessage += ` Employer note: ${trimmedNotes}`;
        }
        await createNotification({
          title: 'Application Status Updated',
          message: candidateMessage,
          type: 'application_status_updated',
          role: 'candidate',
          relatedId: application._id,
          candidateId: application.candidateId._id,
          createdBy: req.user._id
        });
      }

      let employerMessage = `${candidateName}'s application for ${jobTitle} is now ${statusLabel}.`;
      if (trimmedNotes) {
        employerMessage += ` Notes: ${trimmedNotes}`;
      }
      await createNotification({
        title: 'Application Status Updated',
        message: employerMessage,
        type: 'application_status_updated',
        role: 'employer',
        relatedId: application._id,
        createdBy: req.user._id
      });
    } catch (notificationError) {
      console.error('Application status notification failed:', notificationError);
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Message Controllers
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const conversationId = [req.user._id, receiverId].sort().join('-');
    
    const newMessage = await Message.create({
      senderId: req.user._id,
      senderModel: 'Employer',
      receiverId,
      receiverModel: 'Candidate',
      message,
      conversationId
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name companyName')
      .populate('receiverId', 'name')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Subscription Management Controllers
exports.createSubscription = async (req, res) => {
  try {
    const { plan, paymentData } = req.body;
    
    const subscription = await Subscription.findOneAndUpdate(
      { employerId: req.user._id },
      { 
        plan,
        $push: { paymentHistory: paymentData }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ employerId: req.user._id });
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { employerId: req.user._id },
      req.body,
      { new: true }
    );

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const employerId = req.user._id;
    
    const totalJobs = await Job.countDocuments({ employerId });
    const activeJobs = await Job.countDocuments({ employerId, status: 'active' });
    const totalApplications = await Application.countDocuments({ employerId });
    const shortlisted = await Application.countDocuments({ employerId, status: 'shortlisted' });
    
    res.json({
      success: true,
      stats: { totalJobs, activeJobs, totalApplications, shortlisted },
      employer: { companyName: req.user.companyName }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployerApplications = async (req, res) => {
  try {
    const CandidateProfile = require('../models/CandidateProfile');
    const { companyName } = req.query; // Filter by company name for consultants
    
    let query = { employerId: req.user._id };
    
    // If companyName filter is provided (for consultants)
    if (companyName && companyName.trim() !== '') {
      const jobs = await Job.find({ 
        employerId: req.user._id, 
        companyName: new RegExp(companyName, 'i') 
      }).select('_id');
      const jobIds = jobs.map(job => job._id);
      query.jobId = { $in: jobIds };
    }
    
    const applications = await Application.find(query)
      .populate('candidateId', 'name email phone')
      .populate('jobId', 'title location companyName')
      .sort({ createdAt: -1 });

    // Add profile pictures to applications
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (application) => {
        const candidateProfile = await CandidateProfile.findOne({ candidateId: application.candidateId._id });
        return {
          ...application.toObject(),
          candidateId: {
            ...application.candidateId.toObject(),
            profilePicture: candidateProfile?.profilePicture
          }
        };
      })
    );

    res.json({ success: true, applications: applicationsWithProfiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const CandidateProfile = require('../models/CandidateProfile');
    const { jobId } = req.params;
    
    // Verify job belongs to employer
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    const applications = await Application.find({ jobId, employerId: req.user._id })
      .populate('candidateId', 'name email phone')
      .populate('jobId', 'title location companyName')
      .sort({ createdAt: -1 });

    // Add profile pictures to applications
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (application) => {
        const candidateProfile = await CandidateProfile.findOne({ candidateId: application.candidateId._id });
        return {
          ...application.toObject(),
          candidateId: {
            ...application.candidateId.toObject(),
            profilePicture: candidateProfile?.profilePicture
          }
        };
      })
    );

    res.json({ success: true, applications: applicationsWithProfiles, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const CandidateProfile = require('../models/CandidateProfile');
    const AssessmentAttempt = require('../models/AssessmentAttempt');
    
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    })
    .populate('candidateId', 'name email phone')
    .populate('jobId', 'title location interviewRoundsCount interviewRoundTypes interviewRoundOrder interviewRoundDetails assessmentId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Get candidate profile data
    const candidateProfile = await CandidateProfile.findOne({ candidateId: application.candidateId._id });
    
    // Get assessment attempt details if job has assessment
    let assessmentAttempt = null;
    if (application.jobId?.assessmentId) {
      assessmentAttempt = await AssessmentAttempt.findOne({
        candidateId: application.candidateId._id,
        assessmentId: application.jobId.assessmentId
      }).populate('assessmentId', 'title timer totalQuestions passingPercentage');
    }
    
    // Merge candidate and profile data
    const candidateData = {
      ...application.candidateId.toObject(),
      ...candidateProfile?.toObject()
    };

    const responseApplication = {
      ...application.toObject(),
      candidateId: candidateData,
      assessmentAttempt: assessmentAttempt,
      jobId: {
        ...application.jobId.toObject(),
        assessmentId: application.jobId.assessmentId
      }
    };

    res.json({ success: true, application: responseApplication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConsultantCompanies = async (req, res) => {
  try {
    const companies = await Job.distinct('companyName', { 
      employerId: req.user._id,
      companyName: { $exists: true, $ne: null, $ne: '' }
    });
    
    res.json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveInterviewReview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { interviewRounds, remarks, isSelected } = req.body;
    
    const application = await Application.findOneAndUpdate(
      { _id: applicationId, employerId: req.user._id },
      { 
        interviewRounds,
        employerRemarks: remarks,
        isSelectedForProcess: isSelected,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('candidateId', 'name email')
    .populate('jobId', 'title');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    res.json({ success: true, message: 'Interview review saved successfully', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfileCompletion = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    const employer = await Employer.findById(req.user._id);
    
    if (!profile) {
      return res.json({ 
        success: true, 
        completion: 0, 
        missingFields: ['All profile fields'],
        isApproved: employer?.isApproved || false,
        profileSubmittedForReview: employer?.profileSubmittedForReview || false,
        canPostJobs: false,
        message: 'Please complete your company profile to post jobs.'
      });
    }
    
    // Comprehensive list of fields for profile completion calculation
    const profileFields = {
      // Basic required fields (weight: 2 each)
      companyName: { weight: 2, required: true },
      description: { weight: 2, required: true },
      location: { weight: 2, required: true },
      phone: { weight: 2, required: true },
      email: { weight: 2, required: true },
      
      // Important additional fields (weight: 1.5 each)
      website: { weight: 1.5, required: false },
      establishedSince: { weight: 1.5, required: false },
      teamSize: { weight: 1.5, required: false },
      industrySector: { weight: 1.5, required: false },
      companyType: { weight: 1.5, required: false },
      corporateAddress: { weight: 1.5, required: false },
      
      // Optional fields (weight: 1 each)
      whyJoinUs: { weight: 1, required: false },
      logo: { weight: 1, required: false },
      coverImage: { weight: 1, required: false },
      
      // Contact details (weight: 1 each)
      contactFullName: { weight: 1, required: false },
      contactDesignation: { weight: 1, required: false },
      contactOfficialEmail: { weight: 1, required: false },
      contactMobile: { weight: 1, required: false }
    };
    
    let totalWeight = 0;
    let completedWeight = 0;
    const missingFields = [];
    const missingRequiredFields = [];
    
    // Calculate completion based on weighted fields
    Object.keys(profileFields).forEach(field => {
      const fieldConfig = profileFields[field];
      const value = profile[field];
      const isCompleted = value && (typeof value !== 'string' || value.trim() !== '');
      
      totalWeight += fieldConfig.weight;
      
      if (isCompleted) {
        completedWeight += fieldConfig.weight;
      } else {
        missingFields.push(field);
        if (fieldConfig.required) {
          missingRequiredFields.push(field);
        }
      }
    });
    
    // Calculate percentage based on weighted completion
    const completion = Math.round((completedWeight / totalWeight) * 100);
    
    // Log for debugging
    console.log('Profile completion check:', {
      companyName: profile.companyName ? 'Present' : 'Missing',
      description: profile.description ? 'Present' : 'Missing',
      location: profile.location ? 'Present' : 'Missing',
      phone: profile.phone ? 'Present' : 'Missing',
      email: profile.email ? 'Present' : 'Missing',
      completedWeight,
      totalWeight,
      completion,
      missingRequiredFields,
      totalMissingFields: missingFields.length
    });
    
    const isProfileComplete = missingRequiredFields.length === 0;
    const isApproved = employer?.isApproved || false;
    const profileSubmittedForReview = employer?.profileSubmittedForReview || false;
    const canPostJobs = isProfileComplete && isApproved;
    
    let message = '';
    if (missingRequiredFields.length > 0) {
      message = "Kindly complete your profile and wait for the admin's approval.";
    } else if (!profileSubmittedForReview) {
      message = 'Your profile is complete. Save your profile to submit it for admin review.';
    } else if (profileSubmittedForReview && !isApproved) {
      message = 'Thank you for completing your profile! Your profile has been submitted for admin review.';
    } else {
      message = 'Thank you for completing your profile! Your profile is approved and you can now post jobs.';
    }
    
    res.json({ 
      success: true, 
      completion, 
      missingFields: missingRequiredFields, // Only return required missing fields for UI
      allMissingFields: missingFields, // All missing fields for reference
      isProfileComplete,
      isApproved,
      profileSubmittedForReview,
      canPostJobs,
      message
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.json({ 
      success: true, 
      completion: 0, 
      missingFields: ['Profile data'],
      isApproved: false,
      profileSubmittedForReview: false,
      canPostJobs: false,
      message: 'Error loading profile status.'
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const activities = [];
    
    // Recent applications
    const recentApplications = await Application.find({ employerId: req.user._id })
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(3);
    
    recentApplications.forEach(app => {
      activities.push({
        type: 'application',
        title: 'New application received',
        description: `Application for ${app.jobId?.title || 'Unknown Job'}`,
        time: app.createdAt,
        icon: '👤'
      });
    });
    
    // Recent job posts
    const recentJobs = await Job.find({ employerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(2);
    
    recentJobs.forEach(job => {
      activities.push({
        type: 'job',
        title: 'Job post created',
        description: `${job.title} position posted`,
        time: job.createdAt,
        icon: '💼'
      });
    });
    
    // Sort by time and limit to 5
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, 5);
    
    res.json({ success: true, activities: limitedActivities });
  } catch (error) {
    res.json({ success: true, activities: [] });
  }
};

// Notification Controllers
exports.getNotifications = async (req, res) => {
  try {
    const { getNotificationsByRole } = require('./notificationController');
    req.params.role = 'employer';
    return getNotificationsByRole(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { markAsRead } = require('./notificationController');
    return markAsRead(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { markAllAsRead } = require('./notificationController');
    req.params.role = 'employer';
    return markAllAsRead(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test endpoint to verify interview date persistence
exports.testInterviewDates = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Find the job and return its interview round details
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Return detailed information about the stored dates
    const dateInfo = {};
    if (job.interviewRoundDetails) {
      Object.keys(job.interviewRoundDetails).forEach(roundKey => {
        const round = job.interviewRoundDetails[roundKey];
        dateInfo[roundKey] = {
          description: round.description,
          fromDate: {
            value: round.fromDate,
            type: typeof round.fromDate,
            isDate: round.fromDate instanceof Date,
            formatted: round.fromDate ? new Date(round.fromDate).toISOString().split('T')[0] : null
          },
          toDate: {
            value: round.toDate,
            type: typeof round.toDate,
            isDate: round.toDate instanceof Date,
            formatted: round.toDate ? new Date(round.toDate).toISOString().split('T')[0] : null
          },
          time: round.time
        };
      });
    }
    
    res.json({ 
      success: true, 
      jobId: job._id,
      jobTitle: job.title,
      interviewRoundOrder: job.interviewRoundOrder,
      dateInfo 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.scheduleInterviewRound = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { roundKey, roundType, description, fromDate, toDate, time, assessmentId } = req.body;
    
    // Find the job
    const job = await Job.findOne({ _id: jobId, employerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Validate required fields
    if (!roundKey || !roundType) {
      return res.status(400).json({ success: false, message: 'Round key and type are required' });
    }
    
    if (!fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'From date and to date are required' });
    }
    
    // Validate date range
    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ success: false, message: 'From date cannot be after to date' });
    }
    
    // For non-assessment rounds, require description and time
    if (roundType !== 'assessment') {
      if (!description?.trim()) {
        return res.status(400).json({ success: false, message: 'Description is required for interview rounds' });
      }
      if (!time) {
        return res.status(400).json({ success: false, message: 'Time is required for interview rounds' });
      }
    }
    
    // For assessment rounds, require assessment ID
    if (roundType === 'assessment' && !assessmentId) {
      return res.status(400).json({ success: false, message: 'Assessment ID is required for assessment rounds' });
    }
    
    // Update the job with the scheduled round details
    const updateData = {
      [`interviewRoundDetails.${roundKey}`]: {
        description: description || '',
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        time: time || ''
      },
      interviewScheduled: true
    };
    
    // If it's an assessment round, also update assessment fields
    if (roundType === 'assessment') {
      updateData.assessmentId = assessmentId;
      updateData.assessmentStartDate = new Date(fromDate);
      updateData.assessmentEndDate = new Date(toDate);
    }
    
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, employerId: req.user._id },
      updateData,
      { new: true }
    );
    
    // Notify only candidates who have applied for this job
    try {
      const { createNotification } = require('./notificationController');
      const roundNames = {
        technical: 'Technical Round',
        nonTechnical: 'Non-Technical Round',
        managerial: 'Managerial Round',
        final: 'Final Round',
        hr: 'HR Round',
        assessment: 'Assessment'
      };
      
      const roundName = roundNames[roundType] || roundType;
      const applications = await Application.find({ jobId: job._id }).select('candidateId');
      
      for (const app of applications) {
        await createNotification({
          title: `${roundName} Scheduled`,
          message: `${roundName} has been scheduled for ${job.title} position from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`,
          type: 'interview_scheduled',
          role: 'candidate',
          relatedId: job._id,
          candidateId: app.candidateId,
          createdBy: req.user._id
        });
      }
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }
    
    res.json({ 
      success: true, 
      message: `${roundType === 'assessment' ? 'Assessment' : 'Interview round'} scheduled successfully`,
      job: updatedJob
    });
  } catch (error) {
    console.error('Schedule interview round error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Interview Email Controllers
exports.sendInterviewInvite = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { interviewDate, interviewTime, meetingLink, instructions } = req.body;
    
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    })
    .populate('candidateId', 'name email')
    .populate('jobId', 'title');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Send email using nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: application.candidateId.email,
      subject: `Interview Invitation - ${application.jobId.title}`,
      html: `
        <h2>Interview Invitation</h2>
        <p>Dear ${application.candidateId.name},</p>
        <p>We would like to invite you for an interview for the position of <strong>${application.jobId.title}</strong>.</p>
        <p><strong>Preferred Date:</strong> ${new Date(interviewDate).toLocaleDateString()}</p>
        <p><strong>Preferred Time:</strong> ${interviewTime}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        ${instructions ? `<p><strong>Instructions:</strong> ${instructions}</p>` : ''}
        <p>Please reply with your available time slots if the suggested time doesn't work for you.</p>
        <p>Best regards,<br>${req.user.companyName}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Save interview invite details to application
    await Application.findByIdAndUpdate(applicationId, {
      interviewInvite: {
        sentAt: new Date(),
        proposedDate: interviewDate,
        proposedTime: interviewTime,
        meetingLink,
        instructions,
        status: 'pending'
      }
    });
    
    res.json({ success: true, message: 'Interview invite sent successfully' });
  } catch (error) {
    console.error('Send interview invite error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { confirmedDate, confirmedTime } = req.body;
    
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    })
    .populate('candidateId', 'name email')
    .populate('jobId', 'title');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Send confirmation email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: application.candidateId.email,
      subject: `Interview Confirmed - ${application.jobId.title}`,
      html: `
        <h2>Interview Confirmed</h2>
        <p>Dear ${application.candidateId.name},</p>
        <p>Your interview for the position of <strong>${application.jobId.title}</strong> has been confirmed.</p>
        <p><strong>Date:</strong> ${new Date(confirmedDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${confirmedTime}</p>
        <p>We look forward to meeting you!</p>
        <p>Best regards,<br>${req.user.companyName}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Update application with confirmed schedule
    await Application.findByIdAndUpdate(applicationId, {
      'interviewInvite.status': 'confirmed',
      'interviewInvite.confirmedDate': confirmedDate,
      'interviewInvite.confirmedTime': confirmedTime,
      'interviewInvite.confirmedAt': new Date()
    });
    
    res.json({ success: true, message: 'Interview schedule confirmed and email sent' });
  } catch (error) {
    console.error('Confirm interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInterviewResponse = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({
      _id: applicationId,
      employerId: req.user._id
    }).select('interviewInvite candidateResponse');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    res.json({ 
      success: true, 
      interviewInvite: application.interviewInvite,
      candidateResponse: application.candidateResponse 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
