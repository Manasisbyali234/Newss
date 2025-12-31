import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
function AdminEmployersAllRequest() {
    const navigate = useNavigate();
    const [employers, setEmployers] = useState([]);
    const [filteredEmployers, setFilteredEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
        fetchEmployers();
    }, []);

    const fetchEmployers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllEmployers({ approvalStatus: 'pending' });
            if (response.success) {
                // Double filter to ensure only pending employers show
                const pendingEmployers = response.data.filter(emp => 
                    emp.isApproved !== true && 
                    emp.status !== 'approved' && 
                    emp.status !== 'rejected' &&
                    emp.status !== 'inactive'
                );
                
                const employersWithProfiles = await Promise.all(
                    pendingEmployers.map(async (emp) => {
                        try {
                            const profileRes = await api.getEmployerProfile(emp._id);
                            if (profileRes.success && profileRes.profile) {
                                return { ...emp, companyName: profileRes.profile.companyName || emp.companyName };
                            }
                        } catch (err) {}
                        return emp;
                    })
                );
                
                setEmployers(employersWithProfiles);
                setFilteredEmployers(employersWithProfiles);
            } else {
                setError(response.message || 'Failed to fetch employers');
            }
        } catch (error) {
            setError('Error fetching employers');
            
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredEmployers(employers);
            return;
        }
        
        const filtered = employers.filter(employer => 
            employer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employer.phone?.includes(searchTerm) ||
            employer.employerType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEmployers(filtered);
    };

    const handleApprove = async (employerId) => {
        if (actionLoading[employerId]) return;
        
        try {
            setActionLoading(prev => ({ ...prev, [employerId]: true }));
            console.log('Approving employer:', employerId);
            
            const response = await api.updateEmployerStatus(employerId, { status: 'approved', isApproved: true });
            console.log('Approval response:', response);
            console.log('Employer after approval:', response.employer);
            
            if (response.success) {
                console.log('Employer status after approval:', {
                    isApproved: response.employer.isApproved,
                    status: response.employer.status
                });
                
                // Force immediate removal from UI
                const updatedEmployers = employers.filter(emp => emp._id !== employerId);
                console.log('Employers before filter:', employers.length);
                console.log('Employers after filter:', updatedEmployers.length);
                
                setEmployers(updatedEmployers);
                setFilteredEmployers(updatedEmployers);
                
                // Also refresh the data to ensure consistency
                setTimeout(() => {
                    fetchEmployers();
                }, 1000);
                
                // Dispatch event to notify other components
                window.dispatchEvent(new CustomEvent('employerApproved', { detail: { employerId } }));
                
                showSuccess('Employer approved successfully! Notification sent to employer.');
            } else {
                console.error('Approval failed:', response.message);
                showError(response.message || 'Failed to approve employer');
            }
        } catch (error) {
            console.error('Approval error:', error);
            showError('Error approving employer');
        } finally {
            setActionLoading(prev => ({ ...prev, [employerId]: false }));
        }
    };

    const handleReject = async (employerId) => {
        if (actionLoading[employerId]) return;
        
        try {
            setActionLoading(prev => ({ ...prev, [employerId]: true }));
            const response = await api.updateEmployerStatus(employerId, 'rejected');
            if (response.success) {
                const updatedEmployers = employers.filter(emp => emp._id !== employerId);
                setEmployers(updatedEmployers);
                setFilteredEmployers(updatedEmployers);
                showSuccess('Employer rejected successfully! Notification sent to employer.');
            } else {
                showError('Failed to reject employer');
            }
        } catch (error) {
            showError('Error rejecting employer');
        } finally {
            setActionLoading(prev => ({ ...prev, [employerId]: false }));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="wt-admin-right-page-header clearfix">
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <>
            <div>
                <div className="wt-admin-right-page-header clearfix">
                    <h2>Employers Details</h2>
                </div>

                <div className="panel panel-default site-bg-white">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '15px', width: '100%'}}>
                            <h4 className="panel-tittle m-a0" style={{marginRight: 'auto'}}>Pending Employers ({filteredEmployers.length})</h4>
                            <div className="search-section" style={{marginLeft: 'auto'}}>
                                <label className="search-label">
                                    <i className="fa fa-filter"></i> Search by Name or Email
                                </label>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search employers by name, email, phone, or type..."
                                    className="employer-search"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="panel-body wt-panel-body">
                        {error && (
                            <div className="alert alert-danger m-b20">{error}</div>
                        )}
                        <div className="p-a20 table-responsive table-container">
                            <table className="table emp-table">
                                <thead>
                                    <tr>
                                        <th>Company Name</th>
                                        <th>Type</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Profile Submitted</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEmployers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                                <i className="fa fa-building" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                                No employers found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployers.map((employer) => (
                                            <tr key={employer._id}>
                                                <td style={{textAlign: 'center'}}>
                                                    <span className="company-name">
                                                        {employer.companyName || employer.email}
                                                    </span>
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <span style={{
                                                        background: 'transparent',
                                                        color: '#000000',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        {employer.employerType === 'consultant' ? 'Consultant' : 'Company'}
                                                    </span>
                                                </td>
                                                <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>
                                                    {employer.email}
                                                </td>
                                                <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>
                                                    {employer.phone || 'N/A'}
                                                </td>
                                                <td style={{textAlign: 'center', fontSize: '0.85rem'}}>
                                                    {employer.profileSubmittedAt ? formatDate(employer.profileSubmittedAt) : 'Not submitted'}
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <span className={`status-badge ${
                                                        employer.isApproved ? 'status-approved' :
                                                        employer.profileSubmittedForReview ? 'status-pending' : 'status-incomplete'
                                                    }`}>
                                                        {employer.isApproved ? 'Approved' : 
                                                         employer.profileSubmittedForReview ? 'Under Review' : 'Profile Incomplete'}
                                                    </span>
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <div className="action-buttons">
                                                        {employer.isProfileComplete && employer.profileSubmittedForReview ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="action-btn btn-approve"
                                                                    onClick={() => handleApprove(employer._id)}
                                                                    disabled={actionLoading[employer._id]}
                                                                >
                                                                    <i className="fa fa-check"></i>
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="action-btn btn-reject"
                                                                    onClick={() => handleReject(employer._id)}
                                                                    disabled={actionLoading[employer._id]}
                                                                >
                                                                    <i className="fa fa-times"></i>
                                                                    Reject
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span style={{color: '#dc3545', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                                                                <i className="fa fa-exclamation-circle"></i>
                                                                Profile not completed
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="action-btn btn-view"
                                                            onClick={() => navigate(`/admin/employer-details/${employer._id}`)}
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminEmployersAllRequest;
