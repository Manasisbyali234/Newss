import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import './button-override.css';
import SearchBar from '../../../../components/SearchBar';
import PlacementNavigationButtons from './PlacementNavigationButtons';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
function AdminPlacementOfficersAllRequest() {
    const navigate = useNavigate();
    const [placements, setPlacements] = useState([]);
    const [filteredPlacements, setFilteredPlacements] = useState([]);
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
                setFilteredPlacements(pendingPlacements);
            } else {
                setError(response.message || 'Failed to fetch placement officers');
            }
        } catch (error) {
            setError('Error fetching placement officers: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredPlacements(placements);
            return;
        }
        
        const filtered = placements.filter(placement => 
            placement.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            placement.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            placement.phone?.includes(searchTerm)
        );
        setFilteredPlacements(filtered);
    };

    const handleApprove = async (placementId) => {
        try {
            const response = await api.updatePlacementStatus(placementId, 'approved');
            if (response.success) {
                const updatedPlacements = placements.filter(placement => placement._id !== placementId);
                setPlacements(updatedPlacements);
                setFilteredPlacements(updatedPlacements);
                showSuccess('Placement officer approved successfully!');
            } else {
                showError('Failed to approve placement officer');
            }
        } catch (error) {
            showError('Error approving placement officer');
        }
    };

    const handleReject = async (placementId) => {
        try {
            const response = await api.updatePlacementStatus(placementId, 'rejected');
            if (response.success) {
                const updatedPlacements = placements.filter(placement => placement._id !== placementId);
                setPlacements(updatedPlacements);
                setFilteredPlacements(updatedPlacements);
                showSuccess('Placement officer rejected successfully!');
            } else {
                showError('Failed to reject placement officer');
            }
        } catch (error) {
            showError('Error rejecting placement officer');
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
            
            <PlacementNavigationButtons />

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '15px', width: '100%'}}>
                        <h4 className="panel-tittle m-a0" style={{marginRight: 'auto'}}>Pending Placement Officers ({filteredPlacements.length})</h4>
                        <div style={{marginLeft: 'auto'}}>
                            <SearchBar 
                                onSearch={handleSearch}
                                placeholder="Search placement officers by name, email, or phone..."
                                className="placement-search"
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
                                    <th>College Name</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Join Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPlacements.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                            <i className="fa fa-graduation-cap" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                            No placement officers found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlacements.map((placement) => (
                                        <tr key={placement._id}>
                                            <td style={{textAlign: 'center', fontSize: '0.9rem'}}>{placement.collegeName || 'N/A'}</td>
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
                                                <div style={{display: 'flex', justifyContent: 'center', gap: '4px'}}>
                                                    <button
                                                        style={{
                                                            all: 'unset',
                                                            backgroundColor: 'rgba(255, 122, 0, 0.08)',
                                                            color: '#FF7A00',
                                                            border: '1px solid #FF7A00',
                                                            borderRadius: '6px',
                                                            width: '70px',
                                                            height: '28px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            textAlign: 'center',
                                                            lineHeight: '26px'
                                                        }}
                                                        onClick={() => handleApprove(placement._id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        style={{
                                                            all: 'unset',
                                                            backgroundColor: 'rgba(255, 122, 0, 0.08)',
                                                            color: '#FF7A00',
                                                            border: '1px solid #FF7A00',
                                                            borderRadius: '6px',
                                                            width: '70px',
                                                            height: '28px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            textAlign: 'center',
                                                            lineHeight: '26px'
                                                        }}
                                                        onClick={() => handleReject(placement._id)}
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        style={{
                                                            all: 'unset',
                                                            backgroundColor: 'rgba(255, 122, 0, 0.08)',
                                                            color: '#FF7A00',
                                                            border: '1px solid #FF7A00',
                                                            borderRadius: '6px',
                                                            width: '70px',
                                                            height: '28px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            textAlign: 'center',
                                                            lineHeight: '26px'
                                                        }}
                                                        onClick={() => navigate(`/admin/placement-details/${placement._id}`)}
                                                    >
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
