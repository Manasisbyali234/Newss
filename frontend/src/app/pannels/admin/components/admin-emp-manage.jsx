import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './admin-emp-manage-styles.css';

function AdminEmployersAllRequest() {
    const navigate = useNavigate();
    const [employers, setEmployers] = useState([]);
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
            const response = await api.getAllEmployers();
            if (response.success) {
                const pendingEmployers = response.data.filter(emp => 
                    emp.status !== 'approved' && emp.status !== 'rejected' && !emp.isApproved
                );
                setEmployers(pendingEmployers);
            } else {
                setError(response.message || 'Failed to fetch employers');
            }
        } catch (error) {
            setError('Error fetching employers');
            
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (employerId) => {
        try {
            const response = await api.updateEmployerStatus(employerId, 'approved');
            if (response.success) {
                setEmployers(employers.filter(emp => emp._id !== employerId));
                alert('Employer approved successfully! Notification sent to employer.');
            } else {
                alert('Failed to approve employer');
            }
        } catch (error) {
            alert('Error approving employer');
            
        }
    };

    const handleReject = async (employerId) => {
        try {
            const response = await api.updateEmployerStatus(employerId, 'rejected');
            if (response.success) {
                setEmployers(employers.filter(emp => emp._id !== employerId));
                alert('Employer rejected successfully! Notification sent to employer.');
            } else {
                alert('Failed to reject employer');
            }
        } catch (error) {
            alert('Error rejecting employer');
            
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
                        <h4 className="panel-tittle m-a0">Pending Employers ({employers.length})</h4>
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
                                        <th>Join Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {employers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                                <i className="fa fa-building" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                                No employers found
                                            </td>
                                        </tr>
                                    ) : (
                                        employers.map((employer) => (
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
                                                    {formatDate(employer.createdAt)}
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <span className={`status-badge ${
                                                        employer.status === 'approved' ? 'status-approved' :
                                                        employer.status === 'rejected' ? 'status-rejected' : 'status-pending'
                                                    }`}>
                                                        {employer.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <div className="action-buttons">
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
