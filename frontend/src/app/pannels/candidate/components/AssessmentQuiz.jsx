import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AssessmentQuiz({ assessment, attemptId, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(assessment.timer * 60);
  const [violations, setViolations] = useState([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('window_minimize');
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        recordViolation('copy_paste');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation('right_click');
    };

    const handleBlur = () => {
      recordViolation('tab_switch');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const recordViolation = (type) => {
    const violation = {
      type,
      timestamp: new Date(),
      details: `Violation at question ${currentQuestion + 1}`
    };
    setViolations(prev => [...prev, violation]);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Maximum 10MB allowed');
      return;
    }
    
    setUploading(true);
    try {
      const token = localStorage.getItem('candidateToken');
      const formData = new FormData();
      formData.append('answerFile', file);
      formData.append('attemptId', attemptId);
      formData.append('questionIndex', currentQuestion);
      formData.append('timeSpent', Date.now() - startTime);
      
      const response = await axios.post('/api/candidate/assessments/upload-answer', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setUploadedFile(response.data.uploadedFile);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    const question = assessment.questions[currentQuestion];
    
    if (question.type === 'mcq' && selectedAnswer === null) {
      alert('Please select an answer');
      return;
    }
    
    if (question.type === 'subjective' && !textAnswer.trim()) {
      alert('Please provide a written answer');
      return;
    }
    
    if (question.type === 'upload' && !uploadedFile) {
      alert('Please upload a file');
      return;
    }

    try {
      const token = localStorage.getItem('candidateToken');
      
      if (question.type !== 'upload') {
        await axios.post('/api/candidate/assessments/answer', {
          attemptId,
          questionIndex: currentQuestion,
          selectedAnswer: question.type === 'mcq' ? selectedAnswer : null,
          textAnswer: question.type === 'subjective' ? textAnswer : null,
          timeSpent: Date.now() - startTime
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (currentQuestion < assessment.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTextAnswer('');
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('candidateToken');
      const response = await axios.post('/api/candidate/assessments/submit', {
        attemptId,
        violations
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onComplete(response.data.result);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = assessment.questions[currentQuestion];

  return (
    <div className="mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">{assessment.title}</h5>
            <small className="text-muted">Question {currentQuestion + 1} of {assessment.questions.length}</small>
          </div>
          <div className={`badge ${timeRemaining < 300 ? 'bg-danger' : 'bg-primary'} fs-6`}>
            <i className="fa fa-clock me-2"></i>
            {formatTime(timeRemaining)}
          </div>
        </div>
        <div className="card-body">
          <h6 className="mb-4">Q{currentQuestion + 1}. {question.question}</h6>
          
          {question.type === 'mcq' && (
            <div className="options">
              {question.options.map((option, index) => (
                <div key={index} className="form-check mb-3 p-3 border rounded" style={{cursor: 'pointer'}}
                  onClick={() => setSelectedAnswer(index)}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="answer"
                    id={`option-${index}`}
                    checked={selectedAnswer === index}
                    onChange={() => setSelectedAnswer(index)}
                  />
                  <label className="form-check-label w-100" htmlFor={`option-${index}`} style={{cursor: 'pointer'}}>
                    {String.fromCharCode(65 + index)}. {option}
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'subjective' && (
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="6"
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
              />
              <small className="text-muted">Provide a detailed written answer to the question above.</small>
            </div>
          )}
          
          {question.type === 'upload' && (
            <div className="mb-3">
              <div className="border rounded p-4 text-center">
                {!uploadedFile ? (
                  <>
                    <input
                      type="file"
                      className="form-control mb-3"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      disabled={uploading}
                    />
                    <small className="text-muted d-block">
                      📎 Accepted file types: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
                    </small>
                    {uploading && (
                      <div className="mt-2">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Uploading...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="alert alert-success">
                    <i className="fa fa-check-circle me-2"></i>
                    File uploaded successfully: {uploadedFile.originalName}
                    <br />
                    <small>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="card-footer text-end">
          <button 
            className="btn btn-primary"
            onClick={currentQuestion === assessment.questions.length - 1 ? handleSubmit : handleNext}
            disabled={
              (question.type === 'mcq' && selectedAnswer === null) ||
              (question.type === 'subjective' && !textAnswer.trim()) ||
              (question.type === 'upload' && !uploadedFile) ||
              uploading
            }
          >
            {currentQuestion === assessment.questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
            <i className="fa fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
