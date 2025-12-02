import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../utils/api';
import { showSuccess, showError } from '../../../../utils/popupNotification';
import './admin-emp-manage-styles.css';

function AdminAddCandidate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        collegeName: '',
        credits: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.collegeName) {
            showError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.createCandidate(formData);
            
            if (response.success) {
                showSuccess('Candidate created successfully! Welcome email sent with login credentials.');
                navigate('/admin/placement-credits');
            } else {
                showError(response.message || 'Failed to create candidate');
            }
        } catch (error) {
            showError('Error creating candidate: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Add New Candidate</h2>
                <p>Create a new candidate account and assign credits</p>
            </div>

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">Candidate Information</h4>
                </div>

                <div className="panel-body wt-panel-body p-a20">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">First Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-control"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-control"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter last name"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Email ID <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Password <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    placeholder="Enter password (min 6 characters)"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">College Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    name="collegeName"
                                    className="form-control"
                                    value={formData.collegeName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter college name"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Credits</label>
                                <input
                                    type="number"
                                    name="credits"
                                    className="form-control"
                                    value={formData.credits}
                                    onChange={handleChange}
                                    min="0"
                                    max="10000"
                                    placeholder="Enter credits (0-10000)"
                                />
                            </div>
                        </div>

                        <div className="mt-4" style={{display: 'flex', gap: '10px'}}>
                            <button
                                type="submit"
                                className="site-button"
                                disabled={loading}
                                style={{
                                    backgroundColor: '#fd7e14',
                                    color: 'white',
                                    padding: '10px 30px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                {loading ? 'Creating...' : 'Create Candidate'}
                            </button>
                            <button
                                type="button"
                                className="site-button"
                                onClick={() => navigate('/admin/placement-credits')}
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    padding: '10px 30px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminAddCandidate;
