import { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";
import showToast from "../../../../../utils/toastNotification";

function SectionCanProfileSummary({ profile }) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setSummary(profile?.profileSummary || '');
    }, [profile]);

    const handleSave = async () => {
        // Frontend validation
        const trimmedSummary = summary.trim();
        if (!trimmedSummary) {
            showToast('Profile summary cannot be empty. Please provide a brief description of your professional background.', 'warning', 4000);
            return;
        }

        if (trimmedSummary.length < 50) {
            showToast('Profile summary should be at least 50 characters long to provide meaningful information to employers.', 'warning', 4000);
            return;
        }

        if (trimmedSummary.length > 1000) {
            showToast('Profile summary cannot exceed 1000 characters.', 'error', 4000);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('candidateToken');

            const response = await fetch('http://localhost:5000/api/candidate/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileSummary: trimmedSummary })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsEditing(false);
                showToast('Profile summary updated successfully!', 'success', 4000);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                // Handle different types of errors
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    showToast('Validation errors: ' + errorMessages, 'error', 6000);
                } else if (data.message) {
                    showToast('Failed to update profile summary: ' + data.message, 'error', 4000);
                } else if (response.status === 400) {
                    showToast('Invalid data provided. Please check your input and try again.', 'error', 4000);
                } else if (response.status === 401) {
                    showToast('Your session has expired. Please log in again.', 'error', 4000);
                } else if (response.status === 500) {
                    showToast('Server error occurred. Please try again later.', 'error', 4000);
                } else {
                    showToast('Failed to update profile summary. Please try again.', 'error', 4000);
                }
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showToast('Network error: Unable to connect to server. Please check your internet connection.', 'error', 4000);
            } else {
                showToast('Failed to update profile summary: ' + error.message, 'error', 4000);
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 d-flex justify-content-between align-items-center">
                <h4 className="panel-tittle m-a0">
                    Profile Summary
                </h4>
                <button 
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(!isEditing);
                    }}
                >
                    {isEditing ? "Cancel" : "Edit"}
                </button>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                {isEditing ? (
                    <div className="edit-form">
                        <div className="alert alert-info mb-3">
                            <i className="fa fa-info-circle me-2"></i>
                            Mention highlights of your career, education, and professional interests.
                        </div>
                        <textarea 
                            className="form-control mb-3" 
                            placeholder="e.g., Passionate software developer with 2+ years of experience in full-stack development. Skilled in React, Node.js, and database management."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={5}
                            maxLength={1000}
                        />
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">{summary.length}/1000 characters</small>
                            <div>
                                <button 
                                    type="button"
                                    className="btn btn-secondary btn-sm me-2"
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
                                    className="btn btn-secondary btn-sm"
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
                        <p>{summary || 'Add your profile summary to highlight your career and education'}</p>
                    </div>
                )}
            </div>
        </>
    )
}
export default SectionCanProfileSummary;
