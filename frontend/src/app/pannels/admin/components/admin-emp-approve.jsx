import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './admin-emp-manage-styles.css';

function AdminEmployersApproved() {
    const navigate = useNavigate();
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
        fetchApprovedEmployers();
    }, []);

    const fetchApprovedEmployers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllEmployers();
            if (response.success) {
                const approvedEmployers = response.data.filter(emp => 
                    emp.status === 'approved' || emp.isApproved === true
                );
                setEmployers(approvedEmployers);
            } else {
                setError(response.message || 'Failed to fetch approved employers');
            }
        } catch (error) {
            setError('Error fetching approved employers');
            
        } finally {
            setLoading(false);
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
            <div className="wt-admin-right-page-header clearfix">
                <h2>Approved Employers</h2>
            </div>

            <div className="panel panel-default site-bg-white">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0">Approved Employers ({employers.length})</h4>
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
                                        <th>Approved Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {employers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                                <i className="fa fa-check-circle" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                                No approved employers found
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
                                                <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{employer.email}</td>
                                                <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{employer.phone || 'N/A'}</td>
                                                <td style={{textAlign: 'center', fontSize: '0.85rem'}}>{formatDate(employer.updatedAt || employer.createdAt)}</td>
                                                <td style={{textAlign: 'center'}}>
                                                    <button
                                                        className="action-btn btn-view"
                                                        onClick={() => navigate(`/admin/employer-details/${employer._id}`)}
                                                    >
                                                        <i className="fa fa-eye"></i>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
        </>
    );
}

export default AdminEmployersApproved;
