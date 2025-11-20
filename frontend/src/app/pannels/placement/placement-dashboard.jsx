import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { debugAuth, testAPIConnection, testPlacementAuth } from '../../../utils/authDebug';
import showToast from '../../../utils/toastNotification';
import PlacementNotifications from './sections/PlacementNotifications';
import './placement-dashboard.css';

function PlacementDashboard() {
    const { user, userType, isAuthenticated, loading: authLoading } = useAuth();
    const [placementData, setPlacementData] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [processingFiles, setProcessingFiles] = useState({});
    const [placementId, setPlacementId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [customFileName, setCustomFileName] = useState('');
    const [university, setUniversity] = useState('');
    const [batch, setBatch] = useState('');
    const [showNameModal, setShowNameModal] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        firstName: '',
        lastName: '',
        phone: '',
        collegeName: ''
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const initializeDashboard = async () => {
            // Debug authentication state
            debugAuth();
            
            // Test API connection
            const apiTest = await testAPIConnection();
            if (!apiTest.success) {
                console.error('API Connection failed:', apiTest.error);
                setLoading(false);
                return;
            }
            
            if (!authLoading && isAuthenticated() && userType === 'placement') {
                // Test placement authentication
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
                
                // Parallel loading for faster response
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
            
            // Check if token exists
            const token = localStorage.getItem('placementToken');
            if (!token) {
                console.error('Authentication token missing');
                return;
            }
            
            console.log('Fetching placement profile...');
            const profileData = await api.getPlacementProfile();
            console.log('Profile data received:', profileData);
            
            if (profileData.success) {
                console.log('Setting placement data:', profileData.placement);
                setPlacementData(profileData.placement);
                setPlacementId(profileData.placement._id);
                setProfileLoaded(true);
            } else {
                console.error('Profile fetch failed:', profileData.message);
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            if (error.message.includes('401')) {
                alert('Authentication failed. Please login again.');
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
                setDataLoaded(true);
                console.log('Student data loaded:', data.students?.length || 0, 'students');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateFileFormat = async (file) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload only Excel (.xlsx, .xls) or CSV files.');
            return false;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB.');
            return false;
        }
        
        // Check if file is empty
        if (file.size === 0) {
            alert('The selected file is empty. Please choose a file with student data.');
            return false;
        }
        
        // Basic content validation for very small files
        if (file.size < 50) {
            alert('The file appears to be too small to contain valid student data. Please check your file.');
            return false;
        }
        
        return true;
    };

    const handleFileApprove = async (fileId, fileName) => {
        if (!placementId) {
            alert('Placement ID not found');
            return;
        }
        if (!window.confirm(`Approve file "${fileName}"?`)) return;
        
        try {
            setProcessingFiles(prev => ({...prev, [fileId]: 'approving'}));
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/admin/placements/${placementId}/files/${fileId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('placementToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                alert('File approved successfully!');
                fetchPlacementDetails();
            } else {
                alert('Failed to approve file');
            }
        } catch (error) {
            alert('Error approving file');
        } finally {
            setProcessingFiles(prev => ({...prev, [fileId]: null}));
        }
    };

    const handleFileReject = async (fileId, fileName) => {
        if (!placementId) {
            alert('Placement ID not found');
            return;
        }
        if (!window.confirm(`Reject file "${fileName}"?`)) return;
        
        try {
            setProcessingFiles(prev => ({...prev, [fileId]: 'rejecting'}));
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/admin/placements/${placementId}/files/${fileId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('placementToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                alert('File rejected successfully!');
                fetchPlacementDetails();
            } else {
                alert('Failed to reject file');
            }
        } catch (error) {
            alert('Error rejecting file');
        } finally {
            setProcessingFiles(prev => ({...prev, [fileId]: null}));
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
                } else {
                    alert('File data not available or file not processed yet.');
                }
            } else {
                alert('Unable to view file. Please try again.');
            }
        } catch (error) {
            console.error('Error viewing file:', error);
            alert('Error viewing file. Please try again.');
        }
    };

    const handleFileUpload = async (file, customName = '', universityName = '', batchInfo = '') => {
        if (!file) return;
        
        if (!await validateFileFormat(file)) {
            setSelectedFile(null);
            document.getElementById('fileInput').value = '';
            return;
        }

        // Check authentication before upload
        const token = localStorage.getItem('placementToken');
        if (!token) {
            alert('Authentication token missing. Please login again.');
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('studentData', file);
            if (customName.trim()) {
                formData.append('customFileName', customName.trim());
            }
            if (universityName.trim()) {
                formData.append('university', universityName.trim());
            }
            if (batchInfo.trim()) {
                formData.append('batch', batchInfo.trim());
            }

            const data = await api.uploadStudentData(formData);
            
            if (data.success) {
                showToast('Student data uploaded successfully! Waiting for admin approval.', 'success');
                setSelectedFile(null);
                setCustomFileName('');
                setUniversity('');
                setBatch('');
                setPendingFile(null);
                document.getElementById('fileInput').value = '';
                fetchPlacementDetails();
            } else {
                // Show specific error message from backend
                if (data.message && (data.message.includes('empty') || data.message.includes('no data'))) {
                    showToast(`Upload failed: ${data.message}. Please ensure your file contains actual student data, not just headers.`, 'error');
                } else {
                    showToast(data.message || 'Upload failed', 'error');
                }
            }
        } catch (error) {
            
            if (error.message.includes('401') || error.message.includes('authentication')) {
                alert('Authentication failed. Please login again.');
                localStorage.removeItem('placementToken');
                localStorage.removeItem('placementUser');
                window.location.href = '/placement/login';
            } else {
                alert(error.message || 'Upload failed. Please try again.');
            }
        } finally {
            setUploadingFile(false);
        }
    };

    const handleFileSelect = async (file) => {
        if (file && await validateFileFormat(file)) {
            setPendingFile(file);
            setCustomFileName('');
            setUniversity('');
            setBatch('');
            setShowNameModal(true);
        }
    };

    const handleConfirmUpload = () => {
        if (pendingFile) {
            setShowNameModal(false);
            handleFileUpload(pendingFile, customFileName, university, batch);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const base64Logo = event.target.result;
                const token = localStorage.getItem('placementToken');
                
                const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_BASE_URL}/placement/upload-logo`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ logo: base64Logo })
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('Logo uploaded successfully!');
                    fetchPlacementDetails();
                } else {
                    alert('Failed to upload logo');
                }
            } catch (error) {
                alert('Error uploading logo');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleIdCardUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const base64IdCard = event.target.result;
                const token = localStorage.getItem('placementToken');
                
                const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_BASE_URL}/placement/upload-id-card`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idCard: base64IdCard })
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('ID card uploaded successfully!');
                    fetchPlacementDetails();
                } else {
                    alert('Failed to upload ID card');
                }
            } catch (error) {
                alert('Error uploading ID card');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleEditProfile = () => {
        setEditFormData({
            name: placementData?.name || '',
            firstName: placementData?.firstName || '',
            lastName: placementData?.lastName || '',
            phone: placementData?.phone || '',
            collegeName: placementData?.collegeName || ''
        });
        setShowEditModal(true);
        document.body.classList.add('modal-open');
    };

    const handleUpdateProfile = async () => {
        if (!editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.phone.trim() || !editFormData.collegeName.trim()) {
            alert('First Name, Last Name, Phone, and College Name are required');
            return;
        }

        setUpdating(true);
        try {
            const response = await api.updatePlacementProfile(editFormData);
            if (response.success) {
                showToast('Profile updated successfully!', 'success');
                setShowEditModal(false);
                document.body.classList.remove('modal-open');
                fetchPlacementDetails();
            } else {
                showToast(response.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            
            alert('Error updating profile. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    if (authLoading) {
        return (
            <div className="container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <h4>Authenticating...</h4>
                </div>
            </div>
        );
    }

    // Remove the loading check that blocks the dashboard from showing

    if (!authLoading && (!isAuthenticated() || userType !== 'placement')) {
        return (
            <div className="container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
                <div className="modern-card p-5 text-center">
                    <i className="fa fa-lock fa-3x text-danger mb-3"></i>
                    <h3>Access Denied</h3>
                    <p className="text-muted">Please login with valid placement officer credentials.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
            {/* Header */}
            <div className="modern-card mb-4 p-4" style={{padding: '2.5rem', position: 'relative', overflow: 'hidden'}}>
                <div style={{position: 'absolute', top: '-70px', right: '-70px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255, 140, 0, 0.25) 0%, rgba(255, 140, 0, 0) 65%)'}}></div>
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between" style={{position: 'relative', zIndex: 2, gap: '1.5rem'}}>
                    <div>
                        <label className="text-uppercase text-muted" style={{letterSpacing: '3px', fontSize: '0.85rem'}}>Placement Portal</label>
                        <h2 className="mb-0" style={{color: '#1f2937', fontWeight: '700', fontSize: '2.1rem'}}>
                            <i className="fa fa-dashboard mr-2" style={{color: '#ff8c00'}}></i>
                            Placement Dashboard
                        </h2>
                        <p className="text-muted mb-0 mt-2" style={{maxWidth: '520px'}}>Monitor student onboarding progress, manage uploaded data files, and keep your placement operations streamlined.</p>
                    </div>
                    <div className="d-flex flex-wrap align-items-center" style={{gap: '0.75rem'}}>
                        <button 
                            className="btn btn-outline-success"
                            onClick={handleEditProfile}
                            style={{borderRadius: '50px', padding: '0.65rem 1.5rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}
                        >
                            <i className="fa fa-edit"></i>
                            Edit Profile
                        </button>
                        <button 
                            className="btn btn-outline-primary"
                            onClick={() => {
                                fetchPlacementDetails();
                                fetchStudentData();
                            }}
                            style={{borderRadius: '50px', padding: '0.65rem 1.5rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}
                        >
                            <i className="fa fa-refresh"></i>
                            Refresh
                        </button>
                        <button 
                            className="btn"
                            onClick={() => {
                                localStorage.removeItem('placementToken');
                                window.location.href = '/login';
                            }}
                            style={{borderRadius: '50px', padding: '0.65rem 1.5rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', border: '2px solid #FF8237', backgroundColor: '#FF8237'}}
                        >
                            <i className="fa fa-sign-out"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Officer Information */}
            <div className="modern-card mb-4 p-4">
                <div className="row align-items-center mb-4">
                    <div className="col-md-2 text-center">
                        {placementData?.logo ? (
                            <img 
                                src={placementData.logo.startsWith('data:') ? placementData.logo : `data:image/jpeg;base64,${placementData.logo}`} 
                                alt="College Logo" 
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    objectFit: 'contain',
                                    borderRadius: '12px',
                                    border: '2px solid #e9ecef',
                                    background: '#f8f9fa',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('logoInput').click()}
                            />
                        ) : (
                            <div 
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '12px',
                                    border: '2px dashed #ccc',
                                    background: '#f8f9fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('logoInput').click()}
                            >
                                <i className="fa fa-university fa-2x text-muted"></i>
                            </div>
                        )}
                        <input 
                            id="logoInput"
                            type="file" 
                            accept="image/*"
                            style={{display: 'none'}}
                            onChange={handleLogoUpload}
                        />
                        <small className="text-muted d-block mt-2">College Logo</small>
                    </div>
                    <div className="col-md-2 text-center">
                        {placementData?.idCard ? (
                            <img 
                                src={placementData.idCard.startsWith('data:') ? placementData.idCard : `data:image/jpeg;base64,${placementData.idCard}`} 
                                alt="ID Card" 
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    objectFit: 'contain',
                                    borderRadius: '12px',
                                    border: '2px solid #e9ecef',
                                    background: '#f8f9fa',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('idCardInput').click()}
                            />
                        ) : (
                            <div 
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '12px',
                                    border: '2px dashed #ccc',
                                    background: '#f8f9fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('idCardInput').click()}
                            >
                                <i className="fa fa-id-card fa-2x text-muted"></i>
                            </div>
                        )}
                        <input 
                            id="idCardInput"
                            type="file" 
                            accept="image/*"
                            style={{display: 'none'}}
                            onChange={handleIdCardUpload}
                        />
                        <small className="text-muted d-block mt-2">ID Card</small>
                    </div>
                    <div className="col-md-8">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center" style={{gap: '1rem'}}>
                            <div>
                                <span className="text-uppercase text-muted" style={{letterSpacing: '2px', fontSize: '0.75rem'}}>Placement Officer</span>
                                <h3 className="mb-1" style={{color: '#1f2937', fontWeight: 700}}>{placementData?.name || user?.name || JSON.parse(localStorage.getItem('placementUser') || '{}')?.name || 'Name not available'}</h3>
                                <div className="d-flex align-items-center flex-wrap" style={{gap: '1rem'}}>

                                    <span className="d-flex align-items-center" style={{color: '#6c757d'}}>
                                        <i className="fa fa-graduation-cap mr-2" style={{color: '#ff8c00'}}></i>
                                        {placementData?.collegeName || 'College Name Not Available'}
                                    </span>
                                </div>
                                <div className="mt-3" style={{display: 'grid', gap: '0.35rem'}}>
                                    <span className="d-flex align-items-center" style={{color: '#6c757d'}}>
                                        <i className="fa fa-envelope mr-2" style={{color: '#ff8c00'}}></i>
                                        {placementData?.email || user?.email || JSON.parse(localStorage.getItem('placementUser') || '{}')?.email || 'Email not available'}
                                    </span>
                                    <span className="d-flex align-items-center" style={{color: '#6c757d'}}>
                                        <i className="fa fa-phone mr-2" style={{color: '#ff8c00'}}></i>
                                        {placementData?.phone || 'Phone Unavailable'}
                                    </span>
                                </div>
                            </div>
                            <div className="d-flex flex-column" style={{gap: '0.75rem', minWidth: '300px'}}>
                                <div style={{background: 'rgba(255, 140, 0, 0.08)', borderRadius: '16px', padding: '0.5rem', overflow: 'hidden'}}>
                                    <PlacementNotifications />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-4 col-md-6 mb-3">
                        <div className="info-card">
                            <div className="info-icon">
                                <i className="fa fa-users" style={{fontSize: '20px'}}></i>
                            </div>
                            <div>
                                <label className="text-muted mb-1" style={{fontSize: '0.75rem'}}>Total Students</label>
                                <h4 className="mb-0" style={{fontWeight: 700, color: '#1f2937'}}>{studentData.length}</h4>
                                <small className="text-muted">Currently registered in your placement batch</small>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* File Upload Section */}
            <div className="modern-card mb-4 p-4">
                <h5 className="mb-3" style={{color: '#2c3e50'}}>
                    <i className="fa fa-cloud-upload mr-2"></i>
                    Upload Student Data
                </h5>
                <div className="row">
                    <div className="col-md-8">
                        <div 
                            className="upload-zone p-4 text-center"
                            style={{
                                border: '2px dashed #007bff',
                                borderRadius: '12px',
                                background: '#f8f9fa',
                                cursor: 'pointer'
                            }}
                            onClick={() => !uploadingFile && document.getElementById('fileInput').click()}
                        >
                            {uploadingFile ? (
                                <div>
                                    <div className="spinner-border text-primary mb-3" role="status"></div>
                                    <h5 className="text-primary">Uploading...</h5>
                                    <p className="text-muted">Please wait while we process your file</p>
                                </div>
                            ) : (
                                <div>
                                    <i className="fa fa-file-excel-o fa-3x text-primary mb-3"></i>
                                    <h5 className="text-primary mb-2">Drop your file here or click to browse</h5>
                                    <p className="text-muted mb-2">Supported formats: .xlsx, .xls, .csv (Max 5MB)</p>
                                    <p className="text-muted mb-2" style={{fontSize: '0.85rem'}}>
                                        Required: ID | Candidate Name | College Name | Email | Phone | Course | Password | Credits Assigned
                                    </p>
                                    <p className="text-warning mb-3" style={{fontSize: '0.8rem'}}>
                                        <i className="fa fa-exclamation-triangle mr-1"></i>
                                        Files with only headers or empty rows will be rejected
                                    </p>
                                    <button className="btn" disabled={uploadingFile} style={{backgroundColor: '#FDC360', border: '1px solid #FDC360', color: '#000'}}>
                                        <i className="fa fa-upload mr-2"></i>
                                        Choose File
                                    </button>
                                </div>
                            )}
                        </div>
                        <input 
                            id="fileInput"
                            type="file" 
                            accept=".xlsx,.xls,.csv"
                            style={{display: 'none'}}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setSelectedFile(file);
                                    handleFileSelect(file);
                                }
                            }}
                        />
                        <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">
                                    <i className="fa fa-info-circle mr-1"></i>
                                    Required columns: ID, Candidate Name, College Name, Email, Phone, Course, Password, Credits Assigned
                                </small>
                                <div className="d-flex" style={{gap: '8px'}}>
                                    <a 
                                        href="/assets/sample-student-data.csv" 
                                        download="sample-student-data.csv"
                                        className="btn btn-sm btn-light"
                                        style={{fontSize: '0.8rem', border: '1px solid #dee2e6'}}
                                    >
                                        <i className="fa fa-download mr-1"></i>
                                        Sample Data
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3" style={{background: '#e3f2fd', borderRadius: '8px'}}>
                            <h6 className="text-primary mb-2">
                                <i className="fa fa-lightbulb-o mr-2"></i>
                                Upload Tips
                            </h6>
                            <ul className="list-unstyled mb-0 small">
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>Use Excel (.xlsx) or CSV format</li>
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>Include all 8 required columns</li>
                                <li className="mb-1"><i className="fa fa-times text-danger mr-2"></i>Empty files or files with only headers will be rejected</li>
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>File must contain actual student data rows</li>
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>Course field must contain degree names</li>
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>File size should be under 5MB</li>
                                <li className="mb-0"><i className="fa fa-check text-success mr-2"></i>Admin approval required</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* File History & Student Data */}
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="modern-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0" style={{color: '#2c3e50'}}>
                                <i className="fa fa-history mr-2"></i>
                                Upload History
                            </h5>
                            <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={fetchPlacementDetails}
                                style={{borderRadius: '6px'}}
                            >
                                <i className="fa fa-refresh"></i>
                            </button>
                        </div>
                        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                            {placementData?.fileHistory && placementData.fileHistory.length > 0 ? (
                                placementData?.fileHistory?.slice().reverse().map((file, index) => (
                                    <div key={file._id || index} className="mb-3 p-3" style={{background: '#f8f9fa', borderRadius: '8px'}}>
                                        <div className="d-flex align-items-start">
                                            <div className={`timeline-dot ${
                                                file.status === 'processed' ? 'bg-success' : 
                                                file.status === 'approved' ? 'bg-info' : 
                                                file.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                                            }`} style={{
                                                width: '20px', 
                                                height: '20px', 
                                                borderRadius: '50%', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                flexShrink: 0,
                                                marginRight: '12px'
                                            }}>
                                                <i className={`fa ${
                                                    file.status === 'processed' ? 'fa-check-circle' : 
                                                    file.status === 'approved' ? 'fa-check' : 
                                                    file.status === 'rejected' ? 'fa-times' : 'fa-clock-o'
                                                } text-white`} style={{fontSize: '10px'}}></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong className="d-block" style={{fontSize: '0.9rem'}}>
                                            {file.customName || file.fileName}
                                            {file.customName && (
                                                <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>
                                                    Original: {file.fileName}
                                                </small>
                                            )}
                                            {file.university && (
                                                <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>
                                                    <i className="fa fa-university mr-1"></i>
                                                    {file.university}
                                                </small>
                                            )}
                                            {file.batch && (
                                                <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>
                                                    <i className="fa fa-users mr-1"></i>
                                                    Batch: {file.batch}
                                                </small>
                                            )}
                                        </strong>
                                                        <small className="text-muted d-block">
                                                            {new Date(file.uploadedAt).toLocaleDateString()} at {new Date(file.uploadedAt).toLocaleTimeString()}
                                                        </small>
                                                    </div>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleViewFile(file._id, file.fileName)}
                                                        style={{fontSize: '0.7rem', padding: '2px 8px'}}
                                                        title="View file data"
                                                    >
                                                        <i className="fa fa-eye"></i>
                                                    </button>
                                                </div>
                                                <div className="mt-1">
                                                    {file.status === 'processed' ? (
                                                        <span className="badge" style={{fontSize: '0.7rem', backgroundColor: '#d4edda', color: '#155724'}}>
                                                            <i className="fa fa-check-circle mr-1"></i>Processed - Login Ready
                                                        </span>
                                                    ) : file.status === 'approved' ? (
                                                        <span className="badge badge-info" style={{fontSize: '0.7rem'}}>
                                                            <i className="fa fa-check mr-1"></i>Approved
                                                        </span>
                                                    ) : file.status === 'rejected' ? (
                                                        <span className="badge badge-danger" style={{fontSize: '0.7rem'}}>
                                                            <i className="fa fa-times mr-1"></i>Rejected
                                                        </span>
                                                    ) : (
                                                        <span className="badge" style={{fontSize: '0.7rem', backgroundColor: '#fff3cd', color: '#856404'}}>
                                                            <i className="fa fa-clock-o mr-1"></i>Waiting for Admin Approval
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fa fa-history fa-2x text-muted mb-2"></i>
                                    <p className="mb-0 text-muted">No files uploaded yet</p>
                                    <small className="text-muted">Upload history will appear here</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-8 mb-4">
                    <div className="modern-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0" style={{color: '#2c3e50'}}>
                                <i className="fa fa-graduation-cap mr-2"></i>
                                Student Data
                                {studentData.length > 0 && (
                                    <span className="badge badge-primary ml-2">{studentData.length}</span>
                                )}
                            </h5>
                        </div>
                        
                        {loading && !dataLoaded ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status"></div>
                                <p className="text-muted">Loading student data...</p>
                            </div>
                        ) : studentData.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover" style={{fontSize: '0.9rem'}}>
                                    <thead style={{background: '#f8f9fa'}}>
                                        <tr>
                                            <th style={{border: 'none', fontWeight: '600'}}>Name</th>
                                            <th style={{border: 'none', fontWeight: '600'}}>Email</th>
                                            <th style={{border: 'none', fontWeight: '600'}}>Phone</th>
                                            <th style={{border: 'none', fontWeight: '600'}}>Course</th>
                                            <th style={{border: 'none', fontWeight: '600'}}>Credits</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentData.map((student, index) => (
                                            <tr key={index} style={{borderTop: '1px solid #e9ecef'}}>
                                                <td style={{border: 'none', paddingTop: '12px', paddingBottom: '12px'}}>{student.name || '-'}</td>
                                                <td style={{border: 'none', paddingTop: '12px', paddingBottom: '12px'}}>{student.email || '-'}</td>
                                                <td style={{border: 'none', paddingTop: '12px', paddingBottom: '12px'}}>{student.phone || '-'}</td>
                                                <td style={{border: 'none', paddingTop: '12px', paddingBottom: '12px'}}>
                                                    {!student.course || student.course === 'Not Specified' ? (
                                                        <span className="text-warning">
                                                            <i className="fa fa-exclamation-triangle mr-1"></i>
                                                            Not Specified
                                                        </span>
                                                    ) : (
                                                        student.course
                                                    )}
                                                </td>
                                                <td style={{border: 'none', paddingTop: '12px', paddingBottom: '12px'}}>
                                                    <span className="badge badge-info">{student.credits || 0}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <i className="fa fa-users fa-3x text-muted mb-3"></i>
                                <h6 className="text-muted">No student data available</h6>
                                <p className="text-muted mb-0">Upload a file and wait for admin approval to see students here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Student Details Modal */}
            {showStudentModal && selectedStudent && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowStudentModal(false)}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-user mr-2"></i>
                                    Student Details
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => setShowStudentModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Student ID</label>
                                        <p className="mb-0 font-weight-bold">{selectedStudent.id || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Full Name</label>
                                        <p className="mb-0 font-weight-bold">{selectedStudent.name || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">College Name</label>
                                        <p className="mb-0">{selectedStudent.collegeName || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Course</label>
                                        <p className="mb-0">{selectedStudent.course || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Email Address</label>
                                        <p className="mb-0">{selectedStudent.email || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Phone Number</label>
                                        <p className="mb-0">{selectedStudent.phone || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Credits Assigned</label>
                                        <p className="mb-0">
                                            <span className="badge badge-info">
                                                {selectedStudent.credits || placementData?.credits || 0}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Password</label>
                                        <p className="mb-0">{selectedStudent.password || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowStudentModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Name Modal */}
            {showNameModal && pendingFile && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowNameModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-edit mr-2"></i>
                                    Set File Name
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => setShowNameModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="font-weight-bold">Original File Name:</label>
                                    <p className="text-muted mb-3">{pendingFile.name}</p>
                                    
                                    <label className="font-weight-bold">Custom Display Name (Optional):</label>
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        value={customFileName}
                                        onChange={(e) => setCustomFileName(e.target.value)}
                                        placeholder="Enter a custom name for this file (e.g., 'CSE Batch 2024', 'Final Year Students')..."
                                        maxLength="100"
                                    />
                                    
                                    <label className="font-weight-bold">University:</label>
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        placeholder="Enter university name..."
                                        maxLength="100"
                                    />
                                    
                                    <label className="font-weight-bold">Batch:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={batch}
                                        onChange={(e) => setBatch(e.target.value)}
                                        placeholder="Enter batch information (e.g., '2024', 'Spring 2024')..."
                                        maxLength="50"
                                    />
                                    
                                    <small className="text-muted">
                                        Leave fields empty to use defaults. This information will be displayed to admins.
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowNameModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-light" 
                                    onClick={handleConfirmUpload}
                                    style={{border: '1px solid #dee2e6'}}
                                >
                                    <i className="fa fa-upload mr-1"></i>
                                    Upload File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', zIndex: 1050}} onClick={() => { setShowEditModal(false); document.body.style.overflow = 'auto'; }}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-edit mr-2"></i>
                                    Edit Profile
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => setShowEditModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="font-weight-bold">First Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editFormData.firstName}
                                        onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                                        placeholder="Enter your first name"
                                        maxLength="50"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="font-weight-bold">Last Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editFormData.lastName}
                                        onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                                        placeholder="Enter your last name"
                                        maxLength="50"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="font-weight-bold">Phone Number *</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                        placeholder="Enter your phone number"
                                        maxLength="15"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="font-weight-bold">College Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editFormData.collegeName}
                                        onChange={(e) => setEditFormData({...editFormData, collegeName: e.target.value})}
                                        placeholder="Enter your college name"
                                        maxLength="200"
                                    />
                                </div>
                                <small className="text-muted">
                                    * All fields are required
                                </small>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => { setShowEditModal(false); document.body.classList.remove('modal-open'); }}
                                    disabled={updating}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-light" 
                                    onClick={handleUpdateProfile}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm mr-2" role="status"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-save mr-1"></i>
                                            Update Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlacementDashboard;
