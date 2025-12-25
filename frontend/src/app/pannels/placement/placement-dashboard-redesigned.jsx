import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { debugAuth, testAPIConnection, testPlacementAuth } from '../../../utils/authDebug';
import PlacementNotificationsRedesigned from './sections/PlacementNotificationsRedesigned';
import './placement-dashboard-redesigned.css';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../utils/popupNotification';
import NotificationBell from '../../../components/NotificationBell';

function PlacementDashboardRedesigned() {
    const { user, userType, isAuthenticated, loading: authLoading } = useAuth();
    const [placementData, setPlacementData] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        firstName: '',
        lastName: '',
        phone: '',
        collegeName: '',
        collegeAddress: '',
        collegeOfficialEmail: '',
        collegeOfficialPhone: ''
    });
    const [updating, setUpdating] = useState(false);
    const [stats, setStats] = useState({
        totalStudents: 0,
        avgCredits: 0,
        activeBatches: 0,
        coursesCovered: 0
    });

    useEffect(() => {
        const initializeDashboard = async () => {
            debugAuth();
            
            const apiTest = await testAPIConnection();
            if (!apiTest.success) {
                console.error('API Connection failed:', apiTest.error);
                setLoading(false);
                return;
            }
            
            if (!authLoading && isAuthenticated() && userType === 'placement') {
                const authTest = await testPlacementAuth();
                if (!authTest.success) {
                    console.error('Auth test failed:', authTest.error);
                    if (authTest.status === 401) {
                        localStorage.removeItem('placementToken');
                        localStorage.removeItem('placementUser');
                        window.location.href = '/login';
                        return;
                    }
                }
                
                Promise.all([
                    fetchPlacementDetails(),
                    fetchStudentData()
                ]).catch(() => {});
            }
        };
        
        initializeDashboard();
    }, [authLoading, userType, isAuthenticated]);

    const fetchPlacementDetails = async () => {
        try {
            if (authLoading || !isAuthenticated() || userType !== 'placement') {
                return;
            }
            
            const token = localStorage.getItem('placementToken');
            if (!token) {
                console.error('Authentication token missing');
                return;
            }
            
            console.log('Fetching placement profile...');
            const profileData = await api.getPlacementfile();
            console.log('Profile data received:', profileData);
            
            if (profileData && profileData.success) {
                console.log('Setting placement data:', profileData.placement);
                setPlacementData(profileData.placement);
            } else {
                console.error('Profile fetch failed:', profileData?.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            if (error.message.includes('401')) {
                showError('Authentication failed. Please login again.');
                localStorage.removeItem('placementToken');
                localStorage.removeItem('placementUser');
                window.location.href = '/placement/login';
            }
        }
    };

    const fetchStudentData = async () => {
        try {
            const token = localStorage.getItem('placementToken');
            if (!token) {
                console.error('No placement token found');
                setLoading(false);
                return;
            }
            
            console.log('Fetching student data...');
            const data = await api.getMyPlacementData();
            console.log('Student data response:', data);
            
            if (data.success) {
                setStudentData(data.students || []);
                calculateStats(data.students || []);
                console.log('Student data loaded:', data.students?.length || 0, 'students');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (students) => {
        const totalStudents = students.length;
        const totalCredits = students.reduce((sum, student) => sum + (parseInt(student.credits) || 0), 0);
        const avgCredits = totalStudents > 0 ? Math.round(totalCredits / totalStudents) : 0;
        const courses = [...new Set(students.map(s => s.course).filter(c => c && c !== 'Not Specified'))];
        const batches = [...new Set(students.map(s => s.batch).filter(b => b))];
        
        setStats({
            totalStudents,
            avgCredits,
            activeBatches: batches.length || 1,
            coursesCovered: courses.length
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('studentData', file);

            const data = await api.uploadStudentData(formData);
            
            if (data.success) {
                showSuccess('Student data uploaded successfully! Waiting for admin approval.');
                fetchPlacementDetails();
            } else {
                showError(data.message || 'Upload failed');
            }
        } catch (error) {
            showError(error.message || 'Upload failed. Please try again.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleEditProfile = () => {
        let firstName = placementData?.firstName || '';
        let lastName = placementData?.lastName || '';
        
        if (!firstName && !lastName && placementData?.name) {
            const nameParts = placementData.name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        
        setEditFormData({
            name: placementData?.name || '',
            firstName: firstName,
            lastName: lastName,
            phone: placementData?.phone || '',
            collegeName: placementData?.collegeName || '',
            collegeAddress: placementData?.collegeAddress || '',
            collegeOfficialEmail: placementData?.collegeOfficialEmail || '',
            collegeOfficialPhone: placementData?.collegeOfficialPhone || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateProfile = async () => {
        if (!editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.phone.trim() || !editFormData.collegeName.trim()) {
            showWarning('All fields are required');
            return;
        }

        setUpdating(true);
        try {
            const response = await api.updatePlacementfile(editFormData);
            
            if (response && response.success) {
                showSuccess('Profile updated successfully!');
                setShowEditModal(false);
                await fetchPlacementDetails();
            } else {
                showError(response?.message || 'Failed to update profile');
            }
        } catch (error) {
            showError(error.message || 'Error updating profile. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleViewFile = async (fileId, fileName) => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/placement/files/${fileId}/view`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('placementToken')}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.fileData) {
                    const cleanedData = data.fileData.map(row => {
                        return {
                            name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || '',
                            email: row.Email || row.email || row.EMAIL || '',
                            phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
                            course: row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
                            credits: row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || '0'
                        };
                    });
                    setStudentData(cleanedData);
                    setActiveTab('students'); // Switch to students tab to show the data
                    showSuccess(`Loaded data from ${fileName}`);
                } else {
                    showWarning('File data not available or file not processed yet.');
                }
            } else {
                showError('Unable to view file. Please try again.');
            }
        } catch (error) {
            console.error('Error viewing file:', error);
            showError('Error viewing file. Please try again.');
        }
    };

    const recalculateStats = () => {
        calculateStats(studentData);
        showSuccess('Statistics recalculated successfully!');
    };

    if (authLoading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <h4>Authenticating...</h4>
                </div>
            </div>
        );
    }

    if (!authLoading && (!isAuthenticated() || userType !== 'placement')) {
        return (
            <div className="dashboard-container">
                <div className="access-denied">
                    <i className="fa fa-lock"></i>
                    <h3>Access Denied</h3>
                    <p>Please login with valid placement officer credentials.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <h3>Placement</h3>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <div 
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="fa fa-dashboard"></i>
                        <span>Overview</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        <i className="fa fa-users"></i>
                        <span>Student Directory</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <i className="fa fa-upload"></i>
                        <span>Batch Upload</span>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div 
                        className="nav-item logout"
                        onClick={() => {
                            localStorage.removeItem('placementToken');
                            window.location.href = '/login';
                        }}
                    >
                        <i className="fa fa-sign-out"></i>
                        <span>Logout</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Header */}
                <div className="top-header">
                    <div className="header-actions">
                        <NotificationBell userRole="placement" />
                        <div className="user-profile">
                            <span>Placement Officer</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="content-area">
                    {activeTab === 'overview' && (
                        <>
                            {/* Profile Card with Notifications */}
                            <div className="profile-notifications-container">
                                <div className="profile-card">
                                    <div className="profile-left">
                                        <div className="image-container">
                                            <div className="profile-image">
                                                {placementData?.logo ? (
                                                    <img 
                                                        src={placementData.logo.startsWith('data:') ? placementData.logo : `data:image/jpeg;base64,${placementData.logo}`} 
                                                        alt="Profile" 
                                                    />
                                                ) : (
                                                    <i className="fa fa-user"></i>
                                                )}
                                            </div>
                                            <small className="image-label">College Logo</small>
                                        </div>
                                        <div className="image-container">
                                            <div className="id-card-image">
                                                {placementData?.idCard ? (
                                                    <img 
                                                        src={placementData.idCard.startsWith('data:') ? placementData.idCard : `data:image/jpeg;base64,${placementData.idCard}`} 
                                                        alt="ID Card" 
                                                    />
                                                ) : (
                                                    <i className="fa fa-id-card"></i>
                                                )}
                                            </div>
                                            <small className="image-label">ID Card</small>
                                        </div>
                                    </div>
                                    <div className="profile-center">
                                        <div className="role-label">PLACEMENT OFFICER</div>
                                        <h2 className="officer-name">
                                            {placementData?.name || user?.name || 'Name not available'}
                                        </h2>
                                        <div className="contact-info">
                                            <div className="contact-item">
                                                <i className="fa fa-envelope"></i>
                                                <span>{placementData?.email || user?.email || 'Email not available'}</span>
                                            </div>
                                            <div className="contact-item">
                                                <i className="fa fa-phone"></i>
                                                <span>{placementData?.phone || 'Phone not available'}</span>
                                            </div>
                                            <div className="contact-item">
                                                <i className="fa fa-graduation-cap"></i>
                                                <span>{placementData?.collegeName || 'College Name Not Available'}</span>
                                            </div>
                                            {placementData?.collegeAddress && (
                                                <div className="contact-item">
                                                    <i className="fa fa-map-marker"></i>
                                                    <span>{placementData.collegeAddress}</span>
                                                </div>
                                            )}
                                            {placementData?.collegeOfficialEmail && (
                                                <div className="contact-item">
                                                    <i className="fa fa-envelope-o"></i>
                                                    <span>Official: {placementData.collegeOfficialEmail}</span>
                                                </div>
                                            )}
                                            {placementData?.collegeOfficialPhone && (
                                                <div className="contact-item">
                                                    <i className="fa fa-phone-square"></i>
                                                    <span>Official: {placementData.collegeOfficialPhone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="profile-right">
                                        <button className="directory-btn" onClick={handleEditProfile}>
                                            <i className="fa fa-users"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Notifications Panel - Beside Profile */}
                                <div className="notifications-panel">
                                    <PlacementNotificationsRedesigned />
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="stats-section">
                                <div className="stats-header">
                                    <h3>Overview & Performance</h3>
                                    <button className="recalculate-btn" onClick={recalculateStats}>
                                        <i className="fa fa-refresh"></i>
                                        Recalculate Stats
                                    </button>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <i className="fa fa-users"></i>
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-label">Total Students</div>
                                            <div className="stat-value">{stats.totalStudents}</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <i className="fa fa-star"></i>
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-label">Avg Credits</div>
                                            <div className="stat-value">{stats.avgCredits}</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <i className="fa fa-graduation-cap"></i>
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-label">Active Batches</div>
                                            <div className="stat-value">{stats.activeBatches}</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <i className="fa fa-book"></i>
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-label">Courses Covered</div>
                                            <div className="stat-value">{stats.coursesCovered}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Batch Activity */}
                            <div className="activity-section">
                                <div className="activity-header">
                                    <div className="header-left">
                                        <h3>Recent Batch Activity</h3>
                                        <p className="activity-subtitle">Track your latest batch uploads and processing status</p>
                                    </div>
                                    <a href="#" className="manage-all-link">Manage All Batches</a>
                                </div>
                                <div className="activity-list">
                                    {placementData?.fileHistory && placementData.fileHistory.length > 0 ? (
                                        placementData.fileHistory.slice(0, 5).map((file, index) => (
                                            <div key={file._id || index} className="activity-item">
                                                <div className="activity-content">
                                                    <div className="batch-name">{file.customName || 'CSE'}</div>
                                                    <div className="file-name">{file.fileName}</div>
                                                    <div className="activity-metadata">
                                                        <span><i className="fa fa-university"></i>{placementData?.collegeName || 'College Name'}</span>
                                                        <span><i className="fa fa-calendar"></i>{file.batch || 'Batch 2024'}</span>
                                                        <span><i className="fa fa-clock-o"></i>{new Date(file.uploadedAt).toLocaleDateString()} {new Date(file.uploadedAt).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="activity-action">
                                                    <button className="view-btn" onClick={() => handleViewFile(file._id, file.fileName)}>
                                                        <i className="fa fa-eye"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-activity">
                                            <i className="fa fa-history"></i>
                                            <p>No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'students' && (
                        <div className="students-section">
                            <div className="section-header">
                                <h3>Student Directory</h3>
                                <div className="student-count">{studentData.length} Students</div>
                            </div>
                            {loading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading student data...</p>
                                </div>
                            ) : studentData.length > 0 ? (
                                <div className="students-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Course</th>
                                                <th>Credits</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentData.map((student, index) => (
                                                <tr key={index}>
                                                    <td>{student.name || '-'}</td>
                                                    <td>{student.email || '-'}</td>
                                                    <td>{student.phone || '-'}</td>
                                                    <td>{student.course || 'Not Specified'}</td>
                                                    <td>
                                                        <span className="credits-badge">{student.credits || 0}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <i className="fa fa-users"></i>
                                    <h4>No student data available</h4>
                                    <p>Upload a file and wait for admin approval to see students here</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="upload-page">
                            <div className="upload-container">
                                {/* Configuration & Details Form */}
                                <div className="config-form-card">
                                    <div className="form-header">
                                        <h3>Configuration & Details</h3>
                                        <p className="form-subtitle">Upload and configure student data files for batch processing</p>
                                    </div>
                                    
                                    <div className="form-content">
                                        {/* File Upload Area */}
                                        <div className="upload-field">
                                            <label className="field-label">Student Data File *</label>
                                            <div 
                                                className="file-upload-area"
                                                onClick={() => !uploadingFile && document.getElementById('fileInput').click()}
                                            >
                                                <i className="fa fa-file-excel-o upload-icon"></i>
                                                <span className="upload-text">
                                                    {uploadingFile ? 'Uploading...' : 'Click to select student data file (CSV, XLSX)'}
                                                </span>
                                                {uploadingFile && <div className="upload-spinner"></div>}
                                            </div>
                                            <input 
                                                id="fileInput"
                                                type="file" 
                                                accept=".xlsx,.xls,.csv"
                                                style={{display: 'none'}}
                                                onChange={handleFileUpload}
                                            />
                                        </div>

                                        {/* Form Fields */}
                                        <div className="form-fields">
                                            <div className="field-group">
                                                <label className="field-label">Custom Display Name</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input"
                                                    placeholder="Enter a custom name for this batch (optional)"
                                                />
                                            </div>
                                            
                                            <div className="field-group">
                                                <label className="field-label">University</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input"
                                                    placeholder="Enter university name"
                                                />
                                            </div>
                                            
                                            <div className="field-group">
                                                <label className="field-label">Batch</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input"
                                                    placeholder="Enter batch information (e.g., 2024, Spring 2024)"
                                                />
                                            </div>
                                        </div>

                                        <div className="helper-text">
                                            <i className="fa fa-info-circle"></i>
                                            Files will be processed automatically after admin approval. Default naming will be used if custom name is not provided.
                                        </div>
                                        
                                        <div className="sample-download">
                                            <button 
                                                className="sample-btn"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = '/assets/sample-student-data.csv';
                                                    link.download = 'sample-student-data.csv';
                                                    link.click();
                                                }}
                                            >
                                                <i className="fa fa-download"></i>
                                                Download Sample Data
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="form-actions">
                                        <button className="btn-cancel">Cancel</button>
                                        <button className="btn-upload" disabled={uploadingFile}>
                                            <i className="fa fa-upload"></i>
                                            Upload Dataset
                                        </button>
                                    </div>
                                </div>

                                {/* Recent History Panel */}
                                <div className="history-panel">
                                    <div className="history-header">
                                        <h4>Recent History</h4>
                                        <a href="#" className="view-all-link">View All</a>
                                    </div>
                                    
                                    <div className="history-list">
                                        {placementData?.fileHistory && placementData.fileHistory.length > 0 ? (
                                            placementData.fileHistory.slice(0, 4).map((file, index) => (
                                                <div key={file._id || index} className="history-item">
                                                    <div className="history-content">
                                                        <div className="history-title">
                                                            {file.customName || file.fileName}
                                                        </div>
                                                        <div className="history-details">
                                                            <div className="detail-line">{file.fileName}</div>
                                                            <div className="detail-line">{file.university || 'University Name'}</div>
                                                            <div className="detail-line">Batch {file.batch || '2024'}</div>
                                                            <div className="detail-line">{new Date(file.uploadedAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="history-actions">
                                                        <div className="status-icon">
                                                            <i className={`fa ${
                                                                file.status === 'processed' ? 'fa-check-circle status-success' : 
                                                                file.status === 'approved' ? 'fa-check status-info' : 
                                                                file.status === 'rejected' ? 'fa-times status-danger' : 'fa-clock-o status-warning'
                                                            }`}></i>
                                                        </div>
                                                        <a href="#" className="details-link">Details</a>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-history">
                                                <i className="fa fa-history"></i>
                                                <p>No upload history yet</p>
                                                <small>Your upload history will appear here</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Profile</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input
                                    type="text"
                                    value={editFormData.firstName || ''}
                                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input
                                    type="text"
                                    value={editFormData.lastName || ''}
                                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                                    placeholder="Enter your last name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    value={editFormData.phone || ''}
                                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div className="form-group">
                                <label>College Name *</label>
                                <input
                                    type="text"
                                    value={editFormData.collegeName || ''}
                                    onChange={(e) => setEditFormData({...editFormData, collegeName: e.target.value})}
                                    placeholder="Enter your college name"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={updating}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleUpdateProfile} disabled={updating}>
                                {updating ? (
                                    <>
                                        <div className="spinner-sm"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-save"></i>
                                        Update Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlacementDashboardRedesigned;