import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import './admin-emp-manage-styles.css';

function AdminPlacementOfficersAllRequest() {
    const navigate = useNavigate();
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlacements();
    }, []);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            const response = await api.getAllPlacements();
            if (response.success) {
                const allPlacements = response.data || [];
                const pendingPlacements = allPlacements.filter(placement => 
                    placement.status === 'pending' || (!placement.status && !placement.isApproved)
                );
                setPlacements(pendingPlacements);
            } else {
                setError(response.message || 'Failed to fetch placement officers');
            }
        } catch (error) {
            setError('Error fetching placement officers: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (placementId) => {
        try {
            const response = await api.updatePlacementStatus(placementId, 'approved');
            if (response.success) {
                setPlacements(placements.filter(placement => placement._id !== placementId));
                alert('Placement officer approved successfully!');
            } else {
                alert('Failed to approve placement officer');
            }
        } catch (error) {
            alert('Error approving placement officer');
        }
    };

    const handleReject = async (placementId) => {
        try {
            const response = await api.updatePlacementStatus(placementId, 'rejected');
            if (response.success) {
                setPlacements(placements.filter(placement => placement._id !== placementId));
                alert('Placement officer rejected successfully!');
            } else {
                alert('Failed to reject placement officer');
            }
        } catch (error) {
            alert('Error rejecting placement officer');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Placement Officers Management</h2>
                <p>Manage and review placement officer applications</p>
            </div>

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">Pending Placement Officers ({placements.length})</h4>
                </div>

                <div className="panel-body wt-panel-body">
                    {error && (
                        <div className="alert alert-danger m-b20">{error}</div>
                    )}
                    <div className="p-a20 table-responsive table-container">
                        <table className="table emp-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Join Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {placements.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                            <i className="fa fa-graduation-cap" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                            No placement officers found
                                        </td>
                                    </tr>
                                ) : (
                                    placements.map((placement) => (
                                        <tr key={placement._id}>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="company-name">
                                                    {placement.name}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{placement.email}</td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{placement.phone || 'N/A'}</td>
                                            <td style={{textAlign: 'center', fontSize: '0.85rem'}}>{formatDate(placement.createdAt)}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="status-badge status-pending">
                                                    {placement.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn btn-approve"
                                                        onClick={() => handleApprove(placement._id)}
                                                    >
                                                        <i className="fa fa-check"></i>
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="action-btn btn-reject"
                                                        onClick={() => handleReject(placement._id)}
                                                    >
                                                        <i className="fa fa-times"></i>
                                                        Reject
                                                    </button>
                                                    <button
                                                        className="action-btn btn-view"
                                                        onClick={() => navigate(`/admin/placement-details/${placement._id}`)}
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
    );
}

export default AdminPlacementOfficersAllRequest;
