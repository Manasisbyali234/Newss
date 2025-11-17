import { useEffect, useState } from "react";
import { api } from "../../../../../utils/api";
import showToast from "../../../../../utils/toastNotification";

function SectionCanAttachment({ profile }) {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (profile?.resumeFileName) {
            setResumeFile(profile.resumeFileName);
        } else {
            setResumeFile(null);
        }
    }, [profile?.resumeFileName]);

    const handleFileSelect = (e) => {
        // Prevent file selection if resume already exists
        if (resumeFile) {
            showToast('Please delete your current resume before uploading a new one.', 'warning', 4000);
            e.target.value = ''; // Clear the input
            return;
        }

        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit to match backend)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                showToast('File size must be less than 5MB. Please choose a smaller file.', 'error', 4000);
                e.target.value = ''; // Clear the input
                return;
            }
            
            // Check file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                showToast('Only PDF, DOC, and DOCX files are allowed.', 'error', 4000);
                e.target.value = ''; // Clear the input
                return;
            }
        }
        setSelectedFile(file);
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            showToast('Please select a file first', 'warning', 4000);
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', selectedFile);

        try {
            const response = await api.uploadResume(formData);
            if (response.success) {
                showToast('Resume uploaded successfully!', 'success', 4000);
                setResumeFile(selectedFile.name);
                setSelectedFile(null);
                // Clear the file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                showToast(`Failed to upload resume: ${response.message || 'Unknown error'}`, 'error', 4000);
            }
        } catch (error) {
            console.error('Resume upload error:', error);
            let errorMessage = 'Failed to upload resume';
            if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            showToast(errorMessage, 'error', 4000);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!resumeFile) {
            showToast('No resume to delete', 'warning', 4000);
            return;
        }

        if (!window.confirm('Are you sure you want to delete your current resume? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await api.deleteResume();
            if (response.success) {
                showToast('Resume deleted successfully!', 'success', 4000);
                setResumeFile(null);
                setSelectedFile(null);
                // Clear the file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                showToast(`Failed to delete resume: ${response.message || 'Unknown error'}`, 'error', 4000);
            }
        } catch (error) {
            console.error('Resume delete error:', error);
            let errorMessage = 'Failed to delete resume';
            if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            showToast(errorMessage, 'error', 4000);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">
                    <i className="fa fa-paperclip site-text-primary me-2"></i>
                    Attach Resume
                </h4>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <p>Resume is the most important document recruiters look for. Recruiters generally do not look at profiles without resumes.</p>
                    <div className="dashboard-cover-pic">
                        <div className="mb-3">
                            <label className="form-label">
                                <i className="fa fa-file-text me-1"></i>
                                Choose Resume File
                            </label>
                            <div className="position-relative">
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    onChange={handleFileSelect}
                                    disabled={uploading || deleting || resumeFile}
                                    className="form-control"
                                    style={{opacity: 0, position: 'absolute', zIndex: 2}}
                                />
                                <div className="form-control d-flex align-items-center" style={{cursor: resumeFile ? 'not-allowed' : 'pointer', color: resumeFile ? '#dc3545' : '#6c757d', backgroundColor: resumeFile ? '#f8f9fa' : 'white'}}>
                                    {resumeFile ? `Current: ${resumeFile} (Delete to upload new)` : selectedFile ? selectedFile.name : 'No file chosen'}
                                </div>
                            </div>
                        </div>
                        {selectedFile && (
                            <p className="text-info">
                                <i className="fa fa-file me-1"></i>
                                Selected: {selectedFile.name}
                            </p>
                        )}
                        <div className="d-flex gap-2 mb-3">
                            <button 
                                type="button" 
                                className="btn btn-outline-primary"
                                onClick={handleSubmit}
                                disabled={uploading || !selectedFile || deleting}
                                style={{backgroundColor: 'transparent'}}
                            >
                                <i className="fa fa-upload me-1"></i>
                                {uploading ? 'Uploading...' : 'Submit Resume'}
                            </button>
                            {resumeFile && (
                                <button 
                                    type="button" 
                                    className="btn btn-outline-danger"
                                    onClick={handleDelete}
                                    disabled={deleting || uploading}
                                    style={{backgroundColor: 'transparent'}}
                                >
                                    <i className="fa fa-trash me-1"></i>
                                    {deleting ? 'Deleting...' : 'Delete Resume'}
                                </button>
                            )}
                        </div>
                        {resumeFile && (
                            <div className="alert alert-success d-flex justify-content-between align-items-center" style={{padding: '8px 12px'}}>
                                <span>
                                    <i className="fa fa-check-circle me-1"></i>
                                    Current resume: <span style={{fontWeight: 'bold'}}>{resumeFile}</span>
                                </span>
                            </div>
                        )}
                        <div className="text-muted small">
                            <p className="mb-1">
                                <i className="fa fa-info-circle me-1"></i>
                                Upload Resume File size max 5 MB (PDF, DOC, DOCX only)
                            </p>
                            {resumeFile && (
                                <p className="mb-0 text-warning">
                                    <i className="fa fa-exclamation-triangle me-1"></i>
                                    To update your resume, first delete the current one, then upload a new file.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SectionCanAttachment;
