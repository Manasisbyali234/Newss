import { useEffect, useState, memo } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../../../utils/api";

function SectionCanEmployment({ profile }) {
    const modalId = 'EmploymentModal';
    const [formData, setFormData] = useState({
        designation: '',
        organization: '',
        isCurrent: false,
        startDate: '',
        endDate: '',
        description: ''
    });
    const [totalExperience, setTotalExperience] = useState('');
    const [loading, setLoading] = useState(false);
    const [employment, setEmployment] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (profile?.employment) {
            setEmployment(profile.employment);
        }
        if (profile?.totalExperience) {
            setTotalExperience(profile.totalExperience);
        }
    }, [profile]);



    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Designation validation
        if (!formData.designation || !formData.designation.trim()) {
            newErrors.designation = 'Designation is required';
        } else if (formData.designation.trim().length < 2) {
            newErrors.designation = 'Designation must be at least 2 characters long';
        } else if (formData.designation.trim().length > 100) {
            newErrors.designation = 'Designation cannot exceed 100 characters';
        } else if (!/^[a-zA-Z\s\-\.]+$/.test(formData.designation.trim())) {
            newErrors.designation = 'Designation can only contain letters, spaces, hyphens, and periods';
        }

        // Organization validation
        if (!formData.organization || !formData.organization.trim()) {
            newErrors.organization = 'Organization name is required';
        } else if (formData.organization.trim().length < 2) {
            newErrors.organization = 'Organization name must be at least 2 characters long';
        } else if (formData.organization.trim().length > 100) {
            newErrors.organization = 'Organization name cannot exceed 100 characters';
        }

        // Start date validation
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        } else {
            const startDate = new Date(formData.startDate);
            const today = new Date();
            const minDate = new Date('1950-01-01');

            if (startDate > today) {
                newErrors.startDate = 'Start date cannot be in the future';
            } else if (startDate < minDate) {
                newErrors.startDate = 'Start date seems too old. Please check the year.';
            }
        }

        // End date validation (only if not current job)
        if (!formData.isCurrent && !formData.endDate) {
            newErrors.endDate = 'End date is required for past employment';
        } else if (!formData.isCurrent && formData.endDate) {
            const endDate = new Date(formData.endDate);
            const startDate = new Date(formData.startDate);
            const today = new Date();

            if (endDate > today) {
                newErrors.endDate = 'End date cannot be in the future';
            } else if (startDate && endDate < startDate) {
                newErrors.endDate = 'End date cannot be before start date';
            }
        }

        // Description validation
        if (formData.description && formData.description.trim()) {
            if (formData.description.trim().length < 10) {
                newErrors.description = 'Job description should be at least 10 characters long';
            } else if (formData.description.trim().length > 1000) {
                newErrors.description = 'Job description cannot exceed 1000 characters';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        // Validate form before saving
        if (!validateForm()) {
            const errorMessages = Object.values(errors).filter(error => error);
            if (errorMessages.length > 0) {
                alert(`Please fix the following errors:\n${errorMessages.join('\n')}`);
            }
            return;
        }

        setLoading(true);
        try {
            // Test API connectivity first
            try {
                const testResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/candidate/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('candidateToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Test API call status:', testResponse.status);
                if (!testResponse.ok) {
                    const errorText = await testResponse.text();
                    console.log('Test API error:', errorText);
                    throw new Error(`API test failed: ${testResponse.status} - ${errorText}`);
                }
            } catch (testError) {
                console.error('API connectivity test failed:', testError);
                alert(`API connection failed: ${testError.message}. Please check if the backend server is running.`);
                setLoading(false);
                return;
            }
            
            // Ensure all required fields are present and valid
            if (!formData.designation?.trim() || !formData.organization?.trim() || !formData.startDate) {
                alert('Please fill in all required fields (Designation, Organization, Start Date)');
                setLoading(false);
                return;
            }
            
            const newEmploymentEntry = {
                designation: formData.designation.trim(),
                organization: formData.organization.trim(),
                isCurrent: Boolean(formData.isCurrent),
                startDate: formData.startDate,
                endDate: formData.isCurrent ? '' : (formData.endDate || ''),
                description: formData.description ? formData.description.trim() : ''
            };
            
            const newEmployment = [...employment, newEmploymentEntry];
            const updateData = { employment: newEmployment };
            
            if (totalExperience && totalExperience.trim()) {
                updateData.totalExperience = totalExperience.trim();
            }
            
            console.log('Saving employment data:', updateData);
            console.log('API URL being called:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/candidate/profile`);
            console.log('Token exists:', !!localStorage.getItem('candidateToken'));
            
            const response = await api.updateCandidateProfile(updateData);
            console.log('API response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response || {}));
            
            if (response && (response.success || response.candidate)) {
                setEmployment(newEmployment);
                setFormData({ designation: '', organization: '', isCurrent: false, startDate: '', endDate: '', description: '' });
                setErrors({});
                setTotalExperience(totalExperience || '');
                alert('Employment added successfully!');
                
                // Trigger profile update event
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                
                // Close modal with multiple fallback methods
                setTimeout(() => {
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        // Try Bootstrap 5 first
                        if (window.bootstrap?.Modal) {
                            const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                            modalInstance.hide();
                        }
                        // Fallback to jQuery if available
                        else if (window.$ && window.$.fn.modal) {
                            window.$(`#${modalId}`).modal('hide');
                        }
                        // Manual fallback
                        else {
                            modal.style.display = 'none';
                            modal.classList.remove('show');
                            document.body.classList.remove('modal-open');
                            const backdrop = document.querySelector('.modal-backdrop');
                            if (backdrop) backdrop.remove();
                        }
                    }
                }, 100);
            } else {
                console.error('Save failed:', response);
                const errorMsg = response?.message || response?.error || 'Unknown error occurred';
                alert(`Failed to save employment: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Employment save error:', error);
            alert(`Failed to save employment: ${error.message || 'Please check your connection and try again.'}`);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">Present Employment</h4>
                <button
                    type="button"
                    title="Edit"
                    className="btn btn-link site-text-primary p-0 border-0"
                    data-bs-toggle="modal"
                    data-bs-target={`#${modalId}`}
                >
                    <span className="fa fa-edit" />
                </button>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                <div className="twm-panel-inner">
                    {totalExperience && (
                        <div className="mb-3" style={{background: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e9ecef'}}>
                            <p><b>Total Experience: {totalExperience}</b></p>
                        </div>
                    )}
                    {employment.length > 0 ? (
                        employment.map((emp, index) => (
                            <div key={index} className="mb-3">
                                <p><b>{emp.designation}</b></p>
                                <p>{emp.organization}</p>
                                <p>{emp.startDate} - {emp.isCurrent ? 'Present' : emp.endDate}</p>
                                {emp.description && <p>{emp.description}</p>}
                            </div>
                        ))
                    ) : (
                        <p>No employment history added yet. Click the edit button to add your work experience.</p>
                    )}
                </div>
            </div>
            {createPortal(
                <div className="modal fade twm-saved-jobs-view" id={modalId} tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="modal-header">
                                    <h2 className="modal-title">Add Present Employment Details</h2>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-xl-12 col-lg-12">
                                            <div className="form-group">
                                                <label>Total Experience</label>
                                                <div className="ls-inputicon-box">
                                                    <input className="form-control" type="text" placeholder="e.g., 2 years, 6 months" value={totalExperience} onChange={(e) => setTotalExperience(e.target.value)} style={{paddingLeft: '40px'}} />
                                                    <i className="fs-input-icon fa fa-clock" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-12 col-lg-12">
                                            <div className="form-group">
                                                <label>Your Designation *</label>
                                                <div className="ls-inputicon-box">
                                                    <input className={`form-control ${errors.designation ? 'is-invalid' : ''}`} type="text" placeholder="Enter Your Designation" value={formData.designation} onChange={(e) => handleInputChange('designation', e.target.value)} style={{paddingLeft: '40px'}} />
                                                    <i className="fs-input-icon fa fa-address-card" />
                                                </div>
                                                {errors.designation && <div className="invalid-feedback d-block">{errors.designation}</div>}
                                            </div>
                                        </div>
                                        <div className="col-xl-12 col-lg-12">
                                            <div className="form-group">
                                                <label>Your Organization *</label>
                                                <div className="ls-inputicon-box">
                                                    <input className={`form-control ${errors.organization ? 'is-invalid' : ''}`} type="text" placeholder="Enter Your Organization" value={formData.organization} onChange={(e) => handleInputChange('organization', e.target.value)} style={{paddingLeft: '40px'}} />
                                                    <i className="fs-input-icon fa fa-building" />
                                                </div>
                                                {errors.organization && <div className="invalid-feedback d-block">{errors.organization}</div>}
                                            </div>
                                        </div>
                                        <div className="col-xl-12 col-lg-12">
                                            <div className="form-group">
                                                <label>Is this your current company?</label>
                                                <div className="row twm-form-radio-inline">
                                                    <div className="col-md-6">
                                                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked={formData.isCurrent} onChange={() => handleInputChange('isCurrent', true)} />
                                                        <label className="form-check-label" htmlFor="flexRadioDefault1">Yes</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="S_no" checked={!formData.isCurrent} onChange={() => handleInputChange('isCurrent', false)} />
                                                        <label className="form-check-label" htmlFor="S_no">No</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Started Working From *</label>
                                                <div className="ls-inputicon-box">
                                                    <input className={`form-control ${errors.startDate ? 'is-invalid' : ''}`} type="date" value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} style={{paddingLeft: '40px'}} />
                                                    <i className="fs-input-icon far fa-calendar" />
                                                </div>
                                                {errors.startDate && <div className="invalid-feedback d-block">{errors.startDate}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Worked Till {!formData.isCurrent && '*'}</label>
                                                <div className="ls-inputicon-box">
                                                    <input className={`form-control ${errors.endDate ? 'is-invalid' : ''}`} type="date" value={formData.endDate} onChange={(e) => handleInputChange('endDate', e.target.value)} disabled={formData.isCurrent} style={{paddingLeft: '40px'}} />
                                                    <i className="fs-input-icon far fa-calendar" />
                                                </div>
                                                {errors.endDate && <div className="invalid-feedback d-block">{errors.endDate}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group mb-0">
                                                <label>Describe your Job Profile</label>
                                                <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows={3} placeholder="Describe your Job" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                                                {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                                                <small className="text-muted">Optional: {formData.description.length}/1000 characters</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="site-button" data-bs-dismiss="modal">Close</button>
                                    <button type="button" className="site-button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSave(); }} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
export default memo(SectionCanEmployment);
