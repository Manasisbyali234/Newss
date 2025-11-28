import { useState, useEffect } from 'react';
import { api } from '../../../../utils/api';
import showToast from '../../../../utils/toastNotification';

function AdminIndividualCredit() {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [credits, setCredits] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response = await api.getCandidatesForCredits();
            if (response.success) {
                setCandidates(response.candidates || []);
            }
        } catch (error) {
            showToast('Error fetching candidates', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCandidate || !credits) {
            showToast('Please select a candidate and enter credits', 'warning');
            return;
        }

        setLoading(true);
        try {
            const response = await api.updateCandidateCredits(selectedCandidate, { creditsToAdd: parseInt(credits) });
            if (response.success) {
                showToast('Credits updated successfully!', 'success');
                setSelectedCandidate('');
                setCredits('');
                fetchCandidates();
            } else {
                showToast('Failed to update credits', 'error');
            }
        } catch (error) {
            showToast('Error updating credits', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredCandidates = candidates.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Individual Candidate Credit Upload</h2>
                <p>Manually assign credits to individual candidates</p>
            </div>

            <div className="panel panel-default site-bg-white">
                <div className="panel-body wt-panel-body p-a20">
                    <form onSubmit={handleSubmit} style={{maxWidth: '600px', margin: '0 auto'}}>
                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Search Candidate</label>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{marginBottom: '10px'}}
                            />
                            <select 
                                className="form-control"
                                value={selectedCandidate}
                                onChange={(e) => setSelectedCandidate(e.target.value)}
                                required
                                style={{padding: '10px'}}
                            >
                                <option value="">Select Candidate</option>
                                {filteredCandidates.map(candidate => (
                                    <option key={candidate._id} value={candidate._id}>
                                        {candidate.name} - {candidate.email} (Current: {candidate.credits || 0} credits)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Credits to Add</label>
                            <input 
                                type="number"
                                className="form-control"
                                placeholder="Enter credits (positive or negative)"
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                required
                                style={{padding: '10px'}}
                            />
                            <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                                Enter positive number to add credits, negative to deduct
                            </small>
                        </div>

                        <button 
                            type="submit" 
                            className="site-button"
                            disabled={loading}
                            style={{width: '100%', padding: '12px', fontSize: '16px'}}
                        >
                            {loading ? 'Updating...' : 'Update Credits'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminIndividualCredit;
