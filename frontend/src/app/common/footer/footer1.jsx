import { publicUrlFor } from "../../../globals/constants";
import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";

function Footer1() {
    return (
			<>
				<footer
					className="footer-light ftr-light-with-bg site-bg-cover"
					style={{
						backgroundImage: `url(${publicUrlFor("images/ftr-bg.jpg")})`,
						fontFamily: '"Plus Jakarta Sans", sans-serif'
					}}
				>

						{/* FOOTER BLOCKES START */}
						<div className="footer-top">
							<div className="row">
								<div className="col-lg-4 col-md-12">
									<div className="widget widget_about">
										<div className="logo-footer clearfix" style={{marginBottom: '20px', paddingLeft: '15px'}}>
											<NavLink to={publicUser.INITIAL}>
												<JobZImage
													id="skin_footer_light_logo"
													src="images/logo-light-2.png"
													alt=""
												/>
											</NavLink>
										</div>
										<p style={{paddingLeft: '15px', backgroundColor: 'transparent !important'}}>
											A smarter way to search, apply, and succeed. Explore
											thousands of opportunities tailored to your goals.
										</p>
										<ul className="ftr-list">
											<li>
												<p>
													<span>Address :</span> Bangalore, 560092{" "}
												</p>
											</li>
											<li>
												<p>
													<span>Email :</span> <a href="mailto:info@taleglobal.net" style={{color: '#f97316', textDecoration: 'underline', cursor: 'pointer'}}>info@taleglobal.net</a>
												</p>
											</li>
											<li>
												<p>
													<span>Call :</span> <a href="tel:+919876543210" style={{color: '#f97316', textDecoration: 'underline', cursor: 'pointer'}}>(+91) 9876543210</a>
												</p>
											</li>
										</ul>
									</div>
								</div>

								<div className="col-lg-8 col-md-12">
									<div className="row" style={{margin: '0', '--bs-gutter-x': '5px'}}>
										<div className="col-lg-6 col-md-6 col-sm-6">
											<div className="widget widget_services ftr-list-center">
												<h3 className="widget-title" style={{paddingLeft: '15px'}}>Quick Links</h3>
												<ul style={{paddingLeft: '15px'}}>
													<li>
														<NavLink to={publicUser.INITIAL}>Home</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.jobs.GRID}>
															Jobs
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.employer.GRID}>
															Employers
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.pages.CONTACT}>
															Contact Us
														</NavLink>
													</li>
												</ul>
											</div>
										</div>

										<div className="col-lg-6 col-md-6 col-sm-6">
											<div className="widget widget_services ftr-list-center">
												<h3 className="widget-title" style={{paddingLeft: '15px'}}>Helpful Links</h3>
												<ul style={{paddingLeft: '15px'}}>
													<li>
														<NavLink to={publicUser.pages.LOGIN}>
															Candidate Dashboard
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.pages.LOGIN}>
															Employers Dashboard
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.pages.TERMS}>
															Terms & Conditions
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.pages.PRIVACY}>
															Privacy Policy
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.pages.TUTORIALS}>
															Watch Tutorial
														</NavLink>
													</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* FOOTER COPYRIGHT */}
						<div className="footer-bottom">
							<style>{`
								.footer-bottom-info {
									display: flex;
									justify-content: space-between;
									align-items: center;
									gap: 30px;
									padding: 0 20px;
								}
								.footer-copy-right {
									flex: 1;
									padding-left: 20px;
								}
								.footer-copy-right .copyrights-text {
									padding-left: 0 !important;
								}
								.social-icons {
									display: flex;
									flex-direction: row;
									justify-content: flex-end;
									align-items: center;
									gap: 15px;
									margin: 0;
									padding: 0 20px;
									list-style: none;
								}
								@media (max-width: 768px) {
									.footer-bottom-info {
										flex-direction: column;
										text-align: center;
										padding: 20px 15px;
									}
									.social-icons {
										justify-content: center;
										gap: 12px;
									}
								}
							`}</style>
							<div className="footer-bottom-info">
								<div className="footer-copy-right">
									<span className="copyrights-text">
										Copyright © 2025 by Tale Global. All Rights Reserved.
									</span>
								</div>

								<ul className="social-icons">
									<li><a href="https://www.facebook.com/"><img src="/assets/socialmedia/icons8-facebook.svg" alt="Facebook" style={{width: '40px', height: '40px'}} /></a></li>
									<li><a href="https://www.twitter.com/"><img src="/assets/socialmedia/icons8-twitter.svg" alt="Twitter" style={{width: '40px', height: '40px'}} /></a></li>
									<li><a href="https://www.instagram.com/"><img src="/assets/socialmedia/icons8-instagram.svg" alt="Instagram" style={{width: '40px', height: '40px'}} /></a></li>
									<li><a href="https://www.youtube.com/"><img src="/assets/socialmedia/icons8-youtube.svg" alt="YouTube" style={{width: '40px', height: '40px'}} /></a></li>
								</ul>
							</div>
						</div>
				</footer>
			</>
		);
}

export default Footer1;