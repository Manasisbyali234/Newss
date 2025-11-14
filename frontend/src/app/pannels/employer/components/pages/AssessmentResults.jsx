import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function AssessmentResults() {
  const { assessmentId } = useParams();
  const [results, setResults] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
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

  if (loading) return <div className="container mt-4"><p>Loading...</p></div>;

  return (
    <div className="container mt-4">
      <div className="card mb-4">
        <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #ffb366 0%, #ff9933 100%)'}}>
          <h4 className="mb-0">{assessment?.title} - Results</h4>
          <small>{results.length} participants</small>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Result</th>
                  <th>Completed At</th>
                  <th>Violations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id}>
                    <td>{result.candidateId?.name || 'N/A'}</td>
                    <td>{result.candidateId?.email || 'N/A'}</td>
                    <td>{result.score}/{result.totalMarks}</td>
                    <td>{result.percentage}%</td>
                    <td>
                      <span className={`badge ${result.result === 'pass' ? 'bg-success' : 'bg-danger'}`}>
                        {result.result?.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(result.endTime).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${result.violations?.length > 0 ? 'bg-warning' : 'bg-secondary'}`}>
                        {result.violations?.length || 0}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm rounded-pill"
                        style={{backgroundColor: '#ffb366', color: 'white', border: 'none', padding: '6px 16px', transition: 'none'}}
                        onClick={() => window.open(`/employer/emp-candidate-review/${result.applicationId || result._id}`, '_blank')}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffb366'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffb366'}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
