import { useEffect, useState } from "react";
import JobZImage from "../../../common/jobz-img";
import { useNavigate, useParams } from "react-router-dom";
import './admin-candidate-review.css';

function AdminCandidateReviewPage() {
    const navigate = useNavigate();
    const { candidateId } = useParams();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        fetchCandidateDetails();
    }, [candidateId]);

    const fetchCandidateDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                console.error('No admin token found');
                return;
            }

            console.log('Fetching candidate details for ID:', candidateId);
            
            // Add cache-busting parameter to ensure fresh data
            const response = await fetch(`http://localhost:5000/api/admin/candidates/${candidateId}?t=${Date.now()}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Candidate data received:', data);
                setCandidate(data.candidate);
            } else {
                const errorData = await response.text();
                console.error('API Error:', response.status, errorData);
                if (response.status === 403) {
                    setError('Access denied. You may not have permission to view candidate details.');
                } else if (response.status === 404) {
                    setError('Candidate not found. The candidate may have been deleted or the ID is invalid.');
                } else {
                    setError(`Failed to load candidate details. Status: ${response.status}`);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const refreshCandidateData = async () => {
        setLoading(true);
        await fetchCandidateDetails();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    };

    const downloadDocument = (fileData, fileName) => {
        if (!fileData) return;
        
        if (fileData.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = fileData;
            link.download = fileName || 'document';
            link.click();
        } else {
            const link = document.createElement('a');
            link.href = `http://localhost:5000/${fileData}`;
            link.download = fileName || 'document';
            link.click();
        }
    };

    const viewDocument = (fileData) => {
        if (!fileData) return;
        
        if (fileData.startsWith('data:')) {
            const byteCharacters = atob(fileData.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const mimeType = fileData.split(',')[0].split(':')[1].split(';')[0];
            const blob = new Blob([byteArray], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
        } else {
            window.open(`http://localhost:5000/${fileData}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="candidate-review-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading candidate details...</p>
                </div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="candidate-review-error">
                <div className="error-content">
                    <i className="fas fa-user-slash"></i>
                    <h3>{error ? 'Error Loading Candidate' : 'Candidate not found'}</h3>
                    <p>{error || 'The requested candidate could not be found.'}</p>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="candidate-review-container">
            {/* Header Section */}
            <div className="candidate-review-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Candidates</span>
                </button>
                <div className="header-title">
                    <h2>Candidate Profile Review</h2>
                    <p>Comprehensive candidate information and documents</p>
                </div>
                <button className="refresh-btn" onClick={refreshCandidateData} disabled={loading}>
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {candidate.profilePicture ? (
                            <img src={candidate.profilePicture} alt={candidate.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                        <div className="status-indicator active"></div>
                    </div>
                    <div className="profile-info">
                        <h3>{candidate.name}</h3>
                        <p className="email">{candidate.email}</p>
                        <div className="profile-stats">
                            <div className="stat">
                                <span className="label">Registered</span>
                                <span className="value">{formatDate(candidate.createdAt)}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Status</span>
                                <span className={`value status ${candidate.isProfileComplete ? 'complete' : 'incomplete'}`}>
                                    {candidate.isProfileComplete ? 'Complete' : 'Incomplete'}
                                    {candidate.profileCompletionPercentage !== undefined && (
                                        <span className="completion-percentage"> ({candidate.profileCompletionPercentage}%)</span>
                                    )}
                                </span>
                                {!candidate.isProfileComplete && candidate.missingSections && candidate.missingSections.length > 0 && (
                                    <div className="missing-sections">
                                        <small>Missing: {candidate.missingSections.join(', ')}</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personal')}
                >
                    <i className="fas fa-user"></i>
                    Personal Info
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
                    onClick={() => setActiveTab('education')}
                >
                    <i className="fas fa-graduation-cap"></i>
                    Education
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                >
                    <i className="fas fa-cogs"></i>
                    Skills & Summary
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    <i className="fas fa-file-alt"></i>
                    Documents
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
                    onClick={() => setActiveTab('company')}
                >
                    <i className="fas fa-building"></i>
                    Company Details
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                    <div className="tab-panel personal-info">
                        {(() => {
                            const hasPersonalInfo = candidate.name || candidate.phone || candidate.dateOfBirth || candidate.gender || candidate.fatherName || candidate.motherName || candidate.residentialAddress || candidate.permanentAddress;
                            
                            if (!hasPersonalInfo) {
                                return (
                                    <div className="no-personal-info">
                                        <div className="no-data-content">
                                            <i className="fas fa-user-times"></i>
                                            <h5>No Personal Information Available</h5>
                                            <p>This candidate hasn't provided personal information yet.</p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="personal-info-container">
                                    <div className="info-rows">
                                        <div className="info-row">
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>First Name</label>
                                                    <span>{candidate.firstName || candidate.name || 'Not provided'}</span>
                                                </div>
                                            </div>
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Middle Name</label>
                                                    <span>{candidate.middleName || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Last Name</label>
                                                    <span>{candidate.lastName || 'Not provided'}</span>
                                                </div>
                                            </div>
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-envelope"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Email Address</label>
                                                    <span>{candidate.email || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-phone"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Mobile Number</label>
                                                    <span>{candidate.phone || candidate.mobileNumber || 'Not provided'}</span>
                                                </div>
                                            </div>
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-calendar-alt"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Date of Birth</label>
                                                    <span>{candidate.dateOfBirth ? formatDate(candidate.dateOfBirth) : 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-venus-mars"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Gender</label>
                                                    <span>{candidate.gender || 'Not provided'}</span>
                                                </div>
                                            </div>
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-map-marker-alt"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Location</label>
                                                    <span>{candidate.location || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-map-pin"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Pincode</label>
                                                    <span>{candidate.pincode || 'Not provided'}</span>
                                                </div>
                                            </div>
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-clock"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Registration Date</label>
                                                    <span>{formatDate(candidate.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-male"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Father's/Husband's Name</label>
                                                    <span>{candidate.fatherName || 'Not provided'}</span>
                                                </div>
                                            </div>
                                            <div className="info-field">
                                                <div className="field-icon">
                                                    <i className="fas fa-female"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Mother's Name</label>
                                                    <span>{candidate.motherName || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="info-row single-field">
                                            <div className="info-field full-width">
                                                <div className="field-icon">
                                                    <i className="fas fa-home"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Residential Address</label>
                                                    <span>{candidate.residentialAddress || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="info-row single-field">
                                            <div className="info-field full-width">
                                                <div className="field-icon">
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <div className="field-content">
                                                    <label>Permanent Address</label>
                                                    <span>{candidate.permanentAddress || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                        }
                    </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                    <div className="tab-panel education-info">
                        {!candidate.education || candidate.education.length === 0 ? (
                            <div className="no-education">
                                <div className="no-data-content">
                                    <i className="fas fa-graduation-cap"></i>
                                    <h5>No Education Information Available</h5>
                                    <p>This candidate hasn't provided education details yet.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="education-timeline">
                                {candidate.education.map((edu, index) => {
                                    const levels = ['10th Standard', '12th Standard', 'Degree'];
                                    return (
                                        <div key={index} className="education-item">
                                            <div className="education-icon">
                                                <i className="fas fa-graduation-cap"></i>
                                            </div>
                                            <div className="education-content">
                                                <div className="education-header">
                                                    <h4>{levels[index] || 'Education'}</h4>
                                                </div>
                                                <div className="education-details">
                                                    {edu.degreeName && (
                                                        <div className="detail-item">
                                                            <label>Degree:</label>
                                                            <span>{edu.degreeName}</span>
                                                        </div>
                                                    )}
                                                    <div className="detail-item">
                                                        <label>Institution:</label>
                                                        <span>{edu.collegeName || 'Not provided'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>Year of Passing:</label>
                                                        <span>{edu.passYear || edu.yearOfPassing || edu.year || 'Not provided'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>Score:</label>
                                                        <span>
                                                            {edu.scoreValue || edu.percentage || edu.score || 'Not provided'}
                                                            {(edu.scoreType === 'percentage' || edu.percentage) ? '%' : ''}
                                                            {edu.scoreType && edu.scoreType !== 'percentage' ? ` ${edu.scoreType.toUpperCase()}` : ''}
                                                            {edu.cgpa && ` (CGPA: ${edu.cgpa})`}
                                                        </span>
                                                    </div>
                                                    {edu.specialization && (
                                                        <div className="detail-item">
                                                            <label>Specialization:</label>
                                                            <span>{edu.specialization}</span>
                                                        </div>
                                                    )}
                                                    {edu.registrationNumber && (
                                                        <div className="detail-item">
                                                            <label>Registration Number:</label>
                                                            <span>{edu.registrationNumber}</span>
                                                        </div>
                                                    )}
                                                    {edu.state && (
                                                        <div className="detail-item">
                                                            <label>State:</label>
                                                            <span>{edu.state}</span>
                                                        </div>
                                                    )}
                                                    {edu.marksheet && (
                                                        <div className="document-actions">
                                                            <button
                                                                className="action-btn view"
                                                                onClick={() => viewDocument(edu.marksheet)}
                                                                title="View Marksheet"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button
                                                                className="action-btn download"
                                                                onClick={() => downloadDocument(edu.marksheet, `marksheet_${levels[index].replace(' ', '_').toLowerCase()}.pdf`)}
                                                                title="Download"
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Skills & Summary Tab */}
                {activeTab === 'skills' && (
                    <div className="tab-panel skills-info">
                        {(() => {
                            const hasSkills = candidate.skills && candidate.skills.length > 0;
                            const hasSummary = candidate.profileSummary;
                            const hasEmployment = candidate.employment && candidate.employment.length > 0;
                            
                            if (!hasSkills && !hasSummary && !hasEmployment) {
                                return (
                                    <div className="no-skills">
                                        <div className="no-data-content">
                                            <i className="fas fa-cogs"></i>
                                            <h5>No Skills & Summary Available</h5>
                                            <p>This candidate hasn't provided skills or profile summary yet.</p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    {hasSkills && (
                                        <div className="skills-section">
                                            <div className="section-header">
                                                <i className="fas fa-cogs"></i>
                                                <h4>Technical Skills</h4>
                                            </div>
                                            <div className="skills-grid">
                                                {candidate.skills.map((skill, index) => (
                                                    <div key={index} className="skill-tag">
                                                        <span>{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {hasSummary && (
                                        <div className="summary-section">
                                            <div className="section-header">
                                                <i className="fas fa-user-edit"></i>
                                                <h4>Profile Summary</h4>
                                            </div>
                                            <div className="summary-content">
                                                <p>{candidate.profileSummary}</p>
                                            </div>
                                        </div>
                                    )}

                                    {candidate.employment && candidate.employment.length > 0 && (
                                        <div className="employment-section">
                                            <div className="section-header">
                                                <i className="fas fa-briefcase"></i>
                                                <h4>Present Employment {candidate.totalExperience && `(Total Experience: ${candidate.totalExperience})`}</h4>
                                            </div>
                                            <div className="employment-list">
                                                {candidate.employment.map((emp, index) => (
                                                    <div key={index} className="employment-item">
                                                        <div className="employment-header">
                                                            <h5>{emp.designation}</h5>
                                                            <span className={`employment-status ${emp.isCurrent ? 'current' : 'past'}`}>
                                                                {emp.isCurrent ? 'Current' : 'Past'}
                                                            </span>
                                                        </div>
                                                        <div className="employment-details">
                                                            <div className="detail-row">
                                                                <i className="fas fa-building"></i>
                                                                <span>{emp.organization}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <i className="fas fa-calendar"></i>
                                                                <span>
                                                                    {emp.startDate ? new Date(emp.startDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'Start Date'} - 
                                                                    {emp.isCurrent ? 'Present' : (emp.endDate ? new Date(emp.endDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'End Date')}
                                                                </span>
                                                            </div>
                                                            {emp.description && (
                                                                <div className="employment-description">
                                                                    <p>{emp.description}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()
                        }
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="tab-panel documents-info">
                        {(() => {
                            const hasResume = candidate.resume;
                            const hasMarksheets = candidate.education && candidate.education.some(edu => edu.marksheet);
                            const hasAnyDocuments = hasResume || hasMarksheets;

                            if (!hasAnyDocuments) {
                                return (
                                    <div className="no-documents">
                                        <div className="no-data-content">
                                            <i className="fas fa-file-times"></i>
                                            <h5>No Documents Uploaded</h5>
                                            <p>This candidate hasn't uploaded any documents yet.</p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="documents-grid">
                                    {candidate.resume && (
                                        <div className="document-card">
                                            <div className="document-icon">
                                                <i className="fas fa-file-pdf"></i>
                                            </div>
                                            <div className="document-info">
                                                <h5>Resume</h5>
                                                <p>Candidate's complete resume</p>
                                            </div>
                                            <div className="document-actions">
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => viewDocument(candidate.resume)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    className="action-btn download"
                                                    onClick={() => downloadDocument(candidate.resume, 'resume.pdf')}
                                                >
                                                    <i className="fas fa-download"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {candidate.education && candidate.education.map((edu, index) => {
                                        if (!edu.marksheet) return null;
                                        const levels = ['10th Standard', '12th Standard', 'Degree'];
                                        return (
                                            <div key={index} className="document-card">
                                                <div className="document-icon">
                                                    <i className="fas fa-certificate"></i>
                                                </div>
                                                <div className="document-info">
                                                    <h5>{levels[index]} Marksheet</h5>
                                                    <p>Academic certificate and marks</p>
                                                </div>
                                                <div className="document-actions">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => viewDocument(edu.marksheet)}
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        className="action-btn download"
                                                        onClick={() => downloadDocument(edu.marksheet, `marksheet_${levels[index].replace(' ', '_').toLowerCase()}.pdf`)}
                                                    >
                                                        <i className="fas fa-download"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()
                        }
                    </div>
                )}

                {/* Company Details Tab */}
                {activeTab === 'company' && (
                    <div className="tab-panel company-info">
                        <div className="section-header">
                            <i className="fas fa-building"></i>
                            <h4>Job Applications & Company Details</h4>
                        </div>
                        
                        {candidate.applications && candidate.applications.length > 0 ? (
                            <div className="company-table-container">
                                <table className="company-details-table">
                                    <thead>
                                        <tr>
                                            <th>Company Name</th>
                                            <th>Job Categories</th>
                                            <th>Shortlisted Status</th>
                                            <th>Current Round</th>
                                            <th>Selected</th>
                                            <th>Registered Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candidate.applications.map((application, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="company-cell">
                                                        <i className="fas fa-building company-icon"></i>
                                                        <span>{application.companyName || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="job-category">
                                                        {application.jobCategory || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${application.status === 'shortlisted' || application.shortlistedStatus ? 'shortlisted' : 'pending'}`}>
                                                        {application.status === 'shortlisted' || application.shortlistedStatus ? 'Shortlisted' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="round-info">
                                                        {application.currentRound || 'Initial'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${application.status === 'shortlisted' || application.shortlistedStatus || application.selected || application.isSelectedForProcess ? 'selected' : 'not-selected'}`}>
                                                        {application.status === 'shortlisted' || application.shortlistedStatus || application.selected || application.isSelectedForProcess ? 'Selected' : 'Not Selected'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="date-info">
                                                        {formatDate(application.appliedDate || application.createdAt)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-applications">
                                <div className="no-data-content">
                                    <i className="fas fa-briefcase"></i>
                                    <h5>No Job Applications Found</h5>
                                    <p>This candidate hasn't applied to any jobs yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminCandidateReviewPage;
