import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../emp-dashboard.css';

export default function AssessmentResults() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchResults();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.get(`http://localhost:5000/api/employer/assessments/${assessmentId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAssessment(response.data.assessment);
        setResults(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="twm-right-section-panel site-bg-gray emp-dashboard" style={{
        width: '100%',
        margin: 0,
        padding: 0,
        background: '#f7f7f7',
        minHeight: '100vh'
      }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading assessment results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="twm-right-section-panel site-bg-gray emp-dashboard" style={{
      width: '100%',
      margin: 0,
      padding: 0,
      background: '#f7f7f7',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ padding: '2rem 2rem 2rem 2rem' }}>
        <div className="wt-admin-right-page-header clearfix" style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: isMobile ? '1rem' : '2rem', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                {assessment?.title} - Results
              </h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem' }}>
                {results.length} participants completed this assessment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', fontSize: '1.125rem', margin: 0 }}>No results available yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-user me-2" style={{color: '#ff6b35'}}></i>
                      Candidate
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-envelope me-2" style={{color: '#ff6b35'}}></i>
                      Email
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-trophy me-2" style={{color: '#ff6b35'}}></i>
                      Score
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-percent me-2" style={{color: '#ff6b35'}}></i>
                      Percentage
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-flag me-2" style={{color: '#ff6b35'}}></i>
                      Result
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-calendar me-2" style={{color: '#ff6b35'}}></i>
                      Completed
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-exclamation-triangle me-2"></i>
                      Violations
                    </th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', color: '#232323', fontSize: '13px', border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <i className="fa fa-eye me-2" style={{color: '#ff6b35'}}></i>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result._id} style={{ 
                      borderBottom: index < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>
                        {result.candidateId?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {result.candidateId?.email || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: '#111827', fontWeight: '600' }}>
                        {result.score}/{result.totalMarks}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: result.percentage >= 70 ? '#dcfce7' : result.percentage >= 50 ? '#fef3c7' : '#fecaca',
                          color: result.percentage >= 70 ? '#166534' : result.percentage >= 50 ? '#92400e' : '#991b1b',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: result.result === 'pass' ? '#dcfce7' : '#fecaca',
                          color: result.result === 'pass' ? '#166534' : '#991b1b',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {result.result || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        {new Date(result.endTime).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: result.violations?.length > 0 ? '#fef3c7' : '#f3f4f6',
                          color: result.violations?.length > 0 ? '#92400e' : '#6b7280',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {result.violations?.length || 0}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          style={{
                            background: '#f97316',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => navigate(`/employer/emp-candidate-review/${result.applicationId || result._id}`)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ea580c';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f97316';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
