import React, { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";
import showToast from "../../../../../utils/toastNotification";

function SectionCanPersonalDetail({ profile }) {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        mobileNumber: '',
        emailAddress: '',
        dateOfBirth: '',
        gender: '',
        location: '',
        stateCode: '',
        pincode: '',
        fatherName: '',
        motherName: '',
        residentialAddress: '',
        permanentAddress: '',
        correspondenceAddress: ''
    });
    
    const indianStateCodes = [
        { code: 'AP', name: 'Andhra Pradesh' },
        { code: 'AR', name: 'Arunachal Pradesh' },
        { code: 'AS', name: 'Assam' },
        { code: 'BR', name: 'Bihar' },
        { code: 'CG', name: 'Chhattisgarh' },
        { code: 'GA', name: 'Goa' },
        { code: 'GJ', name: 'Gujarat' },
        { code: 'HR', name: 'Haryana' },
        { code: 'HP', name: 'Himachal Pradesh' },
        { code: 'JH', name: 'Jharkhand' },
        { code: 'KA', name: 'Karnataka' },
        { code: 'KL', name: 'Kerala' },
        { code: 'MP', name: 'Madhya Pradesh' },
        { code: 'MH', name: 'Maharashtra' },
        { code: 'MN', name: 'Manipur' },
        { code: 'ML', name: 'Meghalaya' },
        { code: 'MZ', name: 'Mizoram' },
        { code: 'NL', name: 'Nagaland' },
        { code: 'OD', name: 'Odisha' },
        { code: 'PB', name: 'Punjab' },
        { code: 'RJ', name: 'Rajasthan' },
        { code: 'SK', name: 'Sikkim' },
        { code: 'TN', name: 'Tamil Nadu' },
        { code: 'TS', name: 'Telangana' },
        { code: 'TR', name: 'Tripura' },
        { code: 'UP', name: 'Uttar Pradesh' },
        { code: 'UK', name: 'Uttarakhand' },
        { code: 'WB', name: 'West Bengal' },
        { code: 'AN', name: 'Andaman and Nicobar Islands' },
        { code: 'CH', name: 'Chandigarh' },
        { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu' },
        { code: 'DL', name: 'Delhi' },
        { code: 'JK', name: 'Jammu and Kashmir' },
        { code: 'LA', name: 'Ladakh' },
        { code: 'LD', name: 'Lakshadweep' },
        { code: 'PY', name: 'Puducherry' }
    ];
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [sameAsResidential, setSameAsResidential] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || profile.candidateId?.name || '',
                middleName: profile.middleName || '',
                lastName: profile.lastName || '',
                mobileNumber: profile.mobileNumber || (profile.candidateId?.phone ? profile.candidateId.phone.replace(/^\+91/, '') : ''),
                emailAddress: profile.candidateId?.email || profile.emailAddress || '',
                dateOfBirth: profile.dateOfBirth || '',
                gender: profile.gender || '',
                location: profile.location || '',
                stateCode: profile.stateCode || '',
                pincode: profile.pincode || '',
                fatherName: profile.fatherName || '',
                motherName: profile.motherName || '',
                residentialAddress: profile.residentialAddress || '',
                permanentAddress: profile.permanentAddress || '',
                correspondenceAddress: profile.correspondenceAddress || ''
            });
        }
    }, [profile]);

    const validateField = (field, value) => {
        const newErrors = { ...errors };
        
        switch (field) {

            

            

            
            case 'dateOfBirth':
                if (!value || !value.trim()) {
                    newErrors.dateOfBirth = 'Date of birth is required';
                } else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    
                    // Check if date is valid
                    if (isNaN(birthDate.getTime())) {
                        newErrors.dateOfBirth = 'Please enter a valid date';
                    }
                    // Check if date is not in the future
                    else if (birthDate > today) {
                        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
                    }
                    // Check minimum age (16 years)
                    else if (birthDate > new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())) {
                        newErrors.dateOfBirth = 'You must be at least 16 years old';
                    }
                    // Check maximum age (100 years)
                    else if (birthDate < new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())) {
                        newErrors.dateOfBirth = 'Please enter a valid date of birth';
                    }
                    else {
                        delete newErrors.dateOfBirth;
                    }
                }
                break;
            
            case 'fatherName':
            case 'motherName':
                if (!value || !value.trim()) {
                    newErrors[field] = 'This field is required';
                } else if (value.length < 2 || value.length > 50) {
                    newErrors[field] = 'Name must be between 2 and 50 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    newErrors[field] = 'Name can only contain letters and spaces';
                } else {
                    delete newErrors[field];
                }
                break;
            
            case 'residentialAddress':
            case 'permanentAddress':
            case 'correspondenceAddress':
                if (!value || !value.trim()) {
                    newErrors[field] = 'This field is required';
                } else if (value.length > 200) {
                    newErrors[field] = 'Address cannot exceed 200 characters';
                } else {
                    delete newErrors[field];
                }
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchLocationByPincode = async (pincode) => {
        if (pincode.length === 6) {
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                const data = await response.json();
                if (data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
                    const postOffice = data[0].PostOffice[0];
                    const location = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`;
                    setFormData(prev => ({ ...prev, location }));
                }
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // If pincode changes, fetch location
        if (field === 'pincode') {
            fetchLocationByPincode(value);
        }
        
        // If residential address changes and checkbox is checked, update permanent address
        if (field === 'residentialAddress' && sameAsResidential) {
            setFormData(prev => ({ ...prev, permanentAddress: value }));
        }
        
        // Auto-save after a short delay
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            autoSave();
        }, 1000);
    };

    const handleSameAsResidentialChange = (checked) => {
        setSameAsResidential(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, permanentAddress: prev.residentialAddress }));
        } else {
            setFormData(prev => ({ ...prev, permanentAddress: '' }));
        }
    };

    const autoSave = async () => {
        try {
            const updateData = {
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                location: formData.location,
                stateCode: formData.stateCode,
                pincode: formData.pincode,
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                residentialAddress: formData.residentialAddress,
                permanentAddress: formData.permanentAddress,
                correspondenceAddress: formData.correspondenceAddress
            };
            await api.updateCandidateProfile(updateData);
        } catch (error) {
            
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updateData = {
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                location: formData.location,
                stateCode: formData.stateCode,
                pincode: formData.pincode,
                fatherName: formData.fatherName.trim(),
                motherName: formData.motherName.trim(),
                residentialAddress: formData.residentialAddress.trim(),
                permanentAddress: formData.permanentAddress.trim(),
                correspondenceAddress: formData.correspondenceAddress.trim()
            };
            
            const response = await api.updateCandidateProfile(updateData);
            if (response.success) {
                showToast('Personal details updated successfully!', 'success', 4000);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                showToast('Failed to update personal details. Please try again.', 'error', 4000);
            }
        } catch (error) {
            showToast('Failed to update personal details: ' + error.message, 'error', 4000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">
                    Personal Details
                </h4>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-md-6">
                                <label><i className="fa fa-user me-1"></i> First Name *</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="First name fetched from profile"
                                    value={formData.firstName}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Name is fetched from your profile page</small>
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-user me-1"></i> Middle Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Middle name fetched from profile"
                                    value={formData.middleName}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Name is fetched from your profile page</small>
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-user me-1"></i> Last Name *</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Last name fetched from profile"
                                    value={formData.lastName}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Name is fetched from your profile page</small>
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-phone me-1"></i> Mobile Number *</label>
                                <div style={{position: 'relative'}}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '0',
                                        bottom: '0',
                                        zIndex: 10,
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #ced4da',
                                        borderRight: 'none',
                                        borderRadius: '4px 0 0 4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: '12px',
                                        paddingRight: '12px',
                                        fontSize: '14px',
                                        color: '#495057',
                                        width: '60px'
                                    }}>
                                        +91
                                    </div>
                                    <input
                                        className="form-control"
                                        type="tel"
                                        placeholder="Mobile number fetched from profile"
                                        value={formData.mobileNumber}
                                        readOnly
                                        style={{ 
                                            paddingLeft: '72px', 
                                            borderRadius: '0 4px 4px 0', 
                                            borderLeft: 'none',
                                            backgroundColor: '#f8f9fa', 
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                </div>
                                <small className="text-muted">Mobile number is fetched from your profile page</small>
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-envelope me-1"></i> Email Address *</label>
                                <input
                                    className="form-control"
                                    type="email"
                                    placeholder="Email fetched from profile"
                                    value={formData.emailAddress}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Email is fetched from your profile page</small>
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-map-marker me-1"></i> Location *</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Enter location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-map me-1"></i> State Code</label>
                                <select 
                                    className="form-control"
                                    value={formData.stateCode}
                                    onChange={(e) => handleInputChange('stateCode', e.target.value)}
                                >
                                    <option value="">Select State Code</option>
                                    {indianStateCodes.map((state, index) => (
                                        <option key={index} value={state.code}>{state.code} - {state.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-map-pin me-1"></i> Pincode *</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Enter 6-digit pincode"
                                    value={formData.pincode}
                                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                                    maxLength="6"
                                    pattern="[0-9]{6}"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label><i className="fa fa-calendar me-1"></i> Date of Birth *</label>
                                <input
                                    className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                    type="date"
                                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                                    onChange={(e) => {
                                        handleInputChange('dateOfBirth', e.target.value);
                                        validateField('dateOfBirth', e.target.value);
                                    }}
                                    max={new Date().toISOString().split('T')[0]}
                                    min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                                    required
                                />
                                {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-venus-mars me-1"></i> Gender *</label>
                                <select 
                                    className="form-control"
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-male me-1"></i> Father's / Husband's Name *</label>
                                <input
                                    className={`form-control ${errors.fatherName ? 'is-invalid' : ''}`}
                                    type="text"
                                    placeholder="Enter name"
                                    value={formData.fatherName}
                                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                    required
                                />
                                {errors.fatherName && <div className="invalid-feedback">{errors.fatherName}</div>}
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-female me-1"></i> Mother's Name *</label>
                                <input
                                    className={`form-control ${errors.motherName ? 'is-invalid' : ''}`}
                                    type="text"
                                    placeholder="Enter name"
                                    value={formData.motherName}
                                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                                    required
                                />
                                {errors.motherName && <div className="invalid-feedback">{errors.motherName}</div>}
                            </div>

                            <div className="col-md-12">
                                <label><i className="fa fa-home me-1"></i> Residential Address *</label>
                                <textarea
                                    className={`form-control ${errors.residentialAddress ? 'is-invalid' : ''}`}
                                    rows={2}
                                    placeholder="Enter address"
                                    value={formData.residentialAddress}
                                    onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                                    required
                                ></textarea>
                                {errors.residentialAddress && <div className="invalid-feedback">{errors.residentialAddress}</div>}
                            </div>

                            <div className="col-md-12">
                                <div className="d-flex align-items-center mb-2">
                                    <div 
                                        className="toggle-switch me-2"
                                        onClick={() => handleSameAsResidentialChange(!sameAsResidential)}
                                        style={{
                                            width: '40px',
                                            height: '18px',
                                            backgroundColor: sameAsResidential ? '#ff6b35' : '#ccc',
                                            borderRadius: '9px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s'
                                        }}
                                    >
                                        <div 
                                            style={{
                                                width: '14px',
                                                height: '14px',
                                                backgroundColor: 'white',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '2px',
                                                left: sameAsResidential ? '24px' : '2px',
                                                transition: 'left 0.3s'
                                            }}
                                        ></div>
                                    </div>
                                    <label style={{ cursor: 'pointer' }} onClick={() => handleSameAsResidentialChange(!sameAsResidential)}>
                                        <i className="fa fa-copy me-1"></i> Same as Residential Address
                                    </label>
                                </div>
                                <label><i className="fa fa-map-marker me-1"></i> Permanent Address *</label>
                                <textarea
                                    className={`form-control ${errors.permanentAddress ? 'is-invalid' : ''}`}
                                    rows={2}
                                    placeholder="Enter permanent address"
                                    value={formData.permanentAddress}
                                    onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                                    disabled={sameAsResidential}
                                    required
                                ></textarea>
                                {errors.permanentAddress && <div className="invalid-feedback">{errors.permanentAddress}</div>}
                            </div>
                        </div>

                        <div className="text-left mt-4">
                            <button type="button" onClick={handleSubmit} className="btn btn-outline-primary" disabled={loading || Object.keys(errors).length > 0} style={{backgroundColor: 'transparent'}}>
                                <i className="fa fa-save me-1"></i>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            {Object.keys(errors).length > 0 && (
                                <div className="text-danger mt-2">
                                    <small><i className="fa fa-exclamation-triangle me-1"></i>Please fix the validation errors above</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default SectionCanPersonalDetail;
