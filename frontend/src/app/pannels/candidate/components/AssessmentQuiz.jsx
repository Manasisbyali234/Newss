import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AssessmentQuiz({ assessment, attemptId, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
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

  const handleNext = async () => {
    if (selectedAnswer === null) {
      alert('Please select an answer');
      return;
    }

    try {
      const token = localStorage.getItem('candidateToken');
      await axios.post('/api/candidate/assessments/answer', {
        attemptId,
        questionIndex: currentQuestion,
        selectedAnswer,
        timeSpent: Date.now() - startTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (currentQuestion < assessment.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
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
    <div className="container mt-4">
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
        </div>
        <div className="card-footer text-end">
          <button 
            className="btn btn-primary"
            onClick={currentQuestion === assessment.questions.length - 1 ? handleSubmit : handleNext}
            disabled={selectedAnswer === null}
          >
            {currentQuestion === assessment.questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
            <i className="fa fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
