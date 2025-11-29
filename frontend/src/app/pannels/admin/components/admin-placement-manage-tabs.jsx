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
                    <div className="placement-tabs" style={{display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0'}}>
                        <button 
                            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                            style={{padding: '10px 20px', border: 'none', background: activeTab === 'pending' ? '#fd7e14' : 'transparent', color: activeTab === 'pending' ? 'white' : '#666', cursor: 'pointer', borderRadius: '4px 4px 0 0', fontWeight: '600'}}
                        >
                            Pending Approvals
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('approved')}
                            style={{padding: '10px 20px', border: 'none', background: activeTab === 'approved' ? '#fd7e14' : 'transparent', color: activeTab === 'approved' ? 'white' : '#666', cursor: 'pointer', borderRadius: '4px 4px 0 0', fontWeight: '600'}}
                        >
                            Approved Officers
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
                            onClick={() => setActiveTab('uploads')}
                            style={{padding: '10px 20px', border: 'none', background: activeTab === 'uploads' ? '#fd7e14' : 'transparent', color: activeTab === 'uploads' ? 'white' : '#666', cursor: 'pointer', borderRadius: '4px 4px 0 0', fontWeight: '600'}}
                        >
                            Excel Uploads
                        </button>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h4 className="panel-tittle m-a0">{activeTab === 'pending' ? 'Pending' : activeTab === 'approved' ? 'Approved' : 'Excel Uploads'} ({filteredPlacements.length})</h4>
                        <SearchBar onSearch={handleSearch} placeholder="Search..." />
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
