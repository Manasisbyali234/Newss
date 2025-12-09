import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ViewAnswers() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnswers();
  }, [attemptId]);

  const fetchAnswers = async () => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.get(`http://localhost:5000/api/employer/assessment-attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        console.log('Full attempt data:', JSON.stringify(response.data.attempt, null, 2));
        response.data.attempt.answers?.forEach((ans, idx) => {
          console.log(`Answer ${idx}:`, {
            questionIndex: ans.questionIndex,
            textAnswer: ans.textAnswer,
            textAnswerType: typeof ans.textAnswer,
            textAnswerLength: ans.textAnswer?.length,
            hasUploadedFile: !!ans.uploadedFile
          });
        });
        setAttempt(response.data.attempt);
        setAssessment(response.data.attempt.assessmentId);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading answers...</p>
      </div>
    );
  }

  if (!attempt || !assessment) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No answers found</p>
      </div>
    );
  }

  const allAnswers = attempt.answers?.map(a => {
    const question = assessment.questions[a.questionIndex];
    return question ? a : null;
  }).filter(a => a !== null) || [];

  console.log('Total answers:', attempt.answers?.length);
  console.log('Displayed answers:', allAnswers.length);
  console.log('All answers data:', JSON.stringify(attempt.answers, null, 2));

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: '#f7f7f7', 
      padding: '2rem' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="fa fa-arrow-left" style={{ fontSize: '1.125rem', color: '#ff6b35' }}></i>
            </button>
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Assessment Answers
              </h2>
              <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                Candidate: {attempt.candidateId?.name || 'N/A'} ({attempt.candidateId?.email || 'N/A'})
              </p>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            padding: '1rem', 
            background: '#f9fafb', 
            borderRadius: '8px' 
          }}>
            <div>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Assessment: </span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{assessment.title}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Score: </span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{attempt.score}/{attempt.totalMarks}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Percentage: </span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{attempt.percentage}%</span>
            </div>
          </div>
        </div>

        {/* Answers */}
        {allAnswers.length === 0 ? (
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '3rem', 
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
          }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No answers found</p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Total answers: {attempt.answers?.length || 0}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {allAnswers.map((answer, index) => {
              const question = assessment.questions[answer.questionIndex];
              const isCorrect = question.type === 'mcq' && parseInt(answer.selectedAnswer) === parseInt(question.correctAnswer);
              return (
                <div 
                  key={index}
                  style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
                  }}
                >
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ 
                      background: '#ff6b35', 
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      Question {answer.questionIndex + 1}
                    </span>
                    <span style={{ 
                      background: question.type === 'mcq' ? '#3b82f6' : '#10b981', 
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {question.type === 'mcq' ? 'MCQ' : 'Subjective'}
                    </span>
                    {question.type === 'mcq' && (
                      <span style={{ 
                        background: isCorrect ? '#dcfce7' : '#fecaca', 
                        color: isCorrect ? '#166534' : '#991b1b', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: '1rem' 
                  }}>
                    {question.question.replace(/<[^>]*>/g, '')}
                  </h3>
                  {question.imageUrl && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                      <img 
                        src={question.imageUrl} 
                        alt="Question illustration" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  )}
                  
                  {question.type === 'mcq' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {question.options.map((option, idx) => {
                        const isSelected = parseInt(answer.selectedAnswer) === idx;
                        const isCorrectOption = parseInt(question.correctAnswer) === idx;
                        return (
                          <div 
                            key={idx}
                            style={{ 
                              background: isSelected ? (isCorrectOption ? '#dcfce7' : '#fecaca') : (isCorrectOption ? '#fef3c7' : '#f9fafb'),
                              padding: '1rem', 
                              borderRadius: '8px',
                              borderLeft: isSelected ? '4px solid ' + (isCorrectOption ? '#10b981' : '#ef4444') : (isCorrectOption ? '4px solid #f59e0b' : 'none'),
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem'
                            }}
                          >
                            <span style={{ fontWeight: '600', color: '#374151' }}>{String.fromCharCode(65 + idx)}.</span>
                            <span style={{ color: '#374151', flex: 1 }}>{option}</span>
                            {isSelected && <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Selected</span>}
                            {isCorrectOption && !isSelected && <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b' }}>Correct Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ 
                      background: '#f9fafb', 
                      padding: '1.5rem', 
                      borderRadius: '8px',
                      borderLeft: '4px solid #10b981'
                    }}>
                      {(() => {
                        console.log(`Q${answer.questionIndex} textAnswer:`, answer.textAnswer, 'Type:', typeof answer.textAnswer);
                        return null;
                      })()}
                      {answer.textAnswer ? (
                        <div>
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '0.875rem', 
                            fontWeight: '600',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Candidate's Answer:
                          </div>
                          <p style={{ 
                            color: '#374151', 
                            fontSize: '1rem', 
                            lineHeight: '1.75',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {answer.textAnswer}
                          </p>
                        </div>
                      ) : answer.uploadedFile ? (
                        <div style={{ color: '#374151' }}>
                          <i className="fa fa-file" style={{ marginRight: '0.5rem' }}></i>
                          <span>File uploaded: {answer.uploadedFile.originalName || 'Uploaded file'}</span>
                          {answer.uploadedFile.path && (
                            <a 
                              href={`http://localhost:5000${answer.uploadedFile.path}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ marginLeft: '1rem', color: '#3b82f6', textDecoration: 'underline' }}
                            >
                              View File
                            </a>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p style={{ 
                            color: '#9ca3af', 
                            fontSize: '1rem', 
                            fontStyle: 'italic',
                            margin: 0,
                            marginBottom: '1rem'
                          }}>
                            No answer provided
                          </p>
                          <details style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            <summary style={{ cursor: 'pointer' }}>Debug: View raw answer data</summary>
                            <pre style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f3f4f6', borderRadius: '4px', overflow: 'auto' }}>
                              {JSON.stringify(answer, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div style={{ 
                    marginTop: '1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <span>Marks: {question.marks || 1}</span>
                    <span>Answered at: {new Date(answer.answeredAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
