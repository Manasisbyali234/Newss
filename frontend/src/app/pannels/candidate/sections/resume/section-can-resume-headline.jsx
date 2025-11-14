import { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";

function SectionCanResumeHeadline({ profile }) {
    const [headline, setHeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setHeadline(profile?.resumeHeadline || '');
    }, [profile]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('candidateToken');
            
            const response = await fetch('http://localhost:5000/api/candidate/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ resumeHeadline: headline.trim() })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                setIsEditing(false);
                alert('Resume headline updated successfully!');
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                alert('Failed to update resume headline: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Failed to update resume headline: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 d-flex justify-content-between align-items-center">
                <h4 className="panel-tittle m-a0">
                    <i className="fa fa-newspaper-o site-text-primary me-2"></i>
                    Resume Headline
                </h4>
                <button 
                    type="button"
                    className="btn btn-link site-text-primary p-0"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(!isEditing);
                    }}
                >
                    <i className={isEditing ? "fa fa-times" : "fa fa-edit"}></i>
                </button>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                {isEditing ? (
                    <div className="edit-form">
                        <div className="alert alert-info mb-3">
                            <i className="fa fa-info-circle me-2"></i>
                            Write concisely what makes you unique and right person for the job.
                        </div>
                        <textarea 
                            className="form-control mb-3" 
                            placeholder="e.g., Experienced Software Developer with 3+ years in React and Node.js" 
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            rows={3}
                            maxLength={200}
                        />
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">{headline.length}/200 characters</small>
                            <div>
                                <button 
                                    type="button"
                                    className="shared-button btn-sm me-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsEditing(false);
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSave();
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="twm-panel-inner">
                        <p>{headline || 'Add your resume headline'}</p>
                    </div>
                )}
            </div>
        </>
    )
}
export default SectionCanResumeHeadline;

