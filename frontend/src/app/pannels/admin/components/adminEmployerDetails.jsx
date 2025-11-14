import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import './employer-details-styles.css';

function EmployerDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
    const [jobCount, setJobCount] = useState(0);
    const [jobsLoading, setJobsLoading] = useState(false);

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
        fetchEmployerProfile();
        fetchEmployerJobs();
    }, [id]);

    const fetchEmployerProfile = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/employer-profile/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                
                
                // Set default verification status for existing profiles
                const profileWithDefaults = {
                    ...data.profile,
                    panCardVerified: data.profile.panCardVerified || 'pending',
                    cinVerified: data.profile.cinVerified || 'pending',
                    gstVerified: data.profile.gstVerified || 'pending',
                    incorporationVerified: data.profile.incorporationVerified || 'pending',
                    authorizationVerified: data.profile.authorizationVerified || 'pending'
                };
                
                setProfile(profileWithDefaults);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
    };

    const downloadDocument = async (employerId, documentType) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/download-document/${employerId}/${documentType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${documentType}_${employerId}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download document');
            }
        } catch (error) {
            
            alert('Error downloading document');
        }
    };

    const fetchEmployerJobs = async () => {
        try {
            setJobsLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/employer-jobs/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setJobCount(data.jobCount);
            }
        } catch (error) {
            
        } finally {
            setJobsLoading(false);
        }
    };

    const updateDocumentStatus = async (employerId, field, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/employer-profile/${employerId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ [field]: status })
            });
            
            if (response.ok) {
                setProfile(prev => ({ ...prev, [field]: status }));
                alert(`Document ${status} successfully`);
            } else {
                alert('Failed to update document status');
            }
        } catch (error) {
            
            alert('Error updating document status');
        }
    };

    const handleApproveAuthorizationLetter = async (letterId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/employers/${id}/authorization-letters/${letterId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Update the local state
                setProfile(prev => ({
                    ...prev,
                    authorizationLetters: prev.authorizationLetters.map(letter => 
                        letter._id === letterId 
                            ? { ...letter, status: 'approved', approvedAt: new Date() }
                            : letter
                    )
                }));
                alert('Authorization letter approved successfully! Notification sent to employer.');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to approve authorization letter');
            }
        } catch (error) {
            
            alert('Error approving authorization letter');
        }
    };

    const handleRejectAuthorizationLetter = async (letterId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/employers/${id}/authorization-letters/${letterId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Update the local state
                setProfile(prev => ({
                    ...prev,
                    authorizationLetters: prev.authorizationLetters.map(letter => 
                        letter._id === letterId 
                            ? { ...letter, status: 'rejected', rejectedAt: new Date() }
                            : letter
                    )
                }));
                alert('Authorization letter rejected successfully! Notification sent to employer.');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to reject authorization letter');
            }
        } catch (error) {
            
            alert('Error rejecting authorization letter');
        }
    };

    if (loading) {
        return (
            <div className="employer-details-container">
                <div className="loading-container" data-aos="fade-up">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Loading employer details...</div>
                </div>
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="employer-details-container">
                <div className="not-found-container" data-aos="fade-up">
                    <i className="fa fa-exclamation-triangle not-found-icon"></i>
                    <h3>Employer Profile Not Found</h3>
                    <p>The requested employer profile could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="employer-details-container">
            <div className="employer-details-header" data-aos="fade-down">
                <h2 style={{ color: 'white !important' }}>
                    <i className="fa fa-building me-3"></i>
                    Employer Profile Details
                </h2>
                <p className="employer-details-subtitle mb-0">
                    <i className="fa fa-info-circle me-2"></i>
                    Complete employer information and document verification
                </p>
            </div>
            
            <button className="btn btn-outline-primary" onClick={() => navigate(-1)} data-aos="fade-right" style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35', marginBottom: '20px' }}>
                <i className="fa fa-arrow-left"></i>
                Back to Management
            </button>
            
            <div className="profile-info-card" data-aos="fade-up" data-aos-delay="100">
                <h4 className="profile-section-title">
                    <i className="fa fa-user-tie"></i>
                    Company Information
                </h4>
                
                <div className="row">
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="200">
                            <h6><i className="fa fa-building"></i>Company Name</h6>
                            <p>{profile.companyName || profile.employerId?.companyName || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="250">
                            <h6><i className="fa fa-user"></i>Contact Full Name</h6>
                            <p>{profile.contactFullName || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="300">
                            <h6><i className="fa fa-envelope"></i>Email</h6>
                            <p>{profile.email || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="350">
                            <h6><i className="fa fa-phone"></i>Phone</h6>
                            <p>{profile.phone || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="400">
                            <h6><i className="fa fa-envelope-open"></i>Official Email</h6>
                            <p>{profile.officialEmail || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="450">
                            <h6><i className="fa fa-mobile-alt"></i>Official Mobile</h6>
                            <p>{profile.officialMobile || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="500">
                            <h6><i className="fa fa-phone-alt"></i>Alternate Contact</h6>
                            <p>{profile.alternateContact || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="550">
                            <h6><i className="fa fa-id-badge"></i>Contact Designation</h6>
                            <p>{profile.contactDesignation || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="600">
                            <h6><i className="fa fa-mobile"></i>Contact Mobile</h6>
                            <p>{profile.contactMobile || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="650">
                            <h6><i className="fa fa-globe"></i>Website</h6>
                            <p>{profile.website || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="700">
                            <h6><i className="fa fa-calendar"></i>Established Since</h6>
                            <p>{profile.establishedSince || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="750">
                            <h6><i className="fa fa-users"></i>Team Size</h6>
                            <p>{profile.teamSize || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="200">
                            <h6><i className="fa fa-tag"></i>Employer Category</h6>
                            <p>{profile.employerCategory || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="250">
                            <h6><i className="fa fa-industry"></i>Company Type</h6>
                            <p>{profile.companyType || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="300">
                            <h6><i className="fa fa-cogs"></i>Industry Sector</h6>
                            <p style={{textTransform: 'uppercase'}}>{profile.industrySector || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="350">
                            <h6><i className="fa fa-map-marker-alt"></i>Corporate Address</h6>
                            <p>{profile.corporateAddress || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="375">
                            <h6><i className="fa fa-map-pin"></i>Pincode</h6>
                            <p>{profile.pincode || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="400">
                            <h6><i className="fa fa-map-marked"></i>Branch Locations</h6>
                            <p>{profile.branchLocations || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="450">
                            <h6><i className="fa fa-certificate"></i>CIN</h6>
                            <p>{profile.cin || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="550">
                            <h6><i className="fa fa-receipt"></i>GST Number</h6>
                            <p>{profile.gstNumber || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="600">
                            <h6><i className="fa fa-id-card"></i>PAN Number</h6>
                            <p>{profile.panNumber || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="650">
                            <h6><i className="fa fa-image"></i>Logo</h6>
                            {profile.logo ? (
                                <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => {
                                        const imageUrl = profile.logo.startsWith('data:') ? profile.logo : `data:image/jpeg;base64,${profile.logo}`;
                                        setCurrentImage(imageUrl);
                                        setShowImageModal(true);
                                    }}
                                    style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35' }}
                                >
                                    <i className="fa fa-eye"></i>
                                    View Image
                                </button>
                            ) : (
                                <p>N/A</p>
                            )}
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="700">
                            <h6><i className="fa fa-images"></i>Cover Image</h6>
                            {profile.coverImage ? (
                                <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => {
                                        const imageUrl = profile.coverImage.startsWith('data:') ? profile.coverImage : `data:image/jpeg;base64,${profile.coverImage}`;
                                        setCurrentImage(imageUrl);
                                        setShowImageModal(true);
                                    }}
                                    style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35' }}
                                >
                                    <i className="fa fa-eye"></i>
                                    View Image
                                </button>
                            ) : (
                                <p>N/A</p>
                            )}
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="750">
                            <h6><i className="fa fa-clock"></i>Created At</h6>
                            <p>{formatDate(profile.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="description-section" data-aos="fade-up" data-aos-delay="800">
                    <h6><i className="fa fa-align-left"></i>Company Description</h6>
                    <p className="description-text">{profile.description || 'No description provided'}</p>
                </div>


            </div>

            <div className="documents-section" data-aos="fade-up" data-aos-delay="300">
                <h4 className="profile-section-title">
                    <i className="fa fa-file-alt"></i>
                    Document Verification
                </h4>
                <div className="table-responsive">
                    <table className="table documents-table">
                        <thead>
                            <tr>
                                <th><i className="fa fa-file me-2"></i>Document Type</th>
                                <th><i className="fa fa-upload me-2"></i>Upload Status</th>
                                <th style={{textAlign: 'center'}}><i className="fa fa-eye me-2"></i>View Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr data-aos="fade-left" data-aos-delay="400">
                                <td><i className="fa fa-id-card me-2 text-muted"></i>PAN Card Image</td>
                                <td>
                                    {profile.panCardImage ? 
                                        <span className="status-badge badge-uploaded"><i className="fa fa-check"></i>Uploaded</span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                            if (profile.panCardImage) {
                                                const imageUrl = profile.panCardImage.startsWith('data:') ? profile.panCardImage : `data:image/jpeg;base64,${profile.panCardImage}`;
                                                setCurrentImage(imageUrl);
                                                setShowImageModal(true);
                                            }
                                        }}
                                        disabled={!profile.panCardImage}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr data-aos="fade-left" data-aos-delay="450">
                                <td><i className="fa fa-certificate me-2 text-muted"></i>CIN Document</td>
                                <td>
                                    {profile.cinImage ? 
                                        <span className="status-badge badge-uploaded"><i className="fa fa-check"></i>Uploaded</span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                            if (profile.cinImage) {
                                                const imageUrl = profile.cinImage.startsWith('data:') ? profile.cinImage : `data:image/jpeg;base64,${profile.cinImage}`;
                                                setCurrentImage(imageUrl);
                                                setShowImageModal(true);
                                            }
                                        }}
                                        disabled={!profile.cinImage}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr data-aos="fade-left" data-aos-delay="500">
                                <td><i className="fa fa-receipt me-2 text-muted"></i>GST Certificate</td>
                                <td>
                                    {profile.gstImage ? 
                                        <span className="status-badge badge-uploaded"><i className="fa fa-check"></i>Uploaded</span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                            if (profile.gstImage) {
                                                const imageUrl = profile.gstImage.startsWith('data:') ? profile.gstImage : `data:image/jpeg;base64,${profile.gstImage}`;
                                                setCurrentImage(imageUrl);
                                                setShowImageModal(true);
                                            }
                                        }}
                                        disabled={!profile.gstImage}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr data-aos="fade-left" data-aos-delay="550">
                                <td><i className="fa fa-file-contract me-2 text-muted"></i>Certificate of Incorporation</td>
                                <td>
                                    {profile.certificateOfIncorporation ? 
                                        <span className="status-badge badge-uploaded"><i className="fa fa-check"></i>Uploaded</span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                            if (profile.certificateOfIncorporation) {
                                                const imageUrl = profile.certificateOfIncorporation.startsWith('data:') ? profile.certificateOfIncorporation : `data:image/jpeg;base64,${profile.certificateOfIncorporation}`;
                                                setCurrentImage(imageUrl);
                                                setShowImageModal(true);
                                            }
                                        }}
                                        disabled={!profile.certificateOfIncorporation}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>

            {/* Posted Jobs Section */}
            <div className="documents-section" data-aos="fade-up" data-aos-delay="350">
                <h4 className="profile-section-title">
                    <i className="fa fa-briefcase"></i>
                    Posted Jobs
                </h4>
                <div className="job-count-container">
                    <div className="job-count-card">
                        <div className="job-count-info">
                            <div className="job-count-number">
                                {jobsLoading ? (
                                    <div className="loading-spinner-small"></div>
                                ) : (
                                    <span className="count-value">{jobCount}</span>
                                )}
                            </div>
                            <div className="job-count-label">
                                <i className="fa fa-briefcase me-2"></i>
                                Total Jobs Posted
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Gallery Section */}
            {profile.gallery && profile.gallery.length > 0 && (
                <div className="documents-section" data-aos="fade-up" data-aos-delay="400">
                    <h4 className="profile-section-title">
                        <i className="fa fa-images"></i>
                        Company Gallery
                    </h4>
                    <div className="gallery-preview mt-3">
                        <div className="d-flex flex-wrap gap-3">
                            {profile.gallery.map((image, index) => (
                                <div key={image._id || index} className="gallery-item position-relative" style={{width: '150px', height: '150px'}}>
                                    <img 
                                        src={image.url} 
                                        alt={`Gallery ${index + 1}`}
                                        className="img-fluid rounded cursor-pointer"
                                        style={{width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #ddd'}}
                                        onClick={() => {
                                            setCurrentImage(image.url);
                                            setShowImageModal(true);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Multiple Authorization Letters Section */}
            {profile.authorizationLetters && profile.authorizationLetters.length > 0 && (
                <div className="documents-section" data-aos="fade-up" data-aos-delay="450">
                    <h4 className="profile-section-title">
                        <i className="fa fa-file-signature"></i>
                        Authorization Letters
                    </h4>
                    <div className="table-responsive">
                        <table className="table documents-table">
                            <thead>
                                <tr>
                                    <th><i className="fa fa-building me-2"></i>Authorization Company Name</th>
                                    <th><i className="fa fa-file me-2"></i>File Name</th>
                                    <th><i className="fa fa-calendar me-2"></i>Upload Date</th>
                                    <th><i className="fa fa-check-circle me-2"></i>Status</th>
                                    <th><i className="fa fa-cogs me-2"></i>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profile.authorizationLetters.map((doc, index) => (
                                    <tr key={doc._id || index} data-aos="fade-left" data-aos-delay={500 + (index * 50)}>
                                        <td>
                                            <i className="fa fa-building me-2 text-muted"></i>
                                            {(() => {
                                                
                                                
                                                
                                                return doc.companyName || profile.companyName || profile.employerId?.companyName || 'N/A';
                                            })()}
                                        </td>
                                        <td><i className="fa fa-file-alt me-2 text-muted"></i>{doc.fileName}</td>
                                        <td><i className="fa fa-clock me-2 text-muted"></i>{formatDate(doc.uploadedAt)}</td>
                                        <td>
                                            <span className={`status-badge ${
                                                doc.status === 'approved' ? 'badge-approved' : 
                                                doc.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                                            }`}>
                                                <i className={`fa ${
                                                    doc.status === 'approved' ? 'fa-check' :
                                                    doc.status === 'rejected' ? 'fa-times' : 'fa-clock'
                                                }`}></i>
                                                {doc.status === 'approved' ? 'Approved' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons-container">
                                                <button 
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => {
                                                        if (doc.fileData.startsWith('data:image')) {
                                                            setCurrentImage(doc.fileData);
                                                            setShowImageModal(true);
                                                        } else {
                                                            const link = document.createElement('a');
                                                            link.href = doc.fileData;
                                                            link.download = doc.fileName;
                                                            link.click();
                                                        }
                                                    }}
                                                    style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35', marginRight: '5px' }}
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </button>
                                                {doc.status !== 'approved' && (
                                                    <button 
                                                        className="btn btn-outline-success btn-sm"
                                                        onClick={() => handleApproveAuthorizationLetter(doc._id)}
                                                        style={{ marginRight: '5px' }}
                                                    >
                                                        <i className="fa fa-check"></i>
                                                    </button>
                                                )}
                                                {doc.status !== 'approved' && doc.status !== 'rejected' && (
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleRejectAuthorizationLetter(doc._id)}
                                                    >
                                                        <i className="fa fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Image Modal */}
            {showImageModal && (
                <div className="image-modal" onClick={() => setShowImageModal(false)}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="image-modal-header">
                            <h5 className="image-modal-title">
                                <i className="fa fa-image me-2"></i>
                                Image Preview
                            </h5>
                            <button className="modal-close-btn" onClick={() => setShowImageModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="text-center">
                            <img src={currentImage} alt="Preview" className="modal-image" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployerDetails;
