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
					<div className="container">
						{/* FOOTER BLOCKES START */}
						<div className="footer-top">
							<div className="row">
								<div className="col-lg-4 col-md-12">
									<div className="widget widget_about">
										<div className="logo-footer clearfix">
											<NavLink to={publicUser.INITIAL}>
												<JobZImage
													id="skin_footer_light_logo"
													src="images/logo-light-2.png"
													alt=""
												/>
											</NavLink>
										</div>
										<p>
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
													<span>Email :</span> <a href="mailto:example@metromindz.com" style={{color: '#f97316', textDecoration: 'underline', cursor: 'pointer'}}>example@metromindz.com</a>
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
									<div className="row">
										<div className="col-lg-6 col-md-6 col-sm-6">
											<div className="widget widget_services ftr-list-center">
												<h3 className="widget-title">Quick Links</h3>
												<ul>
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
												<h3 className="widget-title">Helpful Links</h3>
												<ul>
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
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* FOOTER COPYRIGHT */}
						<div className="footer-bottom">
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
					</div>
				</footer>
			</>
		);
}

export default Footer1;