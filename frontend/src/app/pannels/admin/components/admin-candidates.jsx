import { useState, useEffect } from "react";
import JobZImage from "../../../common/jobz-img";
import { loadScript } from "../../../../globals/constants";

function AdminCandidates() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadScript("js/custom.js");
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/users?type=candidates', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCandidates(data.users);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (candidateId) => {
        if (!window.confirm('Are you sure you want to delete this candidate?')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/users/${candidateId}/candidate`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                alert('Candidate deleted successfully!');
                fetchCandidates();
            } else {
                alert('Failed to delete candidate');
            }
        } catch (error) {
            
            alert('Failed to delete candidate');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Candidates</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dashboard</a><span>Candidates</span></div>
            </div>
            <div className="twm-pro-view-chart-wrap">
                <div className="col-lg-12 col-md-12 mb-4">
                    <div className="panel panel-default site-bg-white m-t30">
                        <div className="panel-heading wt-panel-heading p-a20">
                            <h4 className="panel-tittle m-a0"><i className="far fa-list-alt" />All Candidates ({candidates.length})</h4>
                        </div>
                        <div className="panel-body wt-panel-body">
                            <div className="twm-D_table p-a20 table-responsive">
                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <table id="candidate_data_table" className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Joined Date</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center">No candidates found</td>
                                                </tr>
                                            ) : (
                                                candidates.map((candidate) => (
                                                    <tr key={candidate._id}>
                                                        <td>
                                                            <div className="twm-DT-candidates-list">
                                                                <div className="twm-media">
                                                                    <div className="twm-media-pic">
                                                                        <JobZImage src="images/candidates/pic1.jpg" alt="#" />
                                                                    </div>
                                                                </div>
                                                                <div className="twm-mid-content">
                                                                    <a href="#" className="twm-job-title">
                                                                        <h4>{candidate.name}</h4>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{candidate.email}</td>
                                                        <td>{candidate.phone || 'N/A'}</td>
                                                        <td>{formatDate(candidate.createdAt)}</td>
                                                        <td>
                                                            <div className="twm-jobs-category">
                                                                <span className={`twm-bg-${candidate.status === 'active' ? 'green' : 'red'}`}>
                                                                    {candidate.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="twm-table-controls">
                                                                <ul className="twm-DT-controls-icon list-unstyled">
                                                                    <li>
                                                                        <button 
                                                                            title="View profile" 
                                                                            data-bs-toggle="tooltip" 
                                                                            data-bs-placement="top"
                                                                            onClick={() => window.open(`/candidate/profile/${candidate._id}`, '_blank')}
                                                                        >
                                                                            <span className="fa fa-eye" />
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button 
                                                                            title="Delete" 
                                                                            data-bs-toggle="tooltip" 
                                                                            data-bs-placement="top"
                                                                            onClick={() => handleDelete(candidate._id)}
                                                                        >
                                                                            <span className="far fa-trash-alt" />
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default AdminCandidates;
