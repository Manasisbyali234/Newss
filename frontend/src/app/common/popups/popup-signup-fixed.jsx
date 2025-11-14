import React, { useState, useEffect } from 'react';

import CountryCodeSelector from '../../../components/CountryCodeSelector';

function SignUpPopup() {
    const [candidateData, setCandidateData] = useState({
        username: '',
        email: '',
        mobile: '',
        mobileCountryCode: '+91',
        password: '',
        confirmPassword: ''
    });
    
    const [employerData, setEmployerData] = useState({
        name: '',
        email: '',
        mobile: '',
        mobileCountryCode: '+91',
        password: '',
        confirmPassword: '',
        employerCategory: ''
    });
    
    const [placementData, setPlacementData] = useState({
        name: '',
        email: '',
        phone: '',
        phoneCountryCode: '+91',
        password: '',
        confirmPassword: '',
        collegeName: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showCandidatePassword, setShowCandidatePassword] = useState(false);
    const [showCandidateConfirmPassword, setShowCandidateConfirmPassword] = useState(false);
    const [showEmployerPassword, setShowEmployerPassword] = useState(false);
    const [showEmployerConfirmPassword, setShowEmployerConfirmPassword] = useState(false);
    const [showPlacementPassword, setShowPlacementPassword] = useState(false);
    const [showPlacementConfirmPassword, setShowPlacementConfirmPassword] = useState(false);

    useEffect(() => {
        setCandidateData({ username: '', email: '', mobile: '', mobileCountryCode: '+91', password: '', confirmPassword: '' });
        setEmployerData({ name: '', email: '', mobile: '', mobileCountryCode: '+91', password: '', confirmPassword: '', employerCategory: '' });
        setPlacementData({ name: '', email: '', phone: '', phoneCountryCode: '+91', password: '', confirmPassword: '', collegeName: '' });
    }, []);

    const handleCandidateChange = (e) => {
        const { name, value } = e.target;
        setCandidateData({ ...candidateData, [name]: value });
        
        if (name === 'confirmPassword' || name === 'password') {
            const password = name === 'password' ? value : candidateData.password;
            const confirmPassword = name === 'confirmPassword' ? value : candidateData.confirmPassword;
            
            if (confirmPassword && password !== confirmPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleEmployerChange = (e) => {
        const { name, value } = e.target;
        setEmployerData({ ...employerData, [name]: value });
        
        if (name === 'confirmPassword' || name === 'password') {
            const password = name === 'password' ? value : employerData.password;
            const confirmPassword = name === 'confirmPassword' ? value : employerData.confirmPassword;
            
            if (confirmPassword && password !== confirmPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        }
    };

    const handlePlacementChange = (e) => {
        const { name, value } = e.target;
        setPlacementData({ ...placementData, [name]: value });
        
        if (name === 'confirmPassword' || name === 'password') {
            const password = name === 'password' ? value : placementData.password;
            const confirmPassword = name === 'confirmPassword' ? value : placementData.confirmPassword;
            
            if (confirmPassword && password !== confirmPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleCandidateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            const response = await fetch('http://localhost:5000/api/candidate/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: candidateData.username,
                    email: candidateData.email,
                    phone: candidateData.mobileCountryCode + candidateData.mobile
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setCandidateData({ username: '', email: '', mobile: '', mobileCountryCode: '+91', password: '', confirmPassword: '' });
                setSuccessMessage(data.message || 'Registration successful! Please check your email to create your password.');
                setTimeout(() => {
                    const signupModal = window.bootstrap.Modal.getInstance(document.getElementById('sign_up_popup'));
                    if (signupModal) signupModal.hide();
                    setSuccessMessage('');
                }, 1500);
            } else {
                // Display validation errors if available
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    setError(errorMessages);
                } else {
                    setError(data.message || 'Registration failed');
                }
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
            
        } finally {
            setLoading(false);
        }
    };

    const handleEmployerSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            const response = await fetch('http://localhost:5000/api/employer/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: employerData.name,
                    email: employerData.email,
                    phone: employerData.mobileCountryCode + employerData.mobile,
                    companyName: employerData.name,
                    employerCategory: employerData.employerCategory,
                    employerType: employerData.employerCategory === 'consultancy' ? 'consultant' : 'company'
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setEmployerData({ name: '', email: '', mobile: '', mobileCountryCode: '+91', password: '', confirmPassword: '', employerCategory: '' });
                setSuccessMessage(data.message || 'Registration successful! Please check your email to create your password.');
                setTimeout(() => {
                    const signupModal = window.bootstrap.Modal.getInstance(document.getElementById('sign_up_popup'));
                    if (signupModal) signupModal.hide();
                    setSuccessMessage('');
                }, 1500);
            } else {
                // Display validation errors if available
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    setError(errorMessages);
                } else {
                    setError(data.message || 'Registration failed');
                }
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
            
        } finally {
            setLoading(false);
        }
    };

    const handlePlacementSubmit = async (e) => {
        e.preventDefault();
        if (placementData.password !== placementData.confirmPassword) {
            setError('Passwords do not match');
            setSuccessMessage('');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            const response = await fetch('http://localhost:5000/api/placement/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: placementData.name,
                    email: placementData.email,
                    phone: placementData.phoneCountryCode + placementData.phone,
                    password: placementData.password,
                    confirmPassword: placementData.confirmPassword,
                    collegeName: placementData.collegeName
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setPlacementData({ name: '', email: '', phone: '', phoneCountryCode: '+91', password: '', confirmPassword: '', collegeName: '' });
                setSuccessMessage(data.message || 'Registration successful! Please check your email to create your password.');
                setTimeout(() => {
                    const signupModal = window.bootstrap.Modal.getInstance(document.getElementById('sign_up_popup'));
                    if (signupModal) signupModal.hide();
                    setSuccessMessage('');
                    setTimeout(() => {
                        const loginModalElement = document.getElementById('sign_up_popup2');
                        if (loginModalElement) {
                            const loginModal = new window.bootstrap.Modal(loginModalElement);
                            loginModal.show();
                        }
                    }, 300);
                }, 1500);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
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
					<div className="modal-dialog modal-dialog-centered" style={{
						maxHeight: '90vh',
						overflowY: 'auto'
					}}>
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
						{successMessage && (
							<div className="alert alert-success mb-3">{successMessage}</div>
						)}
								<div className="twm-tabs-style-2">
									<ul className="nav nav-tabs" id="myTab" role="tablist">
										<li className="nav-item" role="presentation">
											<button
												className="nav-link active"
												data-bs-toggle="tab"
												data-bs-target="#sign-candidate"
												type="button"
												style={{color: '#ffffff'}} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}
											>
												<i className="fas fa-user-tie" style={{color: '#ffffff'}} />
												Candidate
											</button>
										</li>

										<li className="nav-item" role="presentation">
											<button
												className="nav-link"
												data-bs-toggle="tab"
												data-bs-target="#sign-Employer"
												type="button"
												style={{color: '#ffffff'}} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}
											>
												<i className="fas fa-building" style={{color: '#ffffff'}} />
												Employer
											</button>
										</li>

										<li className="nav-item" role="presentation">
											<button
												className="nav-link"
												data-bs-toggle="tab"
												data-bs-target="#sign-Placement"
												type="button"
												style={{color: '#ffffff'}} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}
											>
												<i className="fas fa-graduation-cap" style={{color: '#ffffff'}} />
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
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="username"
															type="text"
															className="form-control"
															placeholder="Name*"
															value={candidateData.username}
															autoComplete="new-password"
															onChange={handleCandidateChange}
															required
														/>
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className="form-control"
															placeholder="Email*"
															value={candidateData.email}
															autoComplete="new-password"
															onChange={handleCandidateChange}
															required
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className="input-group">
															<CountryCodeSelector
																value={candidateData.mobileCountryCode}
																onChange={(value) => handleCandidateChange({ target: { name: 'mobileCountryCode', value } })}
															/>
															<input
																name="mobile"
																type="tel"
																className="form-control"
																placeholder="Mobile No.*"
																value={candidateData.mobile}
																onChange={handleCandidateChange}
																required
																style={{ borderRadius: '0 0.375rem 0.375rem 0' }}
															/>
														</div>
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
																<a href="#">Terms and conditions</a>
															</label>
															<p>
																Already registered?
																<button
																	type="button"
																	className="twm-backto-login"
																	data-bs-target="#sign_up_popup2"
																	data-bs-toggle="modal"
																	data-bs-dismiss="modal"
																	style={{width: '80px', maxWidth: '80px', padding: '5px 10px'}}
																>
																	Sign in
																</button>
															</p>
														</div>
													</div>
												</div>
												<div className="col-md-12">
													<button type="submit" className="site-button" disabled={loading || passwordError} style={{width: '120px', maxWidth: '120px'}}>
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
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<select
															name="employerCategory"
															className="form-control"
															value={employerData.employerCategory}
															onChange={handleEmployerChange}
															required
														>
															<option value="">Select Category*</option>
															<option value="company">Company</option>
															<option value="consultancy">Consultancy</option>
														</select>
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="name"
															type="text"
															className="form-control"
															placeholder="Company Name*"
															value={employerData.name}
															autoComplete="new-password"
															onChange={handleEmployerChange}
															required
														/>
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className="form-control"
															placeholder="Email*"
															value={employerData.email}
															autoComplete="new-password"
															onChange={handleEmployerChange}
															required
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className="input-group">
															<CountryCodeSelector
																value={employerData.mobileCountryCode}
																onChange={(value) => handleEmployerChange({ target: { name: 'mobileCountryCode', value } })}
															/>
															<input
																name="mobile"
																type="tel"
																className="form-control"
																placeholder="Mobile No.*"
																value={employerData.mobile}
																onChange={handleEmployerChange}
																required
															/>
														</div>
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
																<a href="#">Terms and conditions</a>
															</label>
															<p>
																Already registered?
																<button
																	type="button"
																	className="twm-backto-login"
																	data-bs-target="#sign_up_popup2"
																	data-bs-toggle="modal"
																	data-bs-dismiss="modal"
																	style={{width: '80px', maxWidth: '80px', padding: '5px 10px'}}
																>
																	Sign in
																</button>
															</p>
														</div>
													</div>
												</div>

												<div className="col-md-12">
													<button type="submit" className="site-button" disabled={loading || passwordError} style={{width: '120px', maxWidth: '120px'}}>
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
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="name"
															type="text"
															className="form-control"
															placeholder="Name*"
															value={placementData.name}
															autoComplete="new-password"
															onChange={handlePlacementChange}
															required
														/>
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className="form-control"
															placeholder="Email*"
															value={placementData.email}
															autoComplete="new-password"
															onChange={handlePlacementChange}
															required
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className="input-group">
															<CountryCodeSelector
																value={placementData.phoneCountryCode}
																onChange={(value) => handlePlacementChange({ target: { name: 'phoneCountryCode', value } })}
															/>
															<input
																name="phone"
																type="tel"
																className="form-control"
																placeholder="Phone Number*"
																value={placementData.phone}
																onChange={handlePlacementChange}
																required
																style={{height: '38px'}}
															/>
														</div>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="collegeName"
															type="text"
															className="form-control"
															placeholder="College Name*"
															value={placementData.collegeName}
															onChange={handlePlacementChange}
															required
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3 position-relative">
														<input
															name="password"
															type={showPlacementPassword ? "text" : "password"}
															className="form-control"
															placeholder="Password*"
															value={placementData.password}
															autoComplete="new-password"
															onChange={handlePlacementChange}
															required
														/>
														<button
															type="button"
															className="btn position-absolute password-eye-icon"
															style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
															onClick={() => setShowPlacementPassword(!showPlacementPassword)}
														>
															<i className={showPlacementPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ color: '#fd7e14', pointerEvents: 'none' }} />
														</button>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3 position-relative">
														<input
															name="confirmPassword"
															type={showPlacementConfirmPassword ? "text" : "password"}
															className="form-control"
															placeholder="Confirm Password*"
															value={placementData.confirmPassword}
															autoComplete="new-password"
															onChange={handlePlacementChange}
															required
														/>
														<button
															type="button"
															className="btn position-absolute password-eye-icon"
															style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
															onClick={() => setShowPlacementConfirmPassword(!showPlacementConfirmPassword)}
														>
															<i className={showPlacementConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ color: '#fd7e14', pointerEvents: 'none' }} />
														</button>
														{passwordError && <small className="text-danger">{passwordError}</small>}
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
																<a href="#">Terms and conditions</a>
															</label>
															<p>
																Already registered?
																<button
																	type="button"
																	className="twm-backto-login"
																	data-bs-target="#sign_up_popup2"
																	data-bs-toggle="modal"
																	data-bs-dismiss="modal"
																	style={{width: '80px', maxWidth: '80px', padding: '5px 10px'}}
																>
																	Sign in
																</button>
															</p>
														</div>
													</div>
												</div>

												<div className="col-md-12">
													<button type="submit" className="site-button" disabled={loading || passwordError} style={{width: '120px', maxWidth: '120px'}}>
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