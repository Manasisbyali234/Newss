import { NavLink, useNavigate } from "react-router-dom";
import { canRoute, candidate, empRoute, employer, placementRoute, placement, pubRoute, publicUser } from "../../../globals/route-names";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";

function SignInPopup() {

    const navigate = useNavigate();
    const { login } = useAuth();
    const [canusername, setCanUsername] = useState('');
    const [empusername, setEmpUsername] = useState('');
    const [placementusername, setPlacementUsername] = useState('');
    const [canpassword, setCanPassword] = useState('');
    const [emppassword, setEmpPassword] = useState('');
    const [placementpassword, setPlacementPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCanPassword, setShowCanPassword] = useState(false);
    const [showEmpPassword, setShowEmpPassword] = useState(false);
    const [showPlacementPassword, setShowPlacementPassword] = useState(false);

    useEffect(() => {
        setCanUsername('');
        setCanPassword('');
        setEmpUsername('');
        setEmpPassword('');
        setPlacementUsername('');
        setPlacementPassword('');
    }, []);

    const handleCandidateLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login({
            email: canusername.trim(),
            password: canpassword.trim()
        }, 'candidate');
        
        if (result.success) {
            moveToCandidate();
        } else {
            setError(result.message);
        }
        setLoading(false);
    }

    const handleEmployerLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login({
            email: empusername,
            password: emppassword
        }, 'employer');
        
        if (result.success) {
            moveToEmployer();
        } else {
            setError(result.message);
        }
        setLoading(false);
    }

    const moveToCandidate = () => {
        const modal = document.getElementById('sign_up_popup2');
        const bootstrapModal = window.bootstrap?.Modal?.getInstance(modal);
        bootstrapModal?.hide();
        navigate(canRoute(candidate.DASHBOARD));
    }

    const moveToEmployer = () => {
        const modal = document.getElementById('sign_up_popup2');
        const bootstrapModal = window.bootstrap?.Modal?.getInstance(modal);
        bootstrapModal?.hide();
        navigate(empRoute(employer.DASHBOARD));
    }

    const handlePlacementLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login({
            email: placementusername,
            password: placementpassword
        }, 'placement');
        
        if (result.success) {
            moveToPlacement();
        } else {
            setError(result.message);
        }
        setLoading(false);
    }

    const moveToPlacement = () => {
        const modal = document.getElementById('sign_up_popup2');
        const bootstrapModal = window.bootstrap?.Modal?.getInstance(modal);
        bootstrapModal?.hide();
        navigate(placementRoute(placement.DASHBOARD));
    }

    return (
			<>
				<div
					className="modal fade twm-sign-up"
					id="sign_up_popup2"
					aria-hidden="true"
					aria-labelledby="sign_up_popupLabel2"
					tabIndex={-1}
				>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h2 className="modal-title" id="sign_up_popupLabel2">
									Login
								</h2>
								<p>Login and get access to all the features of TaleGlobal</p>
								<button
									type="button"
									className="btn-close"
									data-bs-dismiss="modal"
									aria-label="Close"
								/>
							</div>

							<div className="modal-body">
								<div className="twm-tabs-style-2">
									<ul className="nav nav-tabs" id="myTab2" role="tablist">
										{/*Login Candidate*/}
										<li className="nav-item">
											<button
												className="nav-link active"
												data-bs-toggle="tab"
												data-bs-target="#login-candidate"
												type="button"
												style={{color: '#ffffff'}} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}
											>
												<i className="fas fa-user-tie" style={{color: '#ffffff'}} />
												Candidate
											</button>
										</li>

										{/*Login Employer*/}
										<li className="nav-item">
											<button
												className="nav-link"
												data-bs-toggle="tab"
												data-bs-target="#login-Employer"
												type="button"
												style={{color: '#ffffff'}} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}
											>
												<i className="fas fa-building" style={{color: '#ffffff'}} />
												Employer
											</button>
										</li>

										<li className="nav-item">
											<button
												className="nav-link"
												data-bs-toggle="tab"
												data-bs-target="#login-Placement"
												type="button"
												style={{color: '#ffffff'}} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}
											>
												<i className="fas fa-graduation-cap" style={{color: '#ffffff'}} />
												Placement Officer
											</button>
										</li>
									</ul>

									<div className="tab-content" id="myTab2Content">
										{/*Login Candidate Content*/}
										<form
											onSubmit={handleCandidateLogin}
											className="tab-pane fade show active"
											id="login-candidate"
										>
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
															required
															className="form-control"
															placeholder="Email*"
															value={canusername}
															autoComplete="new-password"
															onChange={(event) => {
																setCanUsername(event.target.value);
															}}
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3 position-relative">
														<input
															name="password"
															type={showCanPassword ? "text" : "password"}
															className="form-control"
															required
															placeholder="Password*"
															value={canpassword}
															autoComplete="new-password"
															onChange={(event) => {
																setCanPassword(event.target.value);
															}}
														/>
														<button
															type="button"
															className="btn position-absolute password-eye-icon"
															style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
															onClick={() => setShowCanPassword(!showCanPassword)}
														>
															<i className={showCanPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ color: '#fd7e14', pointerEvents: 'none' }} />
														</button>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className="text-end">
															<NavLink to={pubRoute(publicUser.pages.FORGOT)} onClick={() => navigate(pubRoute(publicUser.pages.FORGOT))}>Forgot Password</NavLink>
														</div>
													</div>
												</div>

												<div className="col-md-12">
													<button
														type="submit"
														className="site-button"
														style={{width: '120px', maxWidth: '120px'}}
													>
														Log in
													</button>

													<div className="mt-3 mb-3">
														Don't have an account ?
														<button
															className="twm-backto-login"
															data-bs-target="#sign_up_popup"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
															style={{width: '80px', maxWidth: '80px', padding: '5px 10px'}}
														>
															Sign Up
														</button>
													</div>
												</div>
											</div>
										</form>

										{/*Login Employer Content*/}
										<form
											onSubmit={handleEmployerLogin}
											className="tab-pane fade"
											id="login-Employer"
										>
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
															required
															className="form-control"
															placeholder="Company Email*"
															value={empusername}
															autoComplete="new-password"
															onChange={(event) => {
																setEmpUsername(event.target.value);
															}}
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3 position-relative">
														<input
															name="password"
															type={showEmpPassword ? "text" : "password"}
															className="form-control"
															required
															placeholder="Password*"
															value={emppassword}
															autoComplete="new-password"
															onChange={(event) => {
																setEmpPassword(event.target.value);
															}}
														/>
														<button
															type="button"
															className="btn position-absolute password-eye-icon"
															style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
															onClick={() => setShowEmpPassword(!showEmpPassword)}
														>
															<i className={showEmpPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ color: '#fd7e14', pointerEvents: 'none' }} />
														</button>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className="text-end">
															<a href="/forgot-password">Forgot Password</a>
														</div>
													</div>
												</div>

												<div className="col-md-12">
													<button
														type="submit"
														className="site-button"
														style={{width: '120px', maxWidth: '120px'}}
													>
														Log in
													</button>

													<div className="mt-3 mb-3">
														Don't have an account ?
														<button
															className="twm-backto-login"
															data-bs-target="#sign_up_popup"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
															style={{width: '80px', maxWidth: '80px', padding: '5px 10px'}}
														>
															Sign Up
														</button>
													</div>
												</div>
											</div>
										</form>

										{/*Login Placement Content*/}
										<form
											onSubmit={handlePlacementLogin}
											className="tab-pane fade"
											id="login-Placement"
										>
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
															required
															className="form-control"
															placeholder="Email*"
															value={placementusername}
															autoComplete="new-password"
															onChange={(event) => {
																setPlacementUsername(event.target.value);
															}}
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3 position-relative">
														<input
															name="password"
															type={showPlacementPassword ? "text" : "password"}
															className="form-control"
															required
															placeholder="Password*"
															value={placementpassword}
															autoComplete="new-password"
															onChange={(event) => {
																setPlacementPassword(event.target.value);
															}}
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
													<div className="form-group mb-3">
														<div className="text-end">
															<NavLink to={pubRoute(publicUser.pages.FORGOT)} onClick={() => navigate(pubRoute(publicUser.pages.FORGOT))}>Forgot Password</NavLink>
														</div>
													</div>
												</div>

												<div className="col-md-12">
													<button
														type="submit"
														className="site-button"
														style={{width: '120px', maxWidth: '120px'}}
													>
														Log in
													</button>

													<div className="mt-3 mb-3">
														Don't have an account ?
														<button
															className="twm-backto-login"
															data-bs-target="#sign_up_popup"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
															style={{width: '80px', maxWidth: '80px', padding: '5px 10px'}}
														>
															Sign Up
														</button>
													</div>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
}

export default SignInPopup;