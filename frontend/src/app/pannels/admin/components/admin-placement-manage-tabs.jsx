import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import SearchBar from '../../../../components/SearchBar';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
function AdminPlacementOfficersTabs() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [placements, setPlacements] = useState([]);
    const [filteredPlacements, setFilteredPlacements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlacements();
    }, [activeTab]);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            const response = await api.getAllPlacements();
            if (response.success) {
                const allPlacements = response.data || [];
                let filtered = [];
                
                if (activeTab === 'pending') {
                    filtered = allPlacements.filter(p => p.status === 'pending' || (!p.status && !p.isApproved));
                } else if (activeTab === 'approved') {
                    filtered = allPlacements.filter(p => p.status === 'active' || p.isApproved);
                } else if (activeTab === 'uploads') {
                    filtered = allPlacements.filter(p => p.fileHistory && p.fileHistory.length > 0);
                }
                
                setPlacements(filtered);
                setFilteredPlacements(filtered);
            }
        } catch (error) {
            showError('Error fetching placement officers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredPlacements(placements);
            return;
        }
        const filtered = placements.filter(p => 
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone?.includes(searchTerm)
        );
        setFilteredPlacements(filtered);
    };

    const handleApprove = async (placementId) => {
        try {
            const response = await api.updatePlacementStatus(placementId, 'approved');
            if (response.success) {
                fetchPlacements();
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
                fetchPlacements();
                showSuccess('Placement officer rejected successfully!');
            } else {
                showError('Failed to reject placement officer');
            }
        } catch (error) {
            showError('Error rejecting placement officer');
        }
    };

    if (loading) {
        return <div className="dashboard-content"><div className="text-center">Loading...</div></div>;
    }

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Placement Officers Management</h2>
                <p>Manage placement officer applications and uploads</p>
            </div>

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">



                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '15px', width: '100%'}}>
                        <h4 className="panel-tittle m-a0" style={{marginRight: 'auto'}}>Placement Officers ({filteredPlacements.length})</h4>
                        <div className="search-section" style={{marginLeft: 'auto'}}>
                            <label className="search-label">
                                <i className="fa fa-filter"></i> Search by Name or Email
                            </label>
                            <SearchBar 
                                onSearch={handleSearch}
                                placeholder="Search placement officers..."
                                className="placement-search"
                            />
                        </div>
                    </div>
                </div>

                <div className="panel-body wt-panel-body">
                    <div className="p-a20 table-responsive">
                        <table className="table emp-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlacements.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center" style={{padding: '40px'}}>No records found</td></tr>
                                ) : (
                                    filteredPlacements.map((placement) => (
                                        <tr key={placement._id}>
                                            <td style={{textAlign: 'center'}}>{placement.name}</td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace'}}>{placement.email}</td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace'}}>{placement.phone || 'N/A'}</td>
                                            <td style={{textAlign: 'center'}}>{new Date(placement.createdAt).toLocaleDateString()}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className={`status-badge status-${placement.status || 'pending'}`}>{placement.status || 'Pending'}</span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <div className="action-buttons">
                                                    {activeTab === 'pending' && (
                                                        <>
                                                            <button className="action-btn btn-approve" onClick={() => handleApprove(placement._id)}>
                                                                <i className="fa fa-check"></i> Approve
                                                            </button>
                                                            <button className="action-btn btn-reject" onClick={() => handleReject(placement._id)}>
                                                                <i className="fa fa-times"></i> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="action-btn btn-view" onClick={() => navigate(`/admin/placement-details/${placement._id}`)}>
                                                        <i className="fa fa-eye"></i> View
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

export default AdminPlacementOfficersTabs;