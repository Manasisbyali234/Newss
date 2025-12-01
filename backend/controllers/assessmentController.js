const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Employer: Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, type, designation, description, instructions, timer, questions } = req.body;
    
    // Additional server-side validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Assessment title is required' });
    }
    
    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.question || question.question.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} text is required` 
        });
      }
      
      // Only validate options and correctAnswer for MCQ questions
      if (question.type === 'mcq' || !question.type) {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have at least 2 options` 
          });
        }
        
        // Check if all options are filled
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j] || question.options[j].trim().length === 0) {
            return res.status(400).json({ 
              success: false, 
              message: `Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is required` 
            });
          }
        }
        
        if (question.correctAnswer === undefined || question.correctAnswer === null || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have a valid correct answer selected` 
          });
        }
      }
      
      if (!question.marks || question.marks < 1) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} must have at least 1 mark` 
        });
      }
    }
    
    // Generate serial number
    const lastAssessment = await Assessment.findOne({ employerId: req.user._id })
      .sort({ serialNumber: -1 })
      .select('serialNumber');
    
    let serialNumber = 1;
    if (lastAssessment && typeof lastAssessment.serialNumber === 'number' && !isNaN(lastAssessment.serialNumber)) {
      serialNumber = lastAssessment.serialNumber + 1;
    }
    
    const assessment = new Assessment({
      employerId: req.user._id,
      serialNumber,
      title: title.trim(),
      type: type || 'Technical',
      designation: designation ? designation.trim() : '',
      description: description ? description.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      timer: timer || 30,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        question: q.question.trim(),
        type: q.type || 'mcq',
        options: (q.type === 'subjective' || q.type === 'upload') ? [] : q.options.map(opt => opt.trim()),
        correctAnswer: (q.type === 'subjective' || q.type === 'upload') ? null : q.correctAnswer,
        marks: q.marks || 1,
        explanation: q.explanation ? q.explanation.trim() : ''
      })),
      status: 'published'
    });

    await assessment.save();
    res.status(201).json({ success: true, assessment });
  } catch (error) {
    console.error('Assessment creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create assessment' });
  }
};

// Employer: Get All Assessments
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ employerId: req.user._id })
      .sort({ serialNumber: 1 });
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Assessment Details
exports.getAssessmentDetails = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Update Assessment
exports.updateAssessment = async (req, res) => {
  try {
    const { title, type, designation, description, instructions, timer, questions } = req.body;
    
    // Additional server-side validation (same as create)
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Assessment title is required' });
    }
    
    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.question || question.question.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} text is required` 
        });
      }
      
      if (question.type === 'mcq') {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have at least 2 options` 
          });
        }
        
        // Check if all options are filled
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j] || question.options[j].trim().length === 0) {
            return res.status(400).json({ 
              success: false, 
              message: `Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is required` 
            });
          }
        }
        
        if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ 
            success: false, 
            message: `Question ${i + 1} must have a valid correct answer selected` 
          });
        }
      }
      
      if (!question.marks || question.marks < 1) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} must have at least 1 mark` 
        });
      }
    }
    
    const updateData = {
      title: title.trim(),
      type: type || 'Technical',
      designation: designation ? designation.trim() : '',
      description: description ? description.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      timer: timer || 30,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        question: q.question.trim(),
        type: q.type || 'mcq',
        options: (q.type === 'subjective' || q.type === 'upload') ? [] : q.options.map(opt => opt.trim()),
        correctAnswer: (q.type === 'subjective' || q.type === 'upload') ? null : q.correctAnswer,
        marks: q.marks || 1,
        explanation: q.explanation ? q.explanation.trim() : ''
      })),
      updatedAt: Date.now()
    };
    
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user._id },
      updateData,
      { new: true }
    );
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    console.error('Assessment update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update assessment' });
  }
};

// Employer: Delete Assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({
      _id: req.params.id,
      employerId: req.user._id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Available Assessments
exports.getAvailableAssessments = async (req, res) => {
  try {
    const applications = await Application.find({
      candidateId: req.user._id,
      assessmentStatus: 'available'
    }).populate('jobId');
    
    const assessments = [];
    for (const app of applications) {
      if (app.jobId && app.jobId.assessmentId) {
        const assessment = await Assessment.findById(app.jobId.assessmentId)
          .select('-questions.correctAnswer -questions.explanation');
        
        if (assessment) {
          assessments.push({
            ...assessment.toObject(),
            jobTitle: app.jobId.title,
            applicationId: app._id,
            jobId: app.jobId._id
          });
        }
      }
    }
    
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Assessment for Taking (without answers)
exports.getAssessmentForCandidate = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .select('-questions.correctAnswer -questions.explanation');
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Start Assessment
exports.startAssessment = async (req, res) => {
  try {
    const { assessmentId, jobId, applicationId } = req.body;
    
    // Validate input
    if (!assessmentId || !jobId || !applicationId) {
      return res.status(400).json({ success: false, message: 'Assessment ID, Job ID, and Application ID are required' });
    }
    
    // Check if already attempted
    let attempt = await AssessmentAttempt.findOne({
      assessmentId,
      candidateId: req.user._id,
      applicationId
    });
    
    if (attempt && attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment already completed. You cannot retake this assessment.' });
    }
    
    if (attempt && attempt.status === 'expired') {
      return res.status(400).json({ success: false, message: 'Assessment time expired. You cannot retake this assessment.' });
    }
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Verify application exists and belongs to candidate
    const application = await Application.findOne({
      _id: applicationId,
      candidateId: req.user._id
    });
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    if (!attempt) {
      const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      attempt = new AssessmentAttempt({
        assessmentId,
        candidateId: req.user._id,
        jobId,
        applicationId,
        totalMarks,
        answers: [],
        violations: []
      });
    }
    
    attempt.status = 'in_progress';
    attempt.startTime = new Date();
    attempt.timeRemaining = assessment.timer * 60;
    attempt.termsAccepted = true;
    attempt.termsAcceptedAt = new Date();
    attempt.currentQuestion = 0;
    
    await attempt.save();
    
    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      assessmentStatus: 'in_progress',
      assessmentAttemptId: attempt._id
    });
    
    console.log(`Assessment started for candidate ${req.user._id}, attempt ${attempt._id}`);
    
    res.json({ 
      success: true, 
      message: 'Assessment started successfully',
      attempt: {
        _id: attempt._id,
        assessmentId: attempt.assessmentId,
        startTime: attempt.startTime,
        timeRemaining: attempt.timeRemaining,
        totalMarks: attempt.totalMarks,
        currentQuestion: attempt.currentQuestion
      }
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start assessment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Submit Answer
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, selectedAnswer, textAnswer, timeSpent } = req.body;
    
    // Validate input
    if (!attemptId) {
      return res.status(400).json({ success: false, message: 'Attempt ID is required' });
    }
    
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment is not in progress' });
    }
    
    // Validate question exists
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment || !assessment.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Question not found' });
    }
    
    const question = assessment.questions[questionIndex];
    
    // Validate answer based on question type
    if (question.type === 'mcq') {
      if (selectedAnswer === null || selectedAnswer === undefined) {
        return res.status(400).json({ success: false, message: 'Please select an answer' });
      }
      if (typeof selectedAnswer !== 'number' || selectedAnswer < 0 || selectedAnswer >= question.options.length) {
        return res.status(400).json({ success: false, message: 'Invalid answer option selected' });
      }
    } else if (question.type === 'subjective') {
      if (!textAnswer || !textAnswer.trim()) {
        return res.status(400).json({ success: false, message: 'Please provide a text answer' });
      }
    }
    
    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === questionIndex);
    const answerData = {
      questionIndex,
      selectedAnswer: question.type === 'mcq' ? parseInt(selectedAnswer) : null,
      textAnswer: question.type === 'subjective' ? textAnswer?.trim() : null,
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = Math.max(attempt.currentQuestion || 0, questionIndex + 1);
    attempt.markModified('answers');
    await attempt.save();
    
    console.log(`Answer submitted for question ${questionIndex} in attempt ${attemptId}`);
    
    res.json({ 
      success: true, 
      message: 'Answer saved successfully',
      attempt: {
        _id: attempt._id,
        currentQuestion: attempt.currentQuestion,
        answersCount: attempt.answers.length
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save answer. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Upload File Answer
exports.uploadFileAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, timeSpent } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed' });
    }
    
    if (req.file.size > 10 * 1024 * 1024) { // 10MB limit
      return res.status(400).json({ success: false, message: 'File size too large. Maximum 10MB allowed' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment not in progress' });
    }
    
    // Validate question exists and is upload type
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment || !assessment.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const question = assessment.questions[questionIndex];
    if (question.type !== 'upload') {
      return res.status(400).json({ success: false, message: 'Question is not an upload type' });
    }
    
    // Update or add answer with file info
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === parseInt(questionIndex));
    const answerData = {
      questionIndex: parseInt(questionIndex),
      selectedAnswer: null,
      textAnswer: null,
      uploadedFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      },
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = parseInt(questionIndex) + 1;
    await attempt.save();
    
    res.json({ success: true, attempt, uploadedFile: answerData.uploadedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Submit Complete Assessment
exports.submitAssessment = async (req, res) => {
  try {
    const { attemptId, violations } = req.body;
    
    // Validate input
    if (!attemptId) {
      return res.status(400).json({ success: false, message: 'Attempt ID is required' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    // Check if already completed
    if (attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment already completed' });
    }
    
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Calculate score with enhanced validation
    let score = 0;
    let correctAnswers = 0;
    let totalAnswered = 0;
    
    // Validate all answers before scoring
    for (const answer of attempt.answers) {
      const question = assessment.questions[answer.questionIndex];
      if (!question) {
        console.warn(`Question not found for index: ${answer.questionIndex}`);
        continue;
      }
      
      totalAnswered++;
      
      // Handle different question types
      if (question.type === 'mcq') {
        // Ensure both values are integers for accurate comparison
        const selectedAnswer = parseInt(answer.selectedAnswer);
        const correctAnswer = parseInt(question.correctAnswer);
        
        // Validate answer is within valid range and not null/undefined
        if (!isNaN(selectedAnswer) && selectedAnswer >= 0 && selectedAnswer < question.options.length) {
          if (selectedAnswer === correctAnswer) {
            score += (question.marks || 1);
            correctAnswers++;
          }
        } else {
          console.warn(`Invalid MCQ answer ${selectedAnswer} for question ${answer.questionIndex}`);
        }
      } else if (question.type === 'subjective') {
        // For subjective questions, just add marks (manual evaluation needed)
        if (answer.textAnswer && answer.textAnswer.trim()) {
          // For now, give full marks for answered subjective questions
          // This should be manually evaluated later
          score += (question.marks || 1);
          correctAnswers++;
        }
      } else if (question.type === 'upload') {
        // For upload questions, give marks if file is uploaded
        if (answer.uploadedFile) {
          score += (question.marks || 1);
          correctAnswers++;
        }
      }
    }
    
    // Ensure totalMarks is valid
    const totalMarks = attempt.totalMarks || assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const passingPercentage = assessment.passingPercentage || 60; // Default 60%
    const result = percentage >= passingPercentage ? 'pass' : 'fail';
    
    // Check if time expired
    const timeElapsed = (new Date() - new Date(attempt.startTime)) / 1000; // in seconds
    const timeLimit = assessment.timer * 60; // in seconds
    const isExpired = timeElapsed > timeLimit;
    
    // Update attempt with results
    attempt.score = score;
    attempt.percentage = Math.round(percentage * 100) / 100; // Round to 2 decimal places
    attempt.result = result;
    attempt.status = isExpired ? 'expired' : 'completed';
    attempt.endTime = new Date();
    attempt.totalMarks = totalMarks; // Ensure totalMarks is set
    
    if (violations && violations.length > 0) {
      attempt.violations = violations;
    }
    
    await attempt.save();
    
    // Update application with assessment results
    const updateData = {
      assessmentStatus: 'completed',
      assessmentScore: score,
      assessmentPercentage: attempt.percentage,
      assessmentResult: result,
      assessmentAttemptId: attempt._id
    };
    
    await Application.findByIdAndUpdate(attempt.applicationId, updateData);
    
    console.log(`Assessment submitted successfully for attempt ${attemptId}:`, {
      score,
      totalMarks,
      percentage: attempt.percentage,
      result,
      correctAnswers,
      totalAnswered
    });
    
    res.json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      result: {
        score,
        totalMarks,
        percentage: attempt.percentage,
        result,
        correctAnswers,
        totalQuestions: assessment.totalQuestions,
        totalAnswered,
        unanswered: assessment.totalQuestions - totalAnswered,
        attemptId: attempt._id
      }
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit assessment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Candidate: Get Assessment Result
exports.getAssessmentResult = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findOne({
      _id: req.params.attemptId,
      candidateId: req.user._id,
      status: 'completed'
    }).populate('assessmentId');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    
    res.json({ 
      success: true, 
      result: {
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        result: attempt.result,
        correctAnswers: attempt.answers.filter(a => {
          const question = attempt.assessmentId.questions[a.questionIndex];
          return question && parseInt(a.selectedAnswer) === parseInt(question.correctAnswer);
        }).length,
        totalQuestions: attempt.assessmentId.totalQuestions,
        violations: attempt.violations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record Violation
exports.recordViolation = async (req, res) => {
  try {
    const { attemptId, type, details } = req.body;
    
    if (!attemptId || !type) {
      return res.status(400).json({ success: false, message: 'Attempt ID and violation type are required' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user._id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Assessment attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment is not in progress' });
    }
    
    attempt.violations.push({
      type,
      timestamp: new Date(),
      details: details || `${type} violation detected`
    });
    
    attempt.markModified('violations');
    await attempt.save();
    
    console.log(`Violation recorded for attempt ${attemptId}: ${type}`);
    
    res.json({ 
      success: true, 
      message: 'Violation recorded',
      violationCount: attempt.violations.length
    });
  } catch (error) {
    console.error('Record violation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record violation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Employer: Get Assessment Results
exports.getAssessmentResults = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user._id
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    const results = await AssessmentAttempt.find({
      assessmentId: req.params.id,
      status: 'completed'
    }).populate('candidateId', 'name email phone').sort({ endTime: -1 });
    
    res.json({ success: true, assessment, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Attempt Details
exports.getAttemptDetails = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.attemptId)
      .populate('candidateId', 'name email phone')
      .populate('assessmentId');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.assessmentId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssessmentResultByApplication = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const candidateId = req.user._id;
    
    console.log('[getAssessmentResultByApplication] Query params:', {
      applicationId,
      candidateId: candidateId.toString(),
      userRole: req.userRole
    });
    
    const attempt = await AssessmentAttempt.findOne({
      applicationId,
      candidateId,
      status: 'completed'
    }).populate('assessmentId');
    
    if (!attempt) {
      console.log('[getAssessmentResultByApplication] No attempt found, checking all records for this application...');
      const allAttempts = await AssessmentAttempt.find({ applicationId }).select('_id candidateId status');
      console.log('[getAssessmentResultByApplication] All attempts for app:', allAttempts);
      return res.status(404).json({ success: false, message: 'Assessment result not found for this application' });
    }
    
    console.log('[getAssessmentResultByApplication] Found attempt:', attempt._id);
    
    res.json({ 
      success: true, 
      data: {
        result: {
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          percentage: attempt.percentage,
          result: attempt.result,
          correctAnswers: attempt.answers.filter(a => {
            const question = attempt.assessmentId.questions[a.questionIndex];
            return question && parseInt(a.selectedAnswer) === parseInt(question.correctAnswer);
          }).length,
          totalQuestions: attempt.assessmentId.totalQuestions,
          violations: attempt.violations
        },
        assessment: {
          title: attempt.assessmentId.title,
          description: attempt.assessmentId.description
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
