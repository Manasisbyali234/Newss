import React, { useState, useEffect } from 'react';
import { pubRoute, publicUser } from '../../../globals/route-names';

function SignUpPopup() {
    const [candidateData, setCandidateData] = useState({
        username: '',
        email: '',
        mobile: ''
    });
    
    const [employerData, setEmployerData] = useState({
        name: '',
        email: '',
        mobile: '',
        employerCategory: ''
    });
    
    const [placementData, setPlacementData] = useState({
        name: '',
        email: '',
        phone: '',
        collegeName: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        setCandidateData({ username: '', email: '', mobile: '' });
        setEmployerData({ name: '', email: '', mobile: '', employerCategory: '' });
        setPlacementData({ name: '', email: '', phone: '', collegeName: '' });
        setFieldErrors({});
        setError('');
        setSuccess('');
    }, []);

    // Validation functions
    const validateField = (field, value, formType) => {
        const errors = { ...fieldErrors };

        switch (field) {
            case 'username':
            case 'name':
                if (!value || !value.trim()) {
                    errors[field] = 'Name is required';
                } else if (value.trim().length < 2) {
                    errors[field] = 'Name must be at least 2 characters long';
                } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                    errors[field] = 'Name can only contain letters and spaces';
                } else {
                    delete errors[field];
                }
                break;

            case 'email':
                if (!value || !value.trim()) {
                    errors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    errors.email = 'Please enter a valid email address';
                } else {
                    delete errors.email;
                }
                break;

            case 'mobile':
            case 'phone':
                if (!value || !value.trim()) {
                    errors[field] = 'Phone number is required';
                } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
                    errors[field] = 'Please enter a valid 10-digit mobile number starting with 6-9';
                } else {
                    delete errors[field];
                }
                break;



            case 'employerCategory':
                if (!value) {
                    errors.employerCategory = 'Please select an employer category';
                } else {
                    delete errors.employerCategory;
                }
                break;

            case 'collegeName':
                if (!value || !value.trim()) {
                    errors.collegeName = 'College name is required';
                } else if (value.trim().length < 3) {
                    errors.collegeName = 'College name must be at least 3 characters long';
                } else {
                    delete errors.collegeName;
                }
                break;

            default:
                break;
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateForm = (formData, formType) => {
        const errors = {};

        // Validate all required fields
        Object.keys(formData).forEach(field => {
            if (formData[field] !== undefined) {
                validateField(field, formData[field], formType);
            }
        });

        return Object.keys(fieldErrors).length === 0;
    };

    const handleCandidateChange = (e) => {
        const { name, value } = e.target;
        setCandidateData({ ...candidateData, [name]: value });

        // Validate the field
        validateField(name, value, 'candidate');


    };

    const handleEmployerChange = (e) => {
        const { name, value } = e.target;
        setEmployerData({ ...employerData, [name]: value });
        validateField(name, value, 'employer');
    };

    const handlePlacementChange = (e) => {
        const { name, value } = e.target;
        setPlacementData({ ...placementData, [name]: value });
        validateField(name, value, 'placement');
    };

    const handleCandidateSubmit = async (e) => {
        e.preventDefault();

        const isFormValid = validateForm(candidateData, 'candidate');

        if (!isFormValid || Object.keys(fieldErrors).length > 0) {
            setError('Please correct the errors below and try again.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/api/candidate/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: candidateData.username,
                    email: candidateData.email,
                    phone: candidateData.mobile,
                    sendWelcomeEmail: true
                })
            });
            
            const data = await response.json();

            if (response.ok && data.success) {
                setCandidateData({ username: '', email: '', mobile: '' });
                setFieldErrors({});
                setError('');
                setSuccess('Registration successful! Please check your email to create your password.');
            } else {
                if (data.message && data.message.includes('email')) {
                    setError('This email address is already registered. Please try logging in instead.');
                } else {
                    setError(data.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployerSubmit = async (e) => {
        e.preventDefault();

        const isFormValid = validateForm(employerData, 'employer');

        if (!isFormValid || Object.keys(fieldErrors).length > 0) {
            setError('Please correct the errors below and try again.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/api/employer/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: employerData.name,
                    email: employerData.email,
                    phone: employerData.mobile,
                    companyName: employerData.name,
                    employerCategory: employerData.employerCategory,
                    employerType: employerData.employerCategory === 'consultancy' ? 'consultant' : 'company',
                    sendWelcomeEmail: true
                })
            });
            
            const data = await response.json();

            if (response.ok && data.success) {
                setEmployerData({ name: '', email: '', mobile: '', employerCategory: '' });
                setFieldErrors({});
                setError('');
                setSuccess('Registration successful! Please check your email to create your password.');
            } else {
                if (data.message && data.message.includes('email')) {
                    setError('This email address is already registered. Please try logging in instead.');
                } else {
                    setError(data.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlacementSubmit = async (e) => {
        e.preventDefault();

        const isFormValid = validateForm(placementData, 'placement');

        if (!isFormValid || Object.keys(fieldErrors).length > 0) {
            setError('Please correct the errors below and try again.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/api/placement/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: placementData.name,
                    email: placementData.email,
                    phone: placementData.phone,
                    collegeName: placementData.collegeName,
                    sendWelcomeEmail: true
                })
            });
            
            const data = await response.json();

            if (response.ok && data.success) {
                setPlacementData({ name: '', email: '', phone: '', collegeName: '' });
                setFieldErrors({});
                setError('');
                setSuccess('Registration successful! Please check your email to create your password.');
            } else {
                if (data.message && data.message.includes('email')) {
                    setError('This email address is already registered. Please try logging in instead.');
                } else {
                    setError(data.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
			<>
				<div
					className="modal fade twm-sign-up"
					id="sign_up_popup"
					aria-hidden="true"
					aria-labelledby="sign_up_popupLabel"
					tabIndex={-1}
				>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h2 className="modal-title" id="sign_up_popupLabel">
									Sign Up
								</h2>
								<p>
									Sign Up and get access to all the features of TaleGlobal
								</p>
								<button
									type="button"
									className="btn-close"
									data-bs-dismiss="modal"
									aria-label="Close"
								/>
							</div>

							<div className="modal-body">
								<div className="twm-tabs-style-2">
									<ul className="nav nav-tabs" id="myTab" role="tablist">
										<li className="nav-item" role="presentation">
											<button
												className="nav-link active"
												data-bs-toggle="tab"
												data-bs-target="#sign-candidate"
												type="button"
											>
												<i className="fas fa-user-tie" />
												Candidate
											</button>
										</li>

										<li className="nav-item" role="presentation">
											<button
												className="nav-link"
												data-bs-toggle="tab"
												data-bs-target="#sign-Employer"
												type="button"
											>
												<i className="fas fa-building" />
												Employer
											</button>
										</li>

										<li className="nav-item" role="presentation">
											<button
												className="nav-link"
												data-bs-toggle="tab"
												data-bs-target="#sign-Placement"
												type="button"
											>
												<i className="fas fa-graduation-cap" />
												Placement Officer
											</button>
										</li>
									</ul>

									<div className="tab-content" id="myTabContent">
										<div
											className="tab-pane fade show active"
											id="sign-candidate"
										>
											<form onSubmit={handleCandidateSubmit}>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="username"
															type="text"
															className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
															placeholder="Name*"
															value={candidateData.username}
															autoComplete="new-password"
															onChange={handleCandidateChange}
															required
														/>
														{fieldErrors.username && (
															<div className="invalid-feedback d-block">{fieldErrors.username}</div>
														)}
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
															placeholder="Email*"
															value={candidateData.email}
															autoComplete="new-password"
															onChange={handleCandidateChange}
															required
														/>
														{fieldErrors.email && (
															<div className="invalid-feedback d-block">{fieldErrors.email}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="mobile"
															type="tel"
															className={`form-control ${fieldErrors.mobile ? 'is-invalid' : ''}`}
															placeholder="Mobile No.*"
															value={candidateData.mobile}
															onChange={handleCandidateChange}
															required
														/>
														{fieldErrors.mobile && (
															<div className="invalid-feedback d-block">{fieldErrors.mobile}</div>
														)}
													</div>
												</div>


												
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className=" form-check">
															<input
																type="checkbox"
																className="form-check-input"
																id="agree1"
																required
															/>
															<label
																className="form-check-label"
																htmlFor="agree1"
															>
																I agree to the{" "}
																<a href={pubRoute(publicUser.pages.TERMS)} target="_blank" rel="noopener noreferrer">Terms and conditions</a>
															</label>
															<p style={{marginTop: "10px"}}>
																Already registered? <a href="#sign_up_popup2" data-bs-target="#sign_up_popup2" data-bs-toggle="modal" data-bs-dismiss="modal" style={{textDecoration: "underline", cursor: "pointer", color: "#fd7e14"}}>Sign in</a>
															</p>
														</div>
													</div>
												</div>
												<div className="col-md-12">
													<button type="submit" style={{ width: "100%", maxWidth: "none", minWidth: "100%", padding: "12px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", minHeight: "48px", backgroundColor: "#fd7e14", color: "white", border: "none", cursor: "pointer", display: "block", boxSizing: "border-box", flex: "1 1 100%" }} disabled={loading}>
														{loading ? 'Signing Up...' : 'Sign Up'}
													</button>
												</div>
											</div>
											</form>
										</div>

										<div className="tab-pane fade" id="sign-Employer">
											<form onSubmit={handleEmployerSubmit}>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<select
															name="employerCategory"
															className={`form-control ${fieldErrors.employerCategory ? 'is-invalid' : ''}`}
															value={employerData.employerCategory}
															onChange={handleEmployerChange}
															required
														>
															<option value="">Select Category*</option>
															<option value="company">Company</option>
															<option value="consultancy">Consultancy</option>
														</select>
														{fieldErrors.employerCategory && (
															<div className="invalid-feedback d-block">{fieldErrors.employerCategory}</div>
														)}
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="name"
															type="text"
															className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
															placeholder="Company Name*"
															value={employerData.name}
															autoComplete="new-password"
															onChange={handleEmployerChange}
															required
														/>
														{fieldErrors.name && (
															<div className="invalid-feedback d-block">{fieldErrors.name}</div>
														)}
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
															placeholder="Email*"
															value={employerData.email}
															autoComplete="new-password"
															onChange={handleEmployerChange}
															required
														/>
														{fieldErrors.email && (
															<div className="invalid-feedback d-block">{fieldErrors.email}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="mobile"
															type="tel"
															className={`form-control ${fieldErrors.mobile ? 'is-invalid' : ''}`}
															placeholder="Mobile No.*"
															value={employerData.mobile}
															onChange={handleEmployerChange}
															required
														/>
														{fieldErrors.mobile && (
															<div className="invalid-feedback d-block">{fieldErrors.mobile}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className=" form-check">
															<input
																type="checkbox"
																className="form-check-input"
																id="agree2"
																required
															/>
															<label
																className="form-check-label"
																htmlFor="agree2"
															>
																I agree to the{" "}
																<a href={pubRoute(publicUser.pages.TERMS)} target="_blank" rel="noopener noreferrer">Terms and conditions</a>
															</label>
															<p style={{marginTop: "10px"}}>
																Already registered? <a href="#sign_up_popup2" data-bs-target="#sign_up_popup2" data-bs-toggle="modal" data-bs-dismiss="modal" style={{textDecoration: "underline", cursor: "pointer", color: "#fd7e14"}}>Sign in</a>
															</p>
														</div>
													</div>
												</div>

												<div className="col-md-12">
													<button type="submit" style={{ width: "100%", maxWidth: "none", minWidth: "100%", padding: "12px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", minHeight: "48px", backgroundColor: "#fd7e14", color: "white", border: "none", cursor: "pointer", display: "block", boxSizing: "border-box", flex: "1 1 100%" }} disabled={loading}>
														{loading ? 'Signing Up...' : 'Sign Up'}
													</button>
												</div>
											</div>
											</form>
										</div>

										<div className="tab-pane fade" id="sign-Placement">
											<form onSubmit={handlePlacementSubmit}>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="name"
															type="text"
															className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
															placeholder="Name*"
															value={placementData.name}
															autoComplete="new-password"
															onChange={handlePlacementChange}
															required
														/>
														{fieldErrors.name && (
															<div className="invalid-feedback d-block">{fieldErrors.name}</div>
														)}
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
															placeholder="Email*"
															value={placementData.email}
															autoComplete="new-password"
															onChange={handlePlacementChange}
															required
														/>
														{fieldErrors.email && (
															<div className="invalid-feedback d-block">{fieldErrors.email}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="phone"
															type="tel"
															className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
															placeholder="Phone Number*"
															value={placementData.phone}
															onChange={handlePlacementChange}
															required
														/>
														{fieldErrors.phone && (
															<div className="invalid-feedback d-block">{fieldErrors.phone}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="collegeName"
															type="text"
															className={`form-control ${fieldErrors.collegeName ? 'is-invalid' : ''}`}
															placeholder="College Name*"
															value={placementData.collegeName}
															onChange={handlePlacementChange}
															required
														/>
														{fieldErrors.collegeName && (
															<div className="invalid-feedback d-block">{fieldErrors.collegeName}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className=" form-check">
															<input
																type="checkbox"
																className="form-check-input"
																id="agree3"
																required
															/>
															<label
																className="form-check-label"
																htmlFor="agree3"
															>
																I agree to the{" "}
																<a href={pubRoute(publicUser.pages.TERMS)} target="_blank" rel="noopener noreferrer">Terms and conditions</a>
															</label>
															<p style={{marginTop: "10px"}}>
																Already registered? <a href="#sign_up_popup2" data-bs-target="#sign_up_popup2" data-bs-toggle="modal" data-bs-dismiss="modal" style={{textDecoration: "underline", cursor: "pointer", color: "#fd7e14"}}>Sign in</a>
															</p>
														</div>
													</div>
												</div>

												<div className="col-md-12">
													<button type="submit" style={{ width: "100%", maxWidth: "none", minWidth: "100%", padding: "12px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", minHeight: "48px", backgroundColor: "#fd7e14", color: "white", border: "none", cursor: "pointer", display: "block", boxSizing: "border-box", flex: "1 1 100%" }} disabled={loading}>
														{loading ? 'Signing Up...' : 'Sign Up'}
													</button>
												</div>
											</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
}

export default SignUpPopup;
