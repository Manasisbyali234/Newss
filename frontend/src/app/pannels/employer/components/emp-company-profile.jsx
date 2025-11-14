import { Briefcase, Building, Calendar, FileText, Globe, Hash, IdCard, Image as ImageIcon, Mail, MapPin, Phone, Upload, User as UserIcon, Users as UsersIcon, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { loadScript } from "../../../../globals/constants";
import CountryCodeSelector from "../../../../components/CountryCodeSelector";
import './emp-company-profile.css';

function EmpCompanyProfilePage() {
    const [formData, setFormData] = useState({
        // Basic Information
        employerCategory: '',
        companyName: '',
        phone: '',
        phoneCountryCode: '+91',
        email: '',
        website: '',
        establishedSince: '',
        teamSize: '',
        customTeamSize: '',

        description: '',
        location: '',
        googleMapsEmbed: '',
        whyJoinUs: '',

        // Company Details
        legalEntityCode: '',
        corporateAddress: '',
        branchLocations: '',
        pincode: '',
        city: '',
        officialEmail: '',
        officialMobile: '',
        officialMobileCountryCode: '+91',
        companyType: '',
        cin: '',
        gstNumber: '',
        industrySector: '',
        panNumber: '',
        agreeTerms: '',

        // Primary Contact
        contactFullName: '',
        contactMiddleName: '',
        contactLastName: '',
        contactDesignation: '',
        contactOfficialEmail: '',
        contactMobile: '',
        contactMobileCountryCode: '+91',
        companyIdCardPicture: '',
        alternateContact: '',
        alternateContactCountryCode: '+91',
        
        // Images
        logo: '',
        coverImage: '',
        
        // Authorization Letters
        authorizationLetters: [],
        
        // Gallery
        gallery: []
    });

    const [loading, setLoading] = useState(false);
    const [authSections, setAuthSections] = useState([{ id: 1, companyName: '' }]);
    const [errors, setErrors] = useState({});
    const [fetchingCity, setFetchingCity] = useState(false);

    useEffect(() => {
        loadScript("js/custom.js");
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                alert('Please login to access your profile.');
                window.location.href = '/employer/login';
                return;
            }
            const response = await fetch('http://localhost:5000/api/employer/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            if (data.success && data.profile) {
                const profileData = { ...data.profile };

                // Split phone numbers into country code and number parts
                if (profileData.phone) {
                    const phoneStr = String(profileData.phone).trim();
                    // Match country code (prefer longer matches like +91 over +1)
                    const phoneMatch = phoneStr.match(/^(\+\d{2,4})(\d+)$/) || phoneStr.match(/^(\+\d{1})(\d{10,})$/);
                    if (phoneMatch) {
                        profileData.phoneCountryCode = phoneMatch[1];
                        profileData.phone = phoneMatch[2];
                    } else {
                        profileData.phoneCountryCode = '+91';
                        profileData.phone = phoneStr.replace(/^\+\d+/, '');
                    }
                } else {
                    profileData.phoneCountryCode = '+91';
                    profileData.phone = '';
                }

                if (profileData.officialMobile) {
                    const officialStr = String(profileData.officialMobile).trim();
                    const officialMatch = officialStr.match(/^(\+\d{2,4})(\d+)$/) || officialStr.match(/^(\+\d{1})(\d{10,})$/);
                    if (officialMatch) {
                        profileData.officialMobileCountryCode = officialMatch[1];
                        profileData.officialMobile = officialMatch[2];
                    } else {
                        profileData.officialMobileCountryCode = '+91';
                        profileData.officialMobile = officialStr.replace(/^\+\d+/, '');
                    }
                } else {
                    profileData.officialMobileCountryCode = '+91';
                    profileData.officialMobile = '';
                }

                if (profileData.contactMobile) {
                    const contactStr = String(profileData.contactMobile).trim();
                    const contactMatch = contactStr.match(/^(\+\d{2,4})(\d+)$/) || contactStr.match(/^(\+\d{1})(\d{10,})$/);
                    if (contactMatch) {
                        profileData.contactMobileCountryCode = contactMatch[1];
                        profileData.contactMobile = contactMatch[2];
                    } else {
                        profileData.contactMobileCountryCode = '+91';
                        profileData.contactMobile = contactStr.replace(/^\+\d+/, '');
                    }
                } else {
                    profileData.contactMobileCountryCode = '+91';
                    profileData.contactMobile = '';
                }

                if (profileData.alternateContact) {
                    const alternateStr = String(profileData.alternateContact).trim();
                    const alternateMatch = alternateStr.match(/^(\+\d{2,4})(\d+)$/) || alternateStr.match(/^(\+\d{1})(\d{10,})$/);
                    if (alternateMatch) {
                        profileData.alternateContactCountryCode = alternateMatch[1];
                        profileData.alternateContact = alternateMatch[2];
                    } else {
                        profileData.alternateContactCountryCode = '+91';
                        profileData.alternateContact = alternateStr.replace(/^\+\d+/, '');
                    }
                } else {
                    profileData.alternateContactCountryCode = '+91';
                    profileData.alternateContact = '';
                }

                // Handle team size - if it's not a predefined option, set it as custom
                const predefinedSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
                if (profileData.teamSize && !predefinedSizes.includes(profileData.teamSize)) {
                    profileData.customTeamSize = profileData.teamSize;
                    profileData.teamSize = 'custom';
                }

                setFormData(prev => ({ ...prev, ...profileData }));

                // Populate authSections from existing authorization letters
                if (data.profile.authorizationLetters && data.profile.authorizationLetters.length > 0) {
                    const existingSections = data.profile.authorizationLetters.map((letter, index) => ({
                        id: index + 1,
                        companyName: letter.companyName || ''
                    }));
                    setAuthSections(existingSections.length > 0 ? existingSections : [{ id: 1, companyName: '' }]);
                }
            }
        } catch (error) {
            
        }
    };

    const handleInputChange = async (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        
        // Fetch city when pincode is entered
        if (field === 'pincode' && value.length === 6) {
            await fetchCityFromPincode(value);
        }
        
        // Real-time validation for specific fields
        const newErrors = { ...errors };
        
        switch (field) {
            case 'email':
            case 'officialEmail':
            case 'contactOfficialEmail':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors[field] = 'Please enter a valid email address';
                } else {
                    delete newErrors[field];
                }
                break;
            case 'phone':
            case 'officialMobile':
            case 'contactMobile':
            case 'alternateContact':
                if (value) {
                    const cleanNumber = value.replace(/[\s\-\(\)]/g, '');
                    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
                        newErrors[field] = 'Phone number must be between 7-15 digits';
                    } else {
                        delete newErrors[field];
                    }
                } else {
                    delete newErrors[field];
                }
                break;
            case 'website':
                if (value && !/^https?:\/\/.+/.test(value)) {
                    newErrors[field] = 'Website must start with http:// or https://';
                } else {
                    delete newErrors[field];
                }
                break;
            case 'establishedSince':
                if (value && !/^\d{4}$/.test(value)) {
                    newErrors[field] = 'Please enter a valid 4-digit year';
                } else {
                    delete newErrors[field];
                }
                break;
            case 'cin':
                // Convert to uppercase
                value = value.toUpperCase();
                setFormData(prev => ({ ...prev, [field]: value }));
                
                if (value && !/^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(value)) {
                    newErrors[field] = 'Invalid CIN format. Must be 21 characters (e.g., U12345AB1234ABC123456)';
                } else {
                    delete newErrors[field];
                }
                break;
            case 'gstNumber':
                // Convert to uppercase
                value = value.toUpperCase();
                setFormData(prev => ({ ...prev, [field]: value }));
                
                if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
                    newErrors[field] = 'Invalid GST format. Must be 15 characters (e.g., 12ABCDE1234F1Z5)';
                } else {
                    delete newErrors[field];
                }
                break;
            case 'panNumber':
                // Convert to uppercase
                value = value.toUpperCase();
                setFormData(prev => ({ ...prev, [field]: value }));
                
                if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                    newErrors[field] = 'Invalid PAN format. Must be 10 characters (e.g., ABCDE1234F)';
                } else {
                    delete newErrors[field];
                }
                break;
        }
        
        setErrors(newErrors);
    };

    const fetchCityFromPincode = async (pincode) => {
        if (!/^\d{6}$/.test(pincode)) return;
        
        setFetchingCity(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();
            
            if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                const city = data[0].PostOffice[0].District;
                setFormData(prev => ({ ...prev, city }));
            } else {
                setFormData(prev => ({ ...prev, city: '' }));
                alert('Invalid pincode or city not found');
            }
        } catch (error) {
            console.error('Error fetching city:', error);
        } finally {
            setFetchingCity(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Basic Information Validation
        if (!formData.companyName?.trim()) {
            newErrors.companyName = 'Company name is required';
        } else if (formData.companyName.length < 2) {
            newErrors.companyName = 'Company name must be at least 2 characters';
        }
        
        if (!formData.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
            const cleanNumber = formData.phone.replace(/[\s\-\(\)]/g, '');
            if (cleanNumber.length < 7 || cleanNumber.length > 15) {
                newErrors.phone = 'Phone number must be between 7-15 digits';
            }
        }
        
        if (!formData.email?.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
            newErrors.website = 'Website must start with http:// or https://';
        }
        
        if (formData.establishedSince && !/^\d{4}$/.test(formData.establishedSince)) {
            newErrors.establishedSince = 'Please enter a valid 4-digit year';
        }
        
        // Company Details Validation
        if (formData.corporateAddress && formData.corporateAddress.length < 10) {
            newErrors.corporateAddress = 'Corporate address must be at least 10 characters';
        }
        
        if (formData.officialEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail)) {
            newErrors.officialEmail = 'Please enter a valid official email address';
        }
        
        if (formData.officialMobile) {
            const cleanNumber = formData.officialMobile.replace(/[\s\-\(\)]/g, '');
            if (cleanNumber.length < 7 || cleanNumber.length > 15) {
                newErrors.officialMobile = 'Official mobile number must be between 7-15 digits';
            }
        }
        
        if (formData.cin && !/^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(formData.cin)) {
            newErrors.cin = 'Invalid CIN format. Must be 21 characters (e.g., U12345AB1234ABC123456)';
        }
        
        if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
            newErrors.gstNumber = 'Invalid GST format. Must be 15 characters (e.g., 12ABCDE1234F1Z5)';
        }
        
        if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
            newErrors.panNumber = 'Invalid PAN format. Must be 10 characters (e.g., ABCDE1234F)';
        }
        
        // Primary Contact Validation
        if (!formData.contactFullName?.trim()) {
            newErrors.contactFullName = 'Full name is required';
        } else if (formData.contactFullName.length < 2) {
            newErrors.contactFullName = 'Full name must be at least 2 characters';
        }
        
        if (!formData.contactLastName?.trim()) {
            newErrors.contactLastName = 'Last name is required';
        } else if (formData.contactLastName.length < 2) {
            newErrors.contactLastName = 'Last name must be at least 2 characters';
        }
        
        if (!formData.contactDesignation?.trim()) {
            newErrors.contactDesignation = 'Designation is required';
        } else if (formData.contactDesignation.length < 2) {
            newErrors.contactDesignation = 'Designation must be at least 2 characters';
        }
        
        if (!formData.contactOfficialEmail?.trim()) {
            newErrors.contactOfficialEmail = 'Official email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactOfficialEmail)) {
            newErrors.contactOfficialEmail = 'Please enter a valid email address';
        }
        
        if (!formData.contactMobile?.trim()) {
            newErrors.contactMobile = 'Contact mobile number is required';
        } else {
            const cleanNumber = formData.contactMobile.replace(/[\s\-\(\)]/g, '');
            if (cleanNumber.length < 7 || cleanNumber.length > 15) {
                newErrors.contactMobile = 'Contact mobile number must be between 7-15 digits';
            }
        }
        
        if (formData.alternateContact) {
            const cleanNumber = formData.alternateContact.replace(/[\s\-\(\)]/g, '');
            if (cleanNumber.length < 7 || cleanNumber.length > 15) {
                newErrors.alternateContact = 'Alternate contact number must be between 7-15 digits';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate image file by size, type, and minimum dimensions
    const validateImageFile = (file, { maxSizeMB, minWidth, minHeight, allowedTypes }) => {
        return new Promise((resolve) => {
            // Size check
            const maxBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxBytes) {
                resolve({ ok: false, message: `File is too large. Max size is ${maxSizeMB}MB.` });
                return;
            }

            // Type check
            if (allowedTypes && !allowedTypes.includes(file.type)) {
                resolve({ ok: false, message: `Invalid file type. Allowed: ${allowedTypes.join(", ")}.` });
                return;
            }

            // Dimension check (images only)
            try {
                const img = new Image();
                const objectUrl = URL.createObjectURL(file);
                img.onload = () => {
                    const { width, height } = img;
                    URL.revokeObjectURL(objectUrl);
                    if (width < minWidth || height < minHeight) {
                        resolve({ ok: false, message: `Image too small. Minimum ${minWidth}x${minHeight}px required.` });
                    } else {
                        resolve({ ok: true });
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve({ ok: false, message: 'Unable to read image. Please try a different file.' });
                };
                img.src = objectUrl;
            } catch (err) {
                resolve({ ok: false, message: 'Validation failed. Please try again.' });
            }
        });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate logo: <=1MB, jpg/png, min 136x136
        const result = await validateImageFile(file, {
            maxSizeMB: 1,
            minWidth: 136,
            minHeight: 136,
            allowedTypes: ['image/jpeg', 'image/png']
        });
        if (!result.ok) {
            alert(`Logo: ${result.message}`);
            return;
        }

        const body = new FormData();
        body.append('logo', file);
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                alert('Please login again to upload files.');
                return;
            }
            const response = await fetch('http://localhost:5000/api/employer/profile/logo', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });
            const data = await response.json();
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            if (data.success) {
                handleInputChange('logo', data.logo);
            } else {
                alert(data.message || 'Logo upload failed');
            }
        } catch (error) {
            
            alert('Logo upload failed. Please try again.');
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate cover: <=2MB, jpg/png, no minimum size restriction
        const result = await validateImageFile(file, {
            maxSizeMB: 2,
            minWidth: 1,
            minHeight: 1,
            allowedTypes: ['image/jpeg', 'image/png']
        });
        if (!result.ok) {
            alert(`Cover Image: ${result.message}`);
            return;
        }

        const body = new FormData();
        body.append('cover', file);
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                alert('Please login again to upload files.');
                return;
            }
            const response = await fetch('http://localhost:5000/api/employer/profile/cover', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });
            const data = await response.json();
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            if (data.success) {
                handleInputChange('coverImage', data.coverImage);
            } else {
                alert(data.message || 'Cover image upload failed');
            }
        } catch (error) {
            
            alert('Cover image upload failed. Please try again.');
        }
    };

    const handleDocumentUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate documents: <=5MB, allow images (jpg/png/jpeg) and PDF
        const maxBytes = 5 * 1024 * 1024;
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (file.size > maxBytes) {
            alert('Document is too large. Max size is 5MB.');
            return;
        }
        if (!allowed.includes(file.type)) {
            alert('Invalid document type. Allowed: JPEG, PNG, PDF.');
            return;
        }

        const body = new FormData();
        body.append('document', file);
        body.append('fieldName', fieldName);
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                alert('Please login again to upload files.');
                return;
            }
            const response = await fetch('http://localhost:5000/api/employer/profile/document', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: body
            });
            const data = await response.json();
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            if (data.success) {
                handleInputChange(fieldName, data.filePath);
            } else {
                alert(data.message || 'Document upload failed');
            }
        } catch (error) {
            
            alert('Document upload failed. Please try again.');
        }
    };

    const handleAuthorizationLetterUpload = async (e, sectionId) => {
        const file = e.target.files[0];
        if (!file) return;

        // Get company name for this section
        const section = authSections.find(s => s.id === sectionId);
        const companyName = section?.companyName || '';

        // For consultancy, require company name
        if (formData.employerCategory === 'consultancy' && !companyName.trim()) {
            alert('Please enter the company name before uploading the authorization letter.');
            return;
        }

        // Validate documents: <=5MB, allow images (jpg/png/jpeg) and PDF
        const maxBytes = 5 * 1024 * 1024;
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (file.size > maxBytes) {
            alert('Document is too large. Max size is 5MB.');
            return;
        }
        if (!allowed.includes(file.type)) {
            alert('Invalid document type. Allowed: JPEG, PNG, PDF.');
            return;
        }

        const body = new FormData();
        body.append('document', file);
        if (companyName) {
            body.append('companyName', companyName);
        }
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                alert('Please login again to upload files.');
                return;
            }
            const response = await fetch('http://localhost:5000/api/employer/profile/authorization-letter', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: body
            });
            const data = await response.json();
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    authorizationLetters: data.profile.authorizationLetters || []
                }));
                alert('Authorization letter uploaded successfully!');
                // Clear the file input
                e.target.value = '';
            } else {
                alert(data.message || 'Document upload failed');
            }
        } catch (error) {
            
            alert('Document upload failed. Please try again.');
        }
    };

    const handleDeleteAuthorizationLetter = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this authorization letter?')) {
            return;
        }

        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                alert('Please login again to delete files.');
                return;
            }
            const response = await fetch(`http://localhost:5000/api/employer/profile/authorization-letter/${documentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    authorizationLetters: data.profile.authorizationLetters || []
                }));
                alert('Authorization letter deleted successfully!');
            } else {
                alert(data.message || 'Failed to delete document');
            }
        } catch (error) {
            
            alert('Failed to delete document. Please try again.');
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const currentCount = formData.gallery?.length || 0;
        if (currentCount + files.length > 10) {
            alert(`You can only upload ${10 - currentCount} more images. Maximum 10 images allowed.`);
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                alert(`Invalid file type: ${file.name}. Only JPG, PNG, and SVG are allowed.`);
                return;
            }
            if (file.size > maxSize) {
                alert(`File too large: ${file.name}. Maximum size is 2MB.`);
                return;
            }
        }

        const formDataObj = new FormData();
        files.forEach(file => formDataObj.append('gallery', file));

        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                alert('Please login again to upload files.');
                return;
            }
            const response = await fetch('http://localhost:5000/api/employer/profile/gallery', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataObj
            });
            const data = await response.json();
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    gallery: data.gallery || []
                }));
                alert('Gallery images uploaded successfully!');
                e.target.value = '';
            } else {
                alert(data.message || 'Gallery upload failed');
            }
        } catch (error) {
            
            alert('Gallery upload failed. Please try again.');
        }
    };

    const handleDeleteGalleryImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                alert('Please login again to delete files.');
                return;
            }
            const response = await fetch(`http://localhost:5000/api/employer/profile/gallery/${imageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    gallery: data.gallery || []
                }));
                alert('Gallery image deleted successfully!');
            } else {
                alert(data.message || 'Failed to delete image');
            }
        } catch (error) {
            
            alert('Failed to delete image. Please try again.');
        }
    };

    const addNewAuthSection = () => {
        const newId = Math.max(...authSections.map(s => s.id)) + 1;
        setAuthSections(prev => [...prev, { id: newId, companyName: '' }]);
    };

    const handleAuthSectionCompanyNameChange = (sectionId, companyName) => {
        setAuthSections(prev => prev.map(section => 
            section.id === sectionId ? { ...section, companyName } : section
        ));
    };

    const removeAuthSection = (id) => {
        if (authSections.length > 1) {
            setAuthSections(prev => prev.filter(section => section.id !== id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!validateForm()) {
            setLoading(false);
            // Scroll to first error
            const firstErrorField = document.querySelector('.is-invalid');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('employerToken');
            
            // Update authorization letters with current company names from authSections
            if (formData.authorizationLetters && formData.authorizationLetters.length > 0) {
                const updatedAuthLetters = formData.authorizationLetters.map((letter, index) => {
                    const correspondingSection = authSections[index];
                    return {
                        ...letter,
                        companyName: correspondingSection?.companyName || letter.companyName || ''
                    };
                });
                
                // Update authorization letters with company names
                await fetch('http://localhost:5000/api/employer/profile/update-authorization-companies', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ authorizationLetters: updatedAuthLetters })
                });
            }
            
            // Create a copy of formData excluding large Base64 files to prevent request size issues
            const profileData = { ...formData };

            // Handle custom team size
            if (formData.teamSize === 'custom' && formData.customTeamSize) {
                profileData.teamSize = formData.customTeamSize;
            }

            // Combine country codes with phone numbers
            profileData.phone = formData.phoneCountryCode + formData.phone;
            profileData.officialMobile = formData.officialMobileCountryCode + formData.officialMobile;
            profileData.contactMobile = formData.contactMobileCountryCode + formData.contactMobile;
            profileData.alternateContact = formData.alternateContactCountryCode + formData.alternateContact;

            // Explicitly ensure whyJoinUs and googleMapsEmbed are included
            profileData.whyJoinUs = formData.whyJoinUs || '';
            profileData.googleMapsEmbed = formData.googleMapsEmbed || '';

            // Remove Base64 encoded files and UI-only fields from the request (these are uploaded separately)
            delete profileData.logo;
            delete profileData.coverImage;
            delete profileData.panCardImage;
            delete profileData.cinImage;
            delete profileData.gstImage;
            delete profileData.certificateOfIncorporation;
            delete profileData.companyIdCardPicture;
            delete profileData.authorizationLetters;
            delete profileData.gallery;
            delete profileData.customTeamSize; // Remove UI-only field
            
            // Log the data being sent (for debugging)
            console.log('Sending profile data:', {
                whyJoinUs: profileData.whyJoinUs?.substring(0, 50),
                googleMapsEmbed: profileData.googleMapsEmbed?.substring(0, 50),
                whyJoinUsLength: profileData.whyJoinUs?.length,
                googleMapsEmbedLength: profileData.googleMapsEmbed?.length,
                companyName: profileData.companyName,
                description: profileData.description?.substring(0, 50)
            });
            console.log('Full whyJoinUs:', profileData.whyJoinUs);
            console.log('Full googleMapsEmbed:', profileData.googleMapsEmbed);
            console.log('All profile data keys:', Object.keys(profileData));
            
            const response = await fetch('http://localhost:5000/api/employer/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const responseData = await response.json();
                let successMessage = 'Profile updated successfully!';
                
                // Check if whyJoinUs and googleMapsEmbed were saved
                if (profileData.whyJoinUs || profileData.googleMapsEmbed) {
                    successMessage += '\n\nGoogle Maps and Why Join Us sections have been saved.';
                }
                
                alert(successMessage);
                // Refresh profile data to get latest state
                fetchProfile();
            } else {
                const error = await response.json();
                if (response.status === 413) {
                    alert('Request too large. Please ensure all files are uploaded individually before saving the profile.');
                } else {
                    alert(error.message || 'Failed to update profile');
                }
            }
        } catch (error) {
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                alert('Network error or request too large. Please check your connection and ensure all files are uploaded individually.');
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="emp-company-profile orange-icons">
            <div style={{ padding: '2rem 2rem 0 2rem' }}>
            <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                <h2>Company Details</h2>
                
                <div className="alert alert-info mt-3" style={{fontSize: '14px'}}>
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Tip:</strong> Upload all files (logo, documents, etc.) individually first, then click "Save Profile" to save your text information.
                </div>
            </div>
            </div>

            {/*Logo and Cover image*/}
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0"><ImageIcon size={18} className="me-2" /> Logo and Cover image</h4>
                </div>
                
                <div className="panel-body wt-panel-body p-a20 p-b0 m-b30">
                    <div className="row">
                        <div className="col-lg-6 col-md-12">
                            <div className="form-group">
                                <label><ImageIcon size={16} className="me-2" /> Company Logo</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleLogoUpload}
                                />
                                {formData.logo && (
                                    <div className="mt-2">
                                        <img 
                                            src={formData.logo} 
                                            alt="Logo" 
                                            style={{maxWidth: '150px', maxHeight: '150px', objectFit: 'contain', border: '1px solid #ddd'}} 
                                            onError={(e) => {
                                                 
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <p className="text-muted text-success">✓ Logo uploaded successfully</p>
                                    </div>
                                )}
                                <p className="text-muted mt-2">
                                    <b>Company Logo:</b> Max file size is 1MB, Minimum dimension: 136 x 136. Suitable files are .jpg & .png
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12">
                            <div className="form-group">
                                <label><ImageIcon size={16} className="me-2" /> Background Banner Image</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleCoverUpload}
                                />
                                {formData.coverImage && (
                                    <div className="mt-2">
                                        <img 
                                            src={formData.coverImage} 
                                            alt="Cover" 
                                            style={{width: '100%', maxWidth: '400px', height: 'auto', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px'}} 
                                            onError={(e) => {
                                                 
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <p className="text-muted text-success">✓ Cover image uploaded successfully</p>
                                    </div>
                                )}
                                <p className="text-muted mt-2">
                                    <b>Background Banner Image:</b> Max file size is 2MB. Any image size is supported. Suitable files are .jpg & .png
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/*Basic Information*/}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><Briefcase size={18} className="me-2" /> Basic Informations</h4>
                    </div>

                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label>Employer Category</label>
                                    <div className="form-control" style={{backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', color: '#495057'}}>
                                        {formData.employerCategory ? 
                                            (formData.employerCategory === 'company' ? 'Company' : 'Consultancy') 
                                            : 'Not specified'
                                        }
                                    </div>
                                    <small className="text-muted">This field cannot be edited after registration</small>
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label className="required-field"><Building size={16} className="me-2" /> Company Name</label>
                                    <input
                                        className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        placeholder="Enter company name"
                                    />
                                    {errors.companyName && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.companyName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label className="required-field"><Phone size={16} className="me-2" /> Phone</label>
                                    <div className="input-group">
                                        <CountryCodeSelector
                                            value={formData.phoneCountryCode}
                                            onChange={(value) => handleInputChange('phoneCountryCode', value)}
                                        />
                                        <input
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="9087654321"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.phone}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label className="required-field"><Mail size={16} className="me-2" /> Email Address</label>
                                    <input
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="company@example.com"
                                    />
                                    {errors.email && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label><Globe size={16} className="me-2" /> Website</label>
                                    <input
                                        className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    {errors.website && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.website}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label><Calendar size={16} className="me-2" /> Est. Since</label>
                                    <input
                                        className={`form-control ${errors.establishedSince ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.establishedSince}
                                        onChange={(e) => handleInputChange('establishedSince', e.target.value)}
                                        placeholder="2020"
                                    />
                                    {errors.establishedSince && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.establishedSince}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label><UsersIcon size={16} className="me-2" /> Team Size</label>
                                    <select
                                        className="form-control"
                                        value={formData.teamSize}
                                        onChange={(e) => handleInputChange('teamSize', e.target.value)}
                                    >
                                        <option value="">Select team size</option>
                                        <option value="1-10">1-10 (Startup)</option>
                                        <option value="11-50">11-50 (Small)</option>
                                        <option value="51-200">51-200 (Medium)</option>
                                        <option value="201-500">201-500 (Large)</option>
                                        <option value="501-1000">501-1000 (Enterprise)</option>
                                        <option value="1000+">1000+ (Enterprise)</option>
                                        <option value="custom">Other (Enter manually)</option>
                                    </select>
                                    {formData.teamSize === 'custom' && (
                                        <input
                                            className="form-control mt-2"
                                            type="text"
                                            value={formData.customTeamSize || ''}
                                            onChange={(e) => handleInputChange('customTeamSize', e.target.value)}
                                            placeholder="Enter custom team size (e.g., 25, 150, 2500+)"
                                        />
                                    )}
                                </div>
                            </div>



                            <div className="col-md-12">
                                <div className="form-group">
                                    <label><FileText size={16} className="me-2" /> Description</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={formData.description || 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.'}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Company description..."
                                    />
                                    <small className="text-muted">A default description has been provided. You can edit it as needed.</small>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><MapPin size={16} className="me-2" /> Primary Office Location</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.location || 'Bangalore, India'}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="e.g., Bangalore, India"
                                    />
                                    <small className="text-muted">A default location has been provided. You can edit it as needed.</small>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><MapPin size={16} className="me-2" /> Google Maps Embed Code</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={formData.googleMapsEmbed || ''}
                                        onChange={(e) => handleInputChange('googleMapsEmbed', e.target.value)}
                                        placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
                                    />
                                    <small className="text-muted mt-1">Paste Google Maps embed iframe code here</small>
                                    
                                    {formData.googleMapsEmbed && (() => {
                                        const srcMatch = formData.googleMapsEmbed.match(/src=["']([^"']+)["']/);
                                        if (srcMatch) {
                                            return (
                                                <div className="mt-3">
                                                    <iframe
                                                        src={srcMatch[1]}
                                                        width="100%"
                                                        height="200"
                                                        style={{border: '1px solid #ddd', borderRadius: '4px'}}
                                                        allowFullScreen=""
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        title="Company Location Preview"
                                                    ></iframe>
                                                    <p className="text-success mt-2">✓ Map preview loaded successfully</p>
                                                </div>
                                            );
                                        }
                                        return <p className="text-warning mt-2">Invalid embed code format</p>;
                                    })()}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Briefcase size={16} className="me-2" /> Why Join Us</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={formData.whyJoinUs}
                                        onChange={(e) => handleInputChange('whyJoinUs', e.target.value)}
                                        placeholder="Highlight the benefits of working with your company..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Details */}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><IdCard size={18} className="me-2" /> Company Details</h4>
                    </div>

                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">


                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><MapPin size={16} className="me-2" /> Corporate Office Address</label>
                                    <input
                                        className={`form-control ${errors.corporateAddress ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.corporateAddress}
                                        onChange={(e) => handleInputChange('corporateAddress', e.target.value)}
                                        placeholder="Enter corporate address"
                                    />
                                    {errors.corporateAddress && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.corporateAddress}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><MapPin size={16} className="me-2" /> Branch Office Locations (if any)</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.branchLocations}
                                        onChange={(e) => handleInputChange('branchLocations', e.target.value)}
                                        placeholder="Enter branch locations"
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><MapPin size={16} className="me-2" /> Pincode</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                                        placeholder="Enter 6-digit pincode"
                                        maxLength="6"
                                    />
                                    {fetchingCity && <small className="text-info">Fetching city...</small>}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><MapPin size={16} className="me-2" /> City</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        placeholder="City (auto-filled from pincode)"
                                        readOnly
                                        style={{backgroundColor: '#f8f9fa'}}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Mail size={16} className="me-2" /> Official Email ID</label>
                                    <input
                                        className={`form-control ${errors.officialEmail ? 'is-invalid' : ''}`}
                                        type="email"
                                        value={formData.officialEmail}
                                        onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                                        placeholder="email@company.com"
                                    />
                                    {errors.officialEmail && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.officialEmail}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Phone size={16} className="me-2" /> Official Mobile Number</label>
                                    <div className="input-group">
                                        <CountryCodeSelector
                                            value={formData.officialMobileCountryCode}
                                            onChange={(value) => handleInputChange('officialMobileCountryCode', value)}
                                        />
                                        <input
                                            className={`form-control ${errors.officialMobile ? 'is-invalid' : ''}`}
                                            type="text"
                                            value={formData.officialMobile}
                                            onChange={(e) => handleInputChange('officialMobile', e.target.value)}
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    {errors.officialMobile && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.officialMobile}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Briefcase size={16} className="me-2" /> Type of Company / Business</label>
                                    <select 
                                        className="form-control"
                                        value={formData.companyType}
                                        onChange={(e) => handleInputChange('companyType', e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Private Limited">Private Limited</option>
                                        <option value="LLP">LLP</option>
                                        <option value="Proprietorship">Proprietorship</option>
                                        <option value="Government">Government</option>
                                        <option value="NGO">NGO</option>
                                        <option value="Startup">Startup</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Hash size={16} className="me-2" /> Corporate Identification Number (CIN)</label>
                                    <input
                                        className={`form-control ${errors.cin ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.cin}
                                        onChange={(e) => handleInputChange('cin', e.target.value)}
                                        placeholder="U12345AB1234ABC123456"
                                    />
                                    {errors.cin && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.cin}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Hash size={16} className="me-2" /> GST Number</label>
                                    <input
                                        className={`form-control ${errors.gstNumber ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.gstNumber}
                                        onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                                        placeholder="12ABCDE1234F1Z5"
                                    />
                                    {errors.gstNumber && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.gstNumber}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Briefcase size={16} className="me-2" /> Industry Sector</label>
                                    <select 
                                        className="form-control"
                                        value={formData.industrySector}
                                        onChange={(e) => handleInputChange('industrySector', e.target.value)}
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="it">IT</option>
                                        <option value="non-it">Non-IT</option>
                                        <option value="education">Education</option>
                                        <option value="finance">Finance</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Hash size={16} className="me-2" /> Company PAN Card Number</label>
                                    <input
                                        className={`form-control ${errors.panNumber ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.panNumber}
                                        onChange={(e) => handleInputChange('panNumber', e.target.value)}
                                        placeholder="ABCDE1234F"
                                    />
                                    {errors.panNumber && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.panNumber}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Upload size={16} className="me-2" /> Upload PAN Card Image</label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleDocumentUpload(e, 'panCardImage')}
                                    />
                                    {formData.panCardImage && (
                                        <p className="text-success mt-1">✓ PAN Card uploaded</p>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Upload size={16} className="me-2" /> Upload CIN Document</label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleDocumentUpload(e, 'cinImage')}
                                    />
                                    {formData.cinImage && (
                                        <p className="text-success mt-1">✓ CIN Document uploaded</p>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Upload size={16} className="me-2" /> Upload GST Certificate</label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleDocumentUpload(e, 'gstImage')}
                                    />
                                    {formData.gstImage && (
                                        <p className="text-success mt-1">✓ GST Certificate uploaded</p>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Upload size={16} className="me-2" /> Certificate of Incorporation (Issued by RoC)</label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleDocumentUpload(e, 'certificateOfIncorporation')}
                                    />
                                    {formData.certificateOfIncorporation && (
                                        <p className="text-success mt-1">✓ Certificate of Incorporation uploaded</p>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="mb-3"><FileText size={16} className="me-2" /> Authorization Letters (if registering on behalf of someone else)</label>
                                    
                                    <div className="row">
                                    {/* Dynamic Authorization Letter Sections */}
                                    {authSections.map((section, index) => (
                                        <div key={section.id} className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <label><Upload size={16} className="me-2" /> Authorization Letter #{index + 1}</label>
                                                    {authSections.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeAuthSection(section.id)}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {formData.employerCategory === 'consultancy' && (
                                                    <div className="mb-2">
                                                        <label><Building size={14} className="me-1" /> Authorization Company Name</label>
                                                        <input
                                                            className="form-control"
                                                            type="text"
                                                            value={section.companyName}
                                                            onChange={(e) => handleAuthSectionCompanyNameChange(section.id, e.target.value)}
                                                            placeholder="Enter authorization company name"
                                                        />
                                                    </div>
                                                )}
                                                
                                                <input
                                                    className="form-control"
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={(e) => handleAuthorizationLetterUpload(e, section.id)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    
                                    </div>
                                    
                                    {formData.employerCategory === 'consultancy' && (
                                        <div className="mt-2">
                                            <button 
                                                type="button" 
                                                className="btn btn-sm"
                                                style={{backgroundColor: '#ffb366', color: 'white', border: 'none'}}
                                                onClick={addNewAuthSection}
                                            >
                                                <i className="fas fa-plus me-1"></i> Add New Authorization Letter
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* Display uploaded authorization letters */}
                                    {formData.authorizationLetters && formData.authorizationLetters.length > 0 && (
                                        <div className="uploaded-documents mt-4">
                                            <h6 className="text-success">
                                                <i className="fas fa-check-circle me-2"></i>
                                                Uploaded Authorization Letters
                                            </h6>
                                            <div className="row">
                                                {formData.authorizationLetters.map((doc, index) => (
                                                    <div key={doc._id || index} className="col-md-6 mb-2">
                                                        <div className="document-card p-3 border rounded shadow-sm" style={{backgroundColor: '#fff'}}>
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <i className="fas fa-file-alt text-primary me-2"></i>
                                                                        <span className="fw-bold">{doc.fileName}</span>
                                                                    </div>
                                                                    {doc.companyName && (
                                                                        <div className="mb-1">
                                                                            <small className="text-info">
                                                                                <i className="fas fa-building me-1"></i>
                                                                                {doc.companyName}
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                    <small className="text-muted">
                                                                        <i className="fas fa-calendar me-1"></i>
                                                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                                                    </small>
                                                                </div>
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => handleDeleteAuthorizationLetter(doc._id)}
                                                                    title="Delete document"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Agree to Terms & Conditions</label>
                                    <div>
                                        <label className="m-r10">
                                            <input 
                                                type="radio" 
                                                name="terms" 
                                                value="yes"
                                                checked={formData.agreeTerms === 'yes'}
                                                onChange={(e) => handleInputChange('agreeTerms', e.target.value)}
                                            /> Yes
                                        </label>
                                        <label>
                                            <input 
                                                type="radio" 
                                                name="terms" 
                                                value="no"
                                                checked={formData.agreeTerms === 'no'}
                                                onChange={(e) => handleInputChange('agreeTerms', e.target.value)}
                                            /> No
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Contact Person */}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><UserIcon size={18} className="me-2" /> Primary Contact Person</h4>
                    </div>
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><UserIcon size={16} className="me-2" /> First Name</label>
                                    <input
                                        className={`form-control ${errors.contactFullName ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.contactFullName}
                                        onChange={(e) => handleInputChange('contactFullName', e.target.value)}
                                        placeholder="Enter Full Name"
                                    />
                                    {errors.contactFullName && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.contactFullName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label><UserIcon size={16} className="me-2" /> Middle Name</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.contactMiddleName}
                                        onChange={(e) => handleInputChange('contactMiddleName', e.target.value)}
                                        placeholder="Enter Middle Name (Optional)"
                                    />
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><UserIcon size={16} className="me-2" /> Last Name</label>
                                    <input
                                        className={`form-control ${errors.contactLastName ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.contactLastName}
                                        onChange={(e) => handleInputChange('contactLastName', e.target.value)}
                                        placeholder="Enter Last Name"
                                    />
                                    {errors.contactLastName && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.contactLastName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Briefcase size={16} className="me-2" /> Designation</label>
                                    <input
                                        className={`form-control ${errors.contactDesignation ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.contactDesignation}
                                        onChange={(e) => handleInputChange('contactDesignation', e.target.value)}
                                        placeholder="e.g., HR Manager, Recruitment Lead, Founder"
                                    />
                                    {errors.contactDesignation && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.contactDesignation}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Mail size={16} className="me-2" /> Official Email ID</label>
                                    <input
                                        className={`form-control ${errors.contactOfficialEmail ? 'is-invalid' : ''}`}
                                        type="email"
                                        value={formData.contactOfficialEmail}
                                        onChange={(e) => handleInputChange('contactOfficialEmail', e.target.value)}
                                        placeholder="Enter official email"
                                    />
                                    {errors.contactOfficialEmail && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.contactOfficialEmail}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Phone size={16} className="me-2" /> Mobile Number</label>
                                    <div className="input-group">
                                        <CountryCodeSelector
                                            value={formData.contactMobileCountryCode}
                                            onChange={(value) => handleInputChange('contactMobileCountryCode', value)}
                                        />
                                        <input
                                            className={`form-control ${errors.contactMobile ? 'is-invalid' : ''}`}
                                            type="tel"
                                            value={formData.contactMobile}
                                            onChange={(e) => handleInputChange('contactMobile', e.target.value)}
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    {errors.contactMobile && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.contactMobile}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label><IdCard size={16} className="me-2" /> Company ID Card Picture</label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleDocumentUpload(e, 'companyIdCardPicture')}
                                    />
                                    {formData.companyIdCardPicture && (
                                        <div className="mt-2">
                                            <img 
                                                src={formData.companyIdCardPicture.startsWith('data:') ? formData.companyIdCardPicture : `data:image/jpeg;base64,${formData.companyIdCardPicture}`} 
                                                alt="Company ID Card" 
                                                style={{maxWidth: '200px', maxHeight: '120px', objectFit: 'contain', border: '1px solid #ddd'}} 
                                                onError={(e) => {
                                                     
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            <p className="text-success mt-1">✓ Company ID Card uploaded</p>
                                        </div>
                                    )}
                                    <p className="text-muted mt-1">Upload any company identification document (Max 5MB)</p>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label><Phone size={16} className="me-2" /> Alternate Contact (Optional)</label>
                                    <div className="input-group">
                                        <CountryCodeSelector
                                            value={formData.alternateContactCountryCode}
                                            onChange={(value) => handleInputChange('alternateContactCountryCode', value)}
                                        />
                                        <input
                                            className={`form-control ${errors.alternateContact ? 'is-invalid' : ''}`}
                                            type="tel"
                                            value={formData.alternateContact}
                                            onChange={(e) => handleInputChange('alternateContact', e.target.value)}
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    {errors.alternateContact && (
                                        <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                            {errors.alternateContact}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><Images size={18} className="me-2" /> Company Gallery</h4>
                    </div>
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label><Upload size={16} className="me-2" /> Upload Gallery Images (Max 10 images)</label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.svg"
                                        multiple
                                        onChange={handleGalleryUpload}
                                        disabled={formData.gallery?.length >= 10}
                                    />
                                    <p className="text-muted mt-2">
                                        Upload up to 10 images (JPG, PNG, SVG). Max 2MB per image.
                                    </p>
                                </div>
                            </div>
                            
                            {formData.gallery && formData.gallery.length > 0 && (
                                <div className="col-md-12">
                                    <div className="gallery-preview mt-3">
                                        <h6 className="text-success mb-3">
                                            <i className="fas fa-images me-2"></i>
                                            Gallery Images ({formData.gallery.length}/10)
                                        </h6>
                                        <div className="d-flex flex-wrap gap-3">
                                            {formData.gallery.map((image, index) => (
                                                <div key={image._id || index} className="gallery-item position-relative" style={{width: '150px', height: '150px'}}>
                                                    <img 
                                                        src={image.url} 
                                                        alt={`Gallery ${index + 1}`}
                                                        className="img-fluid rounded"
                                                        style={{width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #ddd'}}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-danger btn-sm position-absolute"
                                                        style={{top: '5px', right: '5px', width: '25px', height: '25px', padding: '0', fontSize: '12px'}}
                                                        onClick={() => handleDeleteGalleryImage(image._id || index)}
                                                        title="Delete image"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-lg-12 col-md-12">
                                <div className="text-left">
                                    <button type="submit" className="site-button" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            </div>
        </div>
    );
}

export default EmpCompanyProfilePage;
