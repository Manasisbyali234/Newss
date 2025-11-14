import { useState } from 'react';
import './support.css';
import CountryCodeSelector from '../../../../../components/CountryCodeSelector';

function SupportPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        phoneCountryCode: '+91',
        userType: 'guest',
        subject: '',
        category: 'general',
        priority: 'medium',
        message: ''
    });
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'technical', label: 'Technical Issue' },
        { value: 'billing', label: 'Billing & Payment' },
        { value: 'account', label: 'Account Management' },
        { value: 'job-posting', label: 'Job Posting' },
        { value: 'application', label: 'Job Application' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        
        // Validate file size (max 5MB per file)
        for (let file of files) {
            if (file.size > 5 * 1024 * 1024) {
                newErrors.files = 'Each file must be less than 5MB';
                break;
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 3) {
            setErrors(prev => ({ ...prev, files: 'Maximum 3 files allowed' }));
            return;
        }
        setFiles(selectedFiles);
        if (errors.files) {
            setErrors(prev => ({ ...prev, files: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'phone') {
                    submitData.append(key, `${formData.phoneCountryCode}${formData.phone.trim()}`);
                } else {
                    submitData.append(key, formData[key]);
                }
            });
            
            files.forEach(file => {
                submitData.append('attachments', file);
            });

            const response = await fetch('/api/public/support', {
                method: 'POST',
                body: submitData
            });
            
            if (response.ok) {
                setIsSubmitted(true);
                setFormData({
                    name: '', email: '', phone: '', phoneCountryCode: '+91', userType: 'guest',
                    subject: '', category: 'general', priority: 'medium', message: ''
                });
                setFiles([]);
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || 'Failed to submit support ticket' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="section-full twm-contact-one">
                <div className="section-content">
                    <div className="container">
                        <div className="contact-one-inner">
                            <div className="row justify-content-center">
                                <div className="col-lg-8 col-md-10">
                                    <div className="contact-form-outer text-center">
                                        <div className="section-head left wt-small-separator-outer">
                                            <h2 className="wt-title text-success">✓ Support Ticket Submitted!</h2>
                                            <p>Thank you for contacting our support team. We have received your ticket and will respond within 24 hours.</p>
                                            <button 
                                                onClick={() => setIsSubmitted(false)} 
                                                className="site-button mt-3"
                                            >
                                                Submit Another Ticket
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section-full twm-contact-one">
            <div className="section-content">
                <div className="container">
                    <div className="contact-one-inner">
                        <div className="row">
                            <div className="col-lg-8 col-md-12">
                                <div className="contact-form-outer">
                                    <div className="section-head left wt-small-separator-outer">
                                        <h2 className="wt-title">Get Support</h2>
                                        <p>Need help? Submit a support ticket and our team will assist you promptly.</p>
                                    </div>
                                    
                                    <form className="cons-contact-form" onSubmit={handleSubmit}>
                                        {errors.submit && (
                                            <div className="alert alert-danger mb-3">{errors.submit}</div>
                                        )}
                                        
                                        <div className="row">
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <input 
                                                        name="name" 
                                                        type="text" 
                                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                        placeholder="Full Name *" 
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <input 
                                                        name="email" 
                                                        type="email" 
                                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                        placeholder="Email Address *" 
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <div className="input-group">
                                                        <CountryCodeSelector
                                                            value={formData.phoneCountryCode}
                                                            onChange={(value) => {
                                                                setFormData(prev => ({ ...prev, phoneCountryCode: value }));
                                                            }}
                                                        />
                                                        <input
                                                            name="phone"
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Phone Number"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            maxLength="15"
                                                            style={{ borderRadius: '0 0.375rem 0.375rem 0' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <select 
                                                        name="userType" 
                                                        className="form-control"
                                                        value={formData.userType}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="guest">Guest User</option>
                                                        <option value="candidate">Job Seeker</option>
                                                        <option value="employer">Employer</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-12">
                                                <div className="form-group mb-3">
                                                    <input 
                                                        name="subject" 
                                                        type="text" 
                                                        className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                                        placeholder="Subject *" 
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <select 
                                                        name="category" 
                                                        className="form-control"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <select 
                                                        name="priority" 
                                                        className="form-control"
                                                        value={formData.priority}
                                                        onChange={handleChange}
                                                    >
                                                        {priorities.map(pri => (
                                                            <option key={pri.value} value={pri.value}>{pri.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-12">
                                                <div className="form-group mb-3">
                                                    <textarea 
                                                        name="message" 
                                                        className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                                        rows={4} 
                                                        placeholder="Describe your issue or question *" 
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-12">
                                                <div className="form-group mb-3">
                                                    <input 
                                                        type="file" 
                                                        className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                                                        multiple 
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                                        onChange={handleFileChange}
                                                    />
                                                    <small className="form-text text-muted">
                                                        Optional: Attach up to 3 files (max 5MB each). Supported: PDF, DOC, DOCX, JPG, PNG, TXT
                                                    </small>
                                                    {errors.files && <div className="invalid-feedback">{errors.files}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-12">
                                                <button 
                                                    type="submit" 
                                                    className="site-button"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            
                            <div className="col-lg-4 col-md-12">
                                <div className="contact-info-wrap">
                                    <div className="contact-info">
                                        <div className="contact-info-section">
                                            <div className="c-info-column">
                                                <div className="c-info-icon"><i className="fas fa-headset" /></div>
                                                <h3 className="twm-title">24/7 Support</h3>
                                                <p>Our support team is available round the clock to help you with any issues.</p>
                                            </div>
                                            
                                            <div className="c-info-column">
                                                <div className="c-info-icon"><i className="fas fa-clock" /></div>
                                                <h3 className="twm-title">Quick Response</h3>
                                                <p>We typically respond to support tickets within 24 hours.</p>
                                            </div>
                                            
                                            <div className="c-info-column">
                                                <div className="c-info-icon"><i className="fas fa-envelope" /></div>
                                                <h3 className="twm-title">Email Support</h3>
                                                <p><a href="mailto:support@jobzz.com">support@jobzz.com</a></p>
                                            </div>
                                            
                                            <div className="c-info-column">
                                                <div className="c-info-icon"><i className="fas fa-phone" /></div>
                                                <h3 className="twm-title">Phone Support</h3>
                                                <p><a href="tel:+919876543210">+91 9876543210</a></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SupportPage;
