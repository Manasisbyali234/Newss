const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Employer: Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, type, description, instructions, timer, questions } = req.body;
    
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
      
      if (!question.marks || question.marks < 1) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} must have at least 1 mark` 
        });
      }
    }
    
    // Generate serial number
    const lastAssessment = await Assessment.findOne({ employerId: req.user.id })
      .sort({ serialNumber: -1 })
      .select('serialNumber');
    const serialNumber = lastAssessment ? lastAssessment.serialNumber + 1 : 1;
    
    const assessment = new Assessment({
      employerId: req.user.id,
      serialNumber,
      title: title.trim(),
      type: type || 'Technical',
      description: description ? description.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      timer: timer || 30,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: q.correctAnswer,
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
    const assessments = await Assessment.find({ employerId: req.user.id })
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
      employerId: req.user.id
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
    const { title, type, description, instructions, timer, questions } = req.body;
    
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
      { _id: req.params.id, employerId: req.user.id },
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
      employerId: req.user.id
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
      candidateId: req.user.id,
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
    
    // Check if already attempted
    let attempt = await AssessmentAttempt.findOne({
      assessmentId,
      candidateId: req.user.id,
      applicationId
    });
    
    if (attempt && attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment already completed' });
    }
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    if (!attempt) {
      attempt = new AssessmentAttempt({
        assessmentId,
        candidateId: req.user.id,
        jobId,
        applicationId,
        totalMarks: assessment.questions.reduce((sum, q) => sum + q.marks, 0)
      });
    }
    
    attempt.status = 'in_progress';
    attempt.startTime = new Date();
    attempt.timeRemaining = assessment.timer * 60;
    attempt.termsAccepted = true;
    attempt.termsAcceptedAt = new Date();
    
    await attempt.save();
    
    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      assessmentStatus: 'in_progress'
    });
    
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Submit Answer
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionIndex, selectedAnswer, textAnswer, timeSpent } = req.body;
    
    // Validate input
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user.id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment not in progress' });
    }
    
    // Validate question exists
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment || !assessment.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const question = assessment.questions[questionIndex];
    
    // Validate answer based on question type
    if (question.type === 'mcq') {
      if (typeof selectedAnswer !== 'number' || selectedAnswer < 0 || selectedAnswer >= question.options.length) {
        return res.status(400).json({ success: false, message: 'Invalid answer option' });
      }
    }
    
    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === questionIndex);
    const answerData = {
      questionIndex,
      selectedAnswer: question.type === 'mcq' ? parseInt(selectedAnswer) : null,
      textAnswer: question.type === 'subjective' ? textAnswer : null,
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    attempt.currentQuestion = questionIndex + 1;
    await attempt.save();
    
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      candidateId: req.user.id
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
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user.id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
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
      
      // Ensure both values are integers for accurate comparison
      const selectedAnswer = parseInt(answer.selectedAnswer);
      const correctAnswer = parseInt(question.correctAnswer);
      
      // Validate answer is within valid range
      if (selectedAnswer >= 0 && selectedAnswer < question.options.length) {
        if (selectedAnswer === correctAnswer) {
          score += (question.marks || 1);
          correctAnswers++;
        }
      } else {
        console.warn(`Invalid answer ${selectedAnswer} for question ${answer.questionIndex}`);
      }
    }
    
    const percentage = (score / attempt.totalMarks) * 100;
    const result = percentage >= assessment.passingPercentage ? 'pass' : 'fail';
    
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.result = result;
    attempt.status = 'completed';
    attempt.endTime = new Date();
    
    if (violations && violations.length > 0) {
      attempt.violations = violations;
    }
    
    await attempt.save();
    
    // Update application
    await Application.findByIdAndUpdate(attempt.applicationId, {
      assessmentStatus: 'completed',
      assessmentScore: score,
      assessmentPercentage: percentage,
      assessmentResult: result
    });
    
    res.json({ 
      success: true, 
      result: {
        score,
        totalMarks: attempt.totalMarks,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        result,
        correctAnswers,
        totalQuestions: assessment.totalQuestions,
        totalAnswered,
        unanswered: assessment.totalQuestions - totalAnswered
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate: Get Assessment Result
exports.getAssessmentResult = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findOne({
      _id: req.params.attemptId,
      candidateId: req.user.id,
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
    
    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      candidateId: req.user.id
    });
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    attempt.violations.push({
      type,
      timestamp: new Date(),
      details
    });
    
    await attempt.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer: Get Assessment Results
exports.getAssessmentResults = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      employerId: req.user.id
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
    
    if (attempt.assessmentId.employerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
