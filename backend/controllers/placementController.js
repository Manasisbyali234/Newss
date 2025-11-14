const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Placement = require('../models/Placement');
const Candidate = require('../models/Candidate');
const CandidateProfile = require('../models/CandidateProfile');
const { createNotification } = require('./notificationController');
const { sendWelcomeEmail } = require('../utils/emailService');
const XLSX = require('xlsx');
const { base64ToBuffer } = require('../utils/base64Helper');
const { emitCreditUpdate, emitBulkCreditUpdate } = require('../utils/websocket');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.registerPlacement = async (req, res) => {
  try {
    const { name, email, password, phone, collegeName, sendWelcomeEmail: shouldSendEmail } = req.body;

    const existingPlacement = await Placement.findOne({ email });
    if (existingPlacement) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // If sendWelcomeEmail is true, create placement without password
    if (shouldSendEmail) {
      if (!name || !email || !phone || !collegeName) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, email, phone, and college name are required' 
        });
      }

      const placementData = { 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        phone: phone.trim(), 
        collegeName: collegeName.trim()
      };
      const placement = await Placement.create(placementData);
      
      // Create notification for admin
      try {
        await createNotification({
          title: 'New Placement Officer Registration',
          message: `${placement.name} from ${placement.collegeName} has registered as a placement officer.`,
          type: 'placement_registered',
          role: 'admin',
          relatedId: placement._id,
          createdBy: placement._id
        });
      } catch (notifError) {
        console.error('Failed to create registration notification:', notifError);
      }

      // Send welcome email with password creation link
      try {
        await sendWelcomeEmail(placement.email, placement.name, 'placement');
      } catch (emailError) {
        console.error('Welcome email failed for placement officer:', emailError);
        return res.status(500).json({ success: false, message: 'Failed to send welcome email' });
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to create your password.'
      });
    }

    // Original registration with password
    if (!name || !email || !password || !phone || !collegeName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required: name, email, password, phone, collegeName' 
      });
    }

    const placementData = { 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: password.trim(), 
      phone: phone.trim(), 
      collegeName: collegeName.trim() 
    };
    const placement = await Placement.create(placementData);
    
    // Create notification for admin
    try {
      await createNotification({
        title: 'New Placement Officer Registration',
        message: `${placement.name} from ${placement.collegeName} has registered as a placement officer.`,
        type: 'placement_registered',
        role: 'admin',
        relatedId: placement._id,
        createdBy: placement._id
      });
    } catch (notifError) {
      console.error('Failed to create registration notification:', notifError);
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(placement.email, placement.name, 'placement');
    } catch (emailError) {
      console.error('Welcome email failed for placement officer:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for admin approval before you can sign in.',
      placement: {
        id: placement._id,
        name: placement.name,
        email: placement.email,
        phone: placement.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const placement = await Placement.findOne({ email: normalizedEmail });

    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    if (placement.password) {
      return res.status(400).json({ success: false, message: 'Password already set' });
    }

    placement.password = password;
    placement.status = 'active';
    await placement.save();

    res.json({ success: true, message: 'Password created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload student data file after registration
exports.uploadStudentData = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { customFileName } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('File upload:', {
      originalname: req.file.originalname,
      customFileName: customFileName,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate file content before processing
    const { validateExcelContent } = require('../middlewares/upload');
    const validation = validateExcelContent(req.file.buffer, req.file.mimetype);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: `${validation.message}. Please upload a file with actual student data.` 
      });
    }
    
    console.log(`File validation passed: ${validation.rowCount} rows found`);

    const { fileToBase64 } = require('../middlewares/upload');
    const studentData = fileToBase64(req.file);
    
    // Removed console debug line for security;
    
    // Add to file history with file data and custom name
    const placement = await Placement.findByIdAndUpdate(placementId, {
      $push: {
        fileHistory: {
          fileName: req.file.originalname,
          customName: customFileName && customFileName.trim() ? customFileName.trim() : null,
          uploadedAt: new Date(),
          status: 'pending',
          fileData: studentData,
          fileType: req.file.mimetype,
          credits: 0
        }
      }
    }, { new: true });
    
    console.log('File added to history, total files:', placement.fileHistory.length);

    // Create notification for admin
    try {
      console.log('Creating notification for file upload...');
      const displayName = customFileName && customFileName.trim() ? customFileName.trim() : req.file.originalname;
      const notification = await createNotification({
        title: 'New Student Data Uploaded',
        message: `${placement.name} from ${placement.collegeName} has uploaded a new Excel/CSV file: "${displayName}"${customFileName ? ` (${req.file.originalname})` : ''}. File validated successfully and waiting for admin approval.`,
        type: 'file_uploaded',
        role: 'admin',
        relatedId: placementId,
        createdBy: placementId
      });
      console.log('Notification created successfully:', notification._id);
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }

    res.json({
      success: true,
      message: 'Student data uploaded and validated successfully. Waiting for admin approval.',
      fileName: req.file.originalname,
      customName: customFileName && customFileName.trim() ? customFileName.trim() : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginPlacement = async (req, res) => {
  console.log('=== PLACEMENT LOGIN ===');
  console.log('Body:', req.body);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const placement = await Placement.findOne({ email: email.toLowerCase() });
    console.log('Found placement:', !!placement);
    
    if (!placement) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await placement.comparePassword(password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (placement.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account pending approval' });
    }

    const token = generateToken(placement._id, 'placement');

    res.json({
      success: true,
      token,
      placement: {
        id: placement._id,
        name: placement.name,
        email: placement.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get parsed data from Excel/CSV file for viewing
exports.getPlacementData = async (req, res) => {
  try {
    const placementId = req.params.id;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    if (!placement.studentData) {
      return res.json({ success: true, students: [] });
    }

    // Always parse Excel file to show data
    const result = base64ToBuffer(placement.studentData);
    const buffer = result.buffer;

    let workbook;
    if (placement.fileType && placement.fileType.includes('csv')) {
      const csvData = buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Parse and format data with new field structure
    const students = jsonData.map(row => ({
      id: row.ID || row.id || row.Id || '',
      name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '',
      collegeName: row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
      email: row.Email || row.email || row.EMAIL || '',
      phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
      course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
      password: row.Password || row.password || row.PASSWORD || '',
      credits: parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || placement.credits || 0)
    }));
    
    res.json({
      success: true,
      students: students
    });
    
  } catch (error) {
    console.error('Error getting placement data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process Excel file and create candidates after placement approval
exports.processPlacementApproval = async (req, res) => {
  try {
    const placementId = req.params.id;
    console.log('Processing placement:', placementId);
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    console.log('Placement found:', placement.name);
    console.log('Has student data:', !!placement.studentData);

    if (!placement.studentData) {
      return res.status(400).json({ success: false, message: 'No student data file found' });
    }

    // Parse Excel file
    let buffer;
    try {
      const result = base64ToBuffer(placement.studentData);
      buffer = result.buffer;
    } catch (bufferError) {
      console.error('Buffer conversion error:', bufferError);
      return res.status(400).json({ success: false, message: 'Invalid file format' });
    }

    let workbook;
    try {
      if (placement.fileType && placement.fileType.includes('csv')) {
        const csvData = buffer.toString('utf8');
        workbook = XLSX.read(csvData, { type: 'string' });
      } else {
        workbook = XLSX.read(buffer, { type: 'buffer' });
      }
    } catch (xlsxError) {
      console.error('XLSX parsing error:', xlsxError);
      return res.status(400).json({ success: false, message: 'Failed to parse Excel file' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Parsed rows:', jsonData.length);
    
    // Validate file has data
    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'File contains no data rows. Please upload a file with student data.' 
      });
    }
    
    // Check if all rows are empty
    const hasValidData = jsonData.some(row => {
      return Object.values(row).some(value => 
        value !== null && value !== undefined && String(value).trim() !== ''
      );
    });
    
    if (!hasValidData) {
      return res.status(400).json({ 
        success: false, 
        message: 'File contains only empty rows. Please upload a file with actual student data.' 
      });
    }
    
    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];
    
    // Process each row from Excel
    for (const row of jsonData) {
      try {
        // Removed console debug line for security;
        // Extract data from Excel with new field structure (case-insensitive)
        const email = row.Email || row.email || row.EMAIL;
        const password = row.Password || row.password || row.PASSWORD;
        const name = row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'];
        const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE;
        const course = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH;
        const credits = parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || 0);
        
        // Removed console debug line for security;
        
        // Auto-generate missing fields
        if (!email) email = `student${createdCount + 1}@college.edu`;
        if (!password) password = `pwd${Math.random().toString(36).substr(2, 5)}`;
        if (!name) name = `Student ${createdCount + 1}`;
        
        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({ email });
        if (existingCandidate) {
          skippedCount++;
          continue;
        }
        
        // Create candidate with file-specific credits
        const finalCredits = credits || placement.credits || 0;
        const collegeName = row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || placement.collegeName;
        
        // Removed console debug line for security;
        const candidate = await Candidate.create({
          name: name ? name.trim() : '',
          email: email ? email.trim().toLowerCase() : '',
          password: password ? password.trim() : '',
          phone: phone ? phone.toString().trim() : '',
          course: course ? course.trim() : '',
          credits: finalCredits,
          registrationMethod: 'placement',
          placementId: placement._id,
          isVerified: true,
          status: 'active'
        });
        // Removed console debug line for security;
        
        // Create candidate profile with Excel data
        await CandidateProfile.create({ 
          candidateId: candidate._id,
          collegeName: collegeName || placement.collegeName,
          education: [{
            degreeName: course ? course.trim() : '',
            collegeName: collegeName || placement.collegeName,
            scoreType: 'percentage',
            scoreValue: '0'
          }]
        });
        
        createdCount++;
      } catch (rowError) {
        console.error('Row processing error:', rowError);
        errors.push(`Error processing row: ${rowError.message}`);
      }
    }
    
    // Create notification
    try {
      console.log('Creating notification for placement processing...');
      const notification = await createNotification({
        title: 'Student Data Approved & Processed',
        message: `${createdCount} candidates have been successfully registered from ${placement.name}'s placement data. ${skippedCount} candidates were skipped (already exist).`,
        type: 'placement_processed',
        role: 'admin',
        relatedId: placementId,
        createdBy: placementId
      });
      console.log('Processing notification created successfully:', notification._id);
    } catch (notifError) {
      console.error('Processing notification creation failed:', notifError);
    }
    
    // Update placement
    await Placement.findByIdAndUpdate(placementId, { 
      isProcessed: true,
      processedAt: new Date(),
      candidatesCreated: createdCount
    });
    
    res.json({
      success: true,
      message: 'Placement data processed successfully',
      stats: {
        created: createdCount,
        skipped: skippedCount,
        errors: errors.length
      },
      errors: errors.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Error processing placement approval:', error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// Get placement officer's students
exports.getMyStudents = async (req, res) => {
  try {
    const placementId = req.user.id;
    
    // Find candidates created by this placement officer
    const candidates = await Candidate.find({ placementId }).select('name email password phone credits');
    
    const students = candidates.map(candidate => ({
      name: candidate.name,
      email: candidate.email,
      password: candidate.password,
      phone: candidate.phone,
      credits: candidate.credits
    }));
    
    res.json({
      success: true,
      students
    });
    
  } catch (error) {
    console.error('Error getting placement students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get data from specific file
exports.getFileData = async (req, res) => {
  try {
    const { placementId, id, fileId } = req.params;
    const actualPlacementId = placementId || id;
    
    const placement = await Placement.findById(actualPlacementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.fileData) {
      return res.json({ success: true, students: [] });
    }

    // Parse the specific file data
    const result = base64ToBuffer(file.fileData);
    const buffer = result.buffer;

    let workbook;
    if (file.fileType && file.fileType.includes('csv')) {
      const csvData = buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Handle empty files
    if (!jsonData || jsonData.length === 0) {
      return res.json({ success: true, students: [] });
    }
    
    // Parse and format data with new field structure
    const students = jsonData.map(row => ({
      id: row.ID || row.id || row.Id || '',
      name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '',
      collegeName: row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
      email: row.Email || row.email || row.EMAIL || '',
      phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
      course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
      password: row.Password || row.password || row.PASSWORD || '',
      credits: parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || file.credits || 0)
    }));
    
    res.json({
      success: true,
      students: students
    });
    
  } catch (error) {
    console.error('Error getting file data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update credits for specific file
exports.updateFileCredits = async (req, res) => {
  try {
    const { placementId, id, fileId } = req.params;
    const actualPlacementId = placementId || id;
    const { credits } = req.body;
    
    if (typeof credits !== 'number' || credits < 0 || credits > 10000) {
      return res.status(400).json({ success: false, message: 'Credits must be between 0 and 10000' });
    }
    
    const placement = await Placement.findById(actualPlacementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if file is rejected
    if (file.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot update credits for rejected files' });
    }

    // Update file credits
    file.credits = credits;
    
    // Update the file data with new credits
    if (file.fileData) {
      try {
        const result = base64ToBuffer(file.fileData);
        const buffer = result.buffer;

        let workbook;
        if (file.fileType && file.fileType.includes('csv')) {
          const csvData = buffer.toString('utf8');
          workbook = XLSX.read(csvData, { type: 'string' });
        } else {
          workbook = XLSX.read(buffer, { type: 'buffer' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Update all rows with new credits
        const updatedData = jsonData.map(row => ({
          ...row,
          'Credits Assigned': credits,
          'credits assigned': credits,
          'CREDITS ASSIGNED': credits,
          Credits: credits,
          credits: credits,
          CREDITS: credits,
          Credit: credits,
          credit: credits
        }));
        
        // Convert back to Excel/CSV
        const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
        
        let newBuffer;
        let mimeType;
        if (file.fileType && file.fileType.includes('csv')) {
          const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
          newBuffer = Buffer.from(csvOutput, 'utf8');
          mimeType = 'text/csv';
        } else {
          newBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        
        file.fileData = `data:${mimeType};base64,${newBuffer.toString('base64')}`;
      } catch (fileError) {
        console.error('Error updating file data with credits:', fileError);
      }
    }
    
    await placement.save();
    
    // Update all candidates linked to this specific file with new credits
    const candidatesToUpdate = await Candidate.find(
      { placementId: actualPlacementId, fileId: fileId },
      { _id: 1 }
    );
    
    const updateResult = await Candidate.updateMany(
      { placementId: actualPlacementId, fileId: fileId },
      { $set: { credits: credits } }
    );
    
    // Removed console debug line for security
    
    // Emit real-time credit updates to affected candidates
    if (candidatesToUpdate.length > 0) {
      const candidateIds = candidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(candidateIds, credits);
      // Removed console debug line for security
    }
    
    // Also update candidates who don't have fileId but belong to this placement
    // This handles legacy candidates created before fileId tracking
    const legacyCandidatesToUpdate = await Candidate.find(
      { placementId: actualPlacementId, fileId: { $exists: false } },
      { _id: 1 }
    );
    
    let legacyUpdateResult = { modifiedCount: 0 };
    if (legacyCandidatesToUpdate.length > 0) {
      legacyUpdateResult = await Candidate.updateMany(
        { placementId: actualPlacementId, fileId: { $exists: false } },
        { $set: { credits: credits } }
      );
      
      const legacyCandidateIds = legacyCandidatesToUpdate.map(c => c._id.toString());
      emitBulkCreditUpdate(legacyCandidateIds, credits);
      // Removed console debug line for security
    }
    
    res.json({
      success: true,
      message: `File credits updated successfully. ${updateResult.modifiedCount} candidates updated.`,
      file: {
        id: file._id,
        fileName: file.fileName,
        credits: file.credits
      },
      candidatesUpdated: updateResult.modifiedCount + legacyUpdateResult.modifiedCount
    });
    
  } catch (error) {
    console.error('Error updating file credits:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process specific file and create candidates
exports.processFileApproval = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    const { fileName } = req.body;
    
    console.log('=== PROCESS FILE APPROVAL ===');
    console.log('Placement ID:', placementId);
    console.log('File ID:', fileId);
    console.log('File Name:', fileName);
    
    // Validate ObjectId format
    if (!placementId || !mongoose.Types.ObjectId.isValid(placementId)) {
      return res.status(400).json({ success: false, message: `Invalid placement ID format: ${placementId}` });
    }
    
    let placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.fileData) {
      return res.status(400).json({ success: false, message: 'No file data found' });
    }

    // Parse the specific file
    const result = base64ToBuffer(file.fileData);
    const buffer = result.buffer;

    let workbook;
    if (file.fileType && file.fileType.includes('csv')) {
      const csvData = buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Validate file has data
    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'File contains no data rows. Please upload a file with student data.' 
      });
    }
    
    // Check if all rows are empty
    const hasValidData = jsonData.some(row => {
      return Object.values(row).some(value => 
        value !== null && value !== undefined && String(value).trim() !== ''
      );
    });
    
    if (!hasValidData) {
      return res.status(400).json({ 
        success: false, 
        message: 'File contains only empty rows. Please upload a file with actual student data.' 
      });
    }
    
    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];
    const createdCandidates = [];
    
    // Process each row from Excel
    for (let index = 0; index < jsonData.length; index++) {
      try {
        const row = jsonData[index];
        let email = row.Email || row.email || row.EMAIL;
        let password = row.Password || row.password || row.PASSWORD;
        let name = row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'];
        const phone = row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE;
        const course = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH;
        const collegeName = row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || placement.collegeName;
        
        // Auto-generate missing fields with proper validation
        if (!email || email.trim() === '') {
          email = `student${index + 1}@${placement.collegeName.toLowerCase().replace(/\s+/g, '')}.edu`;
        }
        if (!password || password.trim() === '') {
          password = `pwd${Math.random().toString(36).substr(2, 8)}`;
        }
        if (!name || name.trim() === '') {
          name = `Student ${index + 1}`;
        }
        
        // Validate required fields
        if (!email || !password || !name) {
          errors.push(`Row ${index + 1}: Missing required fields (email, password, or name)`);
          continue;
        }
        
        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({ email: email.trim().toLowerCase() });
        if (existingCandidate) {
          skippedCount++;
          continue;
        }
        
        // Use file-specific credits or individual row credits
        const rowCredits = parseInt(row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || 0);
        const finalCredits = rowCredits || file.credits || placement.credits || 0;
        
        // Create candidate with plain text password for placement method
        const candidate = await Candidate.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(), // Store as plain text for placement candidates
          phone: phone ? phone.toString().trim() : '',
          course: course ? course.trim() : '',
          credits: finalCredits,
          registrationMethod: 'placement',
          placementId: placement._id,
          fileId: file._id,
          isVerified: true,
          status: 'active'
        });
        
        // Create candidate profile with complete Excel data
        await CandidateProfile.create({ 
          candidateId: candidate._id,
          collegeName: collegeName || placement.collegeName,
          education: [{
            degreeName: course ? course.trim() : '',
            collegeName: collegeName || placement.collegeName,
            scoreType: 'percentage',
            scoreValue: '0'
          }]
        });
        
        createdCandidates.push({
          name: candidate.name,
          email: candidate.email,
          password: password.trim(), // Include password in response for admin reference
          credits: finalCredits
        });
        
        createdCount++;
        // Removed console debug line for security}`);
      } catch (rowError) {
        console.error('Row processing error:', rowError);
        errors.push(`Row ${index + 1}: ${rowError.message}`);
      }
    }
    
    // Update file status using direct MongoDB update
    await Placement.findOneAndUpdate(
      { _id: placementId, 'fileHistory._id': fileId },
      { 
        $set: { 
          'fileHistory.$.status': 'processed',
          'fileHistory.$.processedAt': new Date(),
          'fileHistory.$.candidatesCreated': createdCount
        }
      }
    );
    
    // Create notification for successful processing
    try {
      const displayName = file.customName || fileName || file.fileName;
      await createNotification({
        title: 'File Processed Successfully - Candidates Can Login',
        message: `File "${displayName}" has been processed. ${createdCount} candidates created and can now login to candidate dashboard using their email and password from Excel file. ${skippedCount} candidates were skipped (already exist).`,
        type: 'file_processed',
        role: 'admin',
        relatedId: placementId,
        createdBy: placementId
      });
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
    }
    
    const displayName = file.customName || fileName || file.fileName;
    res.json({
      success: true,
      message: `File "${displayName}" processed successfully. ${createdCount} candidates created and can now login to candidate dashboard using their email and password. ${skippedCount} candidates were skipped.`,
      stats: {
        created: createdCount,
        skipped: skippedCount,
        errors: errors.length
      },
      createdCandidates: createdCandidates.slice(0, 10), // Show first 10 created candidates
      errors: errors.slice(0, 10),
      loginInstructions: {
        url: 'http://localhost:3000/',
        message: 'Candidates can now login using their email and password from the Excel file (Sign In → Candidate tab)'
      }
    });
    
  } catch (error) {
    console.error('Error processing file approval:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject specific file
exports.rejectFile = async (req, res) => {
  try {
    const { id: placementId, fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Update file status using direct MongoDB update
    await Placement.findOneAndUpdate(
      { _id: placementId, 'fileHistory._id': fileId },
      { 
        $set: { 
          'fileHistory.$.status': 'rejected',
          'fileHistory.$.processedAt': new Date()
        }
      }
    );
    
    const displayName = file.customName || file.fileName;
    res.json({
      success: true,
      message: `File "${displayName}" rejected successfully`
    });
    
  } catch (error) {
    console.error('Error rejecting file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// View file data for placement officer
exports.viewFileData = async (req, res) => {
  try {
    const placementId = req.user.id; // Get from authenticated user
    const { fileId } = req.params;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const file = placement.fileHistory.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.fileData) {
      return res.json({ success: true, fileData: [] });
    }

    // Parse the specific file data
    const result = base64ToBuffer(file.fileData);
    const buffer = result.buffer;

    let workbook;
    if (file.fileType && file.fileType.includes('csv')) {
      const csvData = buffer.toString('utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Handle empty files
    if (!jsonData || jsonData.length === 0) {
      return res.json({ 
        success: true, 
        fileData: [],
        fileName: file.fileName,
        customName: file.customName,
        uploadedAt: file.uploadedAt,
        status: file.status
      });
    }
    
    // Format the data to ensure Course field is properly displayed
    const formattedData = jsonData.map(row => ({
      'ID': row.ID || row.id || row.Id || '',
      'Candidate Name': row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || '',
      'College Name': row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
      'Email': row.Email || row.email || row.EMAIL || '',
      'Phone': row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
      'Course': row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
      'Password': row.Password || row.password || row.PASSWORD || '',
      'Credits Assigned': row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || '0'
    }));
    
    res.json({
      success: true,
      fileData: formattedData,
      fileName: file.fileName,
      customName: file.customName,
      uploadedAt: file.uploadedAt,
      status: file.status
    });
    
  } catch (error) {
    console.error('Error viewing file data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save dashboard state
exports.saveDashboardState = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { dashboardData } = req.body;
    
    await Placement.findByIdAndUpdate(placementId, {
      $set: {
        lastDashboardState: {
          data: dashboardData,
          timestamp: new Date()
        }
      }
    });
    
    res.json({ success: true, message: 'Dashboard state saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get placement dashboard stats
exports.getPlacementDashboard = async (req, res) => {
  try {
    const placementId = req.user._id || req.user.id;
    
    const placement = await Placement.findById(placementId).select('name collegeName fileHistory');
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    // Count files by status
    const totalFiles = placement.fileHistory?.length || 0;
    const pendingFiles = placement.fileHistory?.filter(f => f.status === 'pending').length || 0;
    const processedFiles = placement.fileHistory?.filter(f => f.status === 'processed').length || 0;
    
    // Count total candidates created
    let totalCandidates = 0;
    try {
      totalCandidates = await Candidate.countDocuments({ placementId });
    } catch (e) {
      console.error('Error counting candidates:', e);
    }
    
    res.json({
      success: true,
      stats: {
        totalFiles,
        pendingFiles,
        processedFiles,
        totalCandidates
      },
      placementInfo: {
        name: placement.name,
        collegeName: placement.collegeName
      }
    });
  } catch (error) {
    console.error('Error getting placement dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all candidates created from placement Excel files
exports.getPlacementCandidates = async (req, res) => {
  try {
    const placementId = req.params.id;
    
    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    // Get all candidates created from this placement
    const candidates = await Candidate.find({ placementId })
      .select('name email phone course credits fileId createdAt')
      .sort({ createdAt: -1 });
    
    // Get candidate profiles
    const candidatesWithProfiles = await Promise.all(
      candidates.map(async (candidate) => {
        const profile = await CandidateProfile.findOne({ candidateId: candidate._id })
          .select('collegeName education');
        
        return {
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          course: candidate.course,
          credits: candidate.credits,
          createdAt: candidate.createdAt,
          collegeName: profile?.collegeName || placement.collegeName,
          education: profile?.education || []
        };
      })
    );
    
    res.json({
      success: true,
      placement: {
        name: placement.name,
        collegeName: placement.collegeName,
        email: placement.email
      },
      candidates: candidatesWithProfiles,
      totalCandidates: candidatesWithProfiles.length
    });
    
  } catch (error) {
    console.error('Error getting placement candidates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload logo
exports.uploadLogo = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { logo } = req.body;
    
    if (!logo) {
      return res.status(400).json({ success: false, message: 'Logo data is required' });
    }
    
    await Placement.findByIdAndUpdate(placementId, {
      $set: { logo: logo }
    });
    
    res.json({ success: true, message: 'Logo uploaded successfully' });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload ID card
exports.uploadIdCard = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { idCard } = req.body;
    
    if (!idCard) {
      return res.status(400).json({ success: false, message: 'ID card data is required' });
    }
    
    await Placement.findByIdAndUpdate(placementId, {
      $set: { idCard: idCard }
    });
    
    res.json({ success: true, message: 'ID card uploaded successfully' });
  } catch (error) {
    console.error('Error uploading ID card:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update placement profile
exports.updateProfile = async (req, res) => {
  try {
    const placementId = req.user.id;
    const { name, firstName, lastName, phone, collegeName } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (phone) updateData.phone = phone.trim();
    if (collegeName) updateData.collegeName = collegeName.trim();
    
    const placement = await Placement.findByIdAndUpdate(
      placementId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      placement
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// OTP-based Password Reset for Placement
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const placement = await Placement.findOne({ email });
    
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    placement.resetPasswordOTP = otp;
    placement.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await placement.save();

    const { sendOTPEmail } = require('../utils/emailService');
    await sendOTPEmail(email, otp, placement.name);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const placement = await Placement.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!placement) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    placement.password = newPassword;
    placement.resetPasswordOTP = undefined;
    placement.resetPasswordOTPExpires = undefined;
    await placement.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const placement = await Placement.findOne({ email: email.toLowerCase().trim() });
    
    res.json({ 
      success: true, 
      exists: !!placement 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePasswordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const placement = await Placement.findOne({ email: email.toLowerCase().trim() });
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement officer not found' });
    }
    
    placement.password = newPassword;
    placement.markModified('password');
    await placement.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
