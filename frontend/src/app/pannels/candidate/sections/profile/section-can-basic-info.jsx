import React, { useState, useEffect, useRef } from "react";
import { api } from "../../../../../utils/api";
import CountryCodeSelector from "../../../../../components/CountryCodeSelector";
import showToast from "../../../../../utils/toastNotification";

const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
    'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad'
];


function SectionCandicateBasicInfo() {
    const [formData, setFormData] = useState({
        name: '',
        middleName: '',
        lastName: '',
        phone: '',
        phoneCountryCode: '+91',
        email: '',
        location: '',
        pincode: '',
        profilePicture: null
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentProfilePicture, setCurrentProfilePicture] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [notification, setNotification] = useState(null);
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const locationDropdownRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);
    
    useEffect(() => {
        if (notification && notification.type === 'error') {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
                setLocationDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            if (!token) {
                setNotification({ type: 'error', message: 'Please log in to access your profile.' });
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            }
            
            // Check if backend server is running
            try {
                await fetch('http://localhost:5000/health');
            } catch (serverError) {
                setNotification({ type: 'error', message: 'Backend server is not running. Please start the server.' });
                return;
            }
            
            const response = await api.getCandidateProfile();
            
            
            if (response.success && response.profile) {
                const profile = response.profile;
                const candidate = profile.candidateId || {};
                
                // Handle phone number splitting for country code
                let phoneNumber = candidate.phone || '';
                let countryCode = '+91';

                if (phoneNumber.startsWith('+')) {
                    // Find the country code from the phone number
                    const countryCodes = ['+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', '+95', '+98', '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+248', '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298', '+299', '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+389', '+420', '+421', '+423', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', '+509', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', '+599', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', '+680', '+681', '+682', '+683', '+684', '+685', '+686', '+687', '+688', '+689', '+690', '+691', '+692', '+850', '+852', '+853', '+855', '+856', '+880', '+886', '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', '+972', '+973', '+974', '+975', '+976', '+977', '+992', '+993', '+994', '+995', '+996', '+998'];

                    for (const code of countryCodes) {
                        if (phoneNumber.startsWith(code)) {
                            countryCode = code;
                            phoneNumber = phoneNumber.substring(code.length).trim();
                            break;
                        }
                    }
                }

                console.log('Profile data received:', { pincode: profile.pincode, location: profile.location });
                setFormData({
                    name: candidate.name || '',
                    middleName: profile.middleName || '',
                    lastName: profile.lastName || '',
                    phone: phoneNumber,
                    phoneCountryCode: countryCode,
                    email: candidate.email || '',
                    location: profile.location || '',
                    pincode: profile.pincode || '',
                    profilePicture: null
                });
                setErrors({});
                setTouched({});
                setCurrentProfilePicture(profile.profilePicture);
            }
        } catch (error) {
            
            if (error.message && error.message.includes('401')) {
                setNotification({ type: 'error', message: 'Please log in to access your profile.' });
                setTimeout(() => window.location.href = '/login', 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const validateField = (name, value) => {
        const newErrors = { ...errors };
        
        switch (name) {
            case 'name':
                if (!value || !value.trim()) {
                    newErrors.name = 'This field is required';
                } else if (value.length < 2 || value.length > 50) {
                    newErrors.name = 'Name must be between 2 and 50 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    newErrors.name = 'Name can only contain letters and spaces';
                } else {
                    delete newErrors.name;
                }
                break;
            
            case 'middleName':
                if (value && value.trim()) {
                    if (value.length > 30) {
                        newErrors.middleName = 'Middle name cannot exceed 30 characters';
                    } else if (!/^[a-zA-Z\s]*$/.test(value)) {
                        newErrors.middleName = 'Middle name can only contain letters and spaces';
                    } else {
                        delete newErrors.middleName;
                    }
                } else {
                    delete newErrors.middleName;
                }
                break;
            
            case 'lastName':
                if (!value || !value.trim()) {
                    newErrors.lastName = 'Last name is required';
                } else if (value.length > 30) {
                    newErrors.lastName = 'Last name cannot exceed 30 characters';
                } else if (!/^[a-zA-Z\s]*$/.test(value)) {
                    newErrors.lastName = 'Last name can only contain letters and spaces';
                } else {
                    delete newErrors.lastName;
                }
                break;
            
            case 'phone':
                if (!value || !value.trim()) {
                    newErrors.phone = 'Mobile number is required';
                } else if (!/^\d{7,15}$/.test(value.replace(/\s/g, ''))) {
                    newErrors.phone = 'Mobile number must be 7-15 digits';
                } else {
                    delete newErrors.phone;
                }
                break;
            
            case 'email':
                if (!value || !value.trim()) {
                    newErrors.email = 'This field is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Please provide a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;
            
            case 'location':
                if (!value || !value.trim()) {
                    newErrors.location = 'Location is required';
                } else if (value.length > 100) {
                    newErrors.location = 'Location cannot exceed 100 characters';
                } else if (!/^[a-zA-Z0-9\s,.-]*$/.test(value)) {
                    newErrors.location = 'Location contains invalid characters';
                } else {
                    delete newErrors.location;
                }
                break;
            
            case 'pincode':
                if (!value || !value.trim()) {
                    newErrors.pincode = 'Pincode is required';
                } else if (!/^\d{6}$/.test(value)) {
                    newErrors.pincode = 'Pincode must be 6 digits';
                } else {
                    delete newErrors.pincode;
                }
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Validate field if it has been touched
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({...prev, profilePicture: 'File size must be less than 5MB'}));
                setNotification({ type: 'error', message: 'File size must be less than 5MB' });
                e.target.value = '';
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({...prev, profilePicture: 'Please upload only JPG, PNG or GIF files'}));
                setNotification({ type: 'error', message: 'Please upload only JPG, PNG or GIF files' });
                e.target.value = '';
                return;
            }
            
            // Clear any previous errors
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.profilePicture;
                return newErrors;
            });
            
            setFormData(prev => ({
                ...prev,
                profilePicture: file
            }));
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };



    const validateForm = () => {
        const fieldsToValidate = ['name', 'email', 'lastName', 'phone', 'location', 'pincode'];
        let isValid = true;
        
        fieldsToValidate.forEach(field => {
            const fieldValid = validateField(field, formData[field]);
            if (!fieldValid) isValid = false;
        });
        
        // Validate middle name only if it has a value
        if (formData.middleName && formData.middleName.trim()) {
            const middleNameValid = validateField('middleName', formData.middleName);
            if (!middleNameValid) isValid = false;
        }
        
        // Mark all fields as touched
        const allTouched = {};
        fieldsToValidate.forEach(field => {
            allTouched[field] = true;
        });
        if (formData.middleName && formData.middleName.trim()) {
            allTouched.middleName = true;
        }
        setTouched(allTouched);
        
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setNotification({ type: 'error', message: 'Please fix the validation errors before submitting.' });
            return;
        }
        
        setSaving(true);
        
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('middleName', formData.middleName.trim());
            submitData.append('lastName', formData.lastName.trim());
            submitData.append('phone', `${formData.phoneCountryCode}${formData.phone.trim()}`);
            submitData.append('email', formData.email.trim());
            submitData.append('location', formData.location.trim());
            submitData.append('pincode', formData.pincode.trim());
            if (formData.profilePicture) {
                submitData.append('profilePicture', formData.profilePicture);
            }
            
            
            
            const response = await api.updateCandidateProfile(submitData);
            
            if (response.success) {
                showToast('Profile updated successfully!', 'success', 4000);
                // Scroll to top of the page
                window.scrollTo({ top: 0, behavior: 'smooth' });
                fetchProfile();
                setImagePreview(null);
                window.dispatchEvent(new Event('profileUpdated'));
            } else {
                if (response.errors && Array.isArray(response.errors)) {
                    const errorMessages = response.errors.map(err => err.msg).join(', ');
                    setNotification({ type: 'error', message: `Validation errors: ${errorMessages}` });
                } else {
                    setNotification({ type: 'error', message: `Failed to update profile: ${response.message || 'Unknown error'}` });
                }
            }
        } catch (error) {
            
            if (error.response?.status === 401) {
                setNotification({ type: 'error', message: 'Please log in to update your profile.' });
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            } else if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
                setNotification({ type: 'error', message: `Validation errors: ${errorMessages}` });
            } else {
                setNotification({ type: 'error', message: `Error updating profile: ${error.message}` });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="panel panel-default">
                <div className="panel-body p-a20 text-center">
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0" style={{color: '#232323'}}>
                        <i className="fa fa-info-circle me-2" style={{color: '#ff6b35'}}></i>
                        Basic Information
                    </h4>
                </div>
                <div className="panel-body wt-panel-body p-a20 m-b30">
                    {/* Profile Picture Section */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <div className="profile-picture-section text-center">
                                <label className="form-label fw-bold mb-3">
                                    <i className="fa fa-camera me-2" style={{color: '#ff6b35'}}></i>
                                    Profile Picture
                                </label>
                                <div className="mb-3">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="profile-image-preview rounded-circle"
                                            style={{width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #ff6b35'}}
                                        />
                                    ) : currentProfilePicture ? (
                                        <img 
                                            src={currentProfilePicture} 
                                            alt="Current Profile" 
                                            className="profile-image-preview rounded-circle"
                                            style={{width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #ff6b35'}}
                                        />
                                    ) : (
                                        <div className="profile-placeholder rounded-circle d-flex align-items-center justify-content-center" 
                                             style={{width: '120px', height: '120px', backgroundColor: '#f8f9fa', border: '3px dashed #dee2e6', margin: '0 auto'}}>
                                            <i className="fa fa-user fa-3x text-muted"></i>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    className={`form-control mx-auto ${errors.profilePicture ? 'is-invalid' : ''}`}
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{maxWidth: '300px'}}
                                />
                                {errors.profilePicture && (
                                    <div className="invalid-feedback d-block" style={{maxWidth: '300px', margin: '0 auto'}}>
                                        {errors.profilePicture}
                                    </div>
                                )}
                                <small className="text-muted mt-2 d-block">Upload JPG, PNG or GIF (Max 5MB)</small>
                            </div>
                        </div>
                    </div>



                    <hr className="my-4" />

                    {/* Personal Information */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-user me-2" style={{color: '#ff6b35'}}></i>First Name *</label>
                            <input
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Enter your complete name"
                                required
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-user me-2" style={{color: '#ff6b35'}}></i>Middle Name</label>
                            <input
                                className={`form-control ${errors.middleName ? 'is-invalid' : ''}`}
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Middle name (optional)"
                            />
                            {errors.middleName && <div className="invalid-feedback">{errors.middleName}</div>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-user me-2" style={{color: '#ff6b35'}}></i>Last Name *</label>
                            <input
                                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Last name"
                                required
                            />
                            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-phone me-2" style={{color: '#ff6b35'}}></i>Mobile Number *</label>
                            <div className="input-group">
                                <CountryCodeSelector
                                    value={formData.phoneCountryCode}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, phoneCountryCode: value }));
                                        if (touched.phone) {
                                            validateField('phone', formData.phone);
                                        }
                                    }}
                                />
                                <input
                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter mobile number"
                                    maxLength="15"
                                    required
                                    style={{ borderRadius: '0 0.375rem 0.375rem 0' }}
                                />
                            </div>
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                            <small className="text-muted">Enter 7-15 digit mobile number</small>
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-envelope me-2" style={{color: '#ff6b35'}}></i>Email Address *</label>
                            <input
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Enter email address"
                                required
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                        <div className="col-md-4 mb-3" ref={locationDropdownRef}>
                            <label className="form-label"><i className="fa fa-map-marker me-2" style={{color: '#ff6b35'}}></i>Location *</label>
                            <div style={{position: 'relative'}}>
                                <input
                                    className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        setLocationSearch(e.target.value);
                                        setLocationDropdownOpen(true);
                                    }}
                                    onFocus={() => setLocationDropdownOpen(true)}
                                    onBlur={handleBlur}
                                    placeholder="Select or type location"
                                    autoComplete="off"
                                    required
                                />
                                {locationDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        backgroundColor: '#fff',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '0 0 8px 8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        zIndex: 1050,
                                        marginTop: '2px'
                                    }}>
                                        {indianCities
                                            .filter(city => city.toLowerCase().includes(formData.location.toLowerCase()))
                                            .map(city => (
                                                <div
                                                    key={city}
                                                    onClick={() => {
                                                        setFormData(prev => ({...prev, location: city}));
                                                        setLocationDropdownOpen(false);
                                                        if (touched.location) validateField('location', city);
                                                    }}
                                                    style={{
                                                        padding: '10px 16px',
                                                        cursor: 'pointer',
                                                        transition: 'background-color 0.2s',
                                                        borderBottom: '1px solid #f0f0f0'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                            {errors.location && <div className="invalid-feedback">{errors.location}</div>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-map-pin me-2" style={{color: '#ff6b35'}}></i>Pincode *</label>
                            <input
                                className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Enter 6-digit pincode"
                                maxLength="6"
                                required
                            />
                            {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                            <small className="text-muted">Enter 6-digit pincode</small>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <button 
                            type="submit" 
                            className="btn btn-outline-primary btn-lg px-5"
                            disabled={saving || Object.keys(errors).length > 0}
                            style={{backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35'}}
                        >
                            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`}></i>
                            {saving ? 'Saving Profile...' : 'Save Profile'}
                        </button>

                    </div>
                </div>
            </div>
        </form>
    );
}

export default SectionCandicateBasicInfo;
