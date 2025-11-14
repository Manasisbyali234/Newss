
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../../globals/route-names";
import SectionSideAdvert from "./section-side-advert";
import JobZImage from "../../../../../common/jobz-img";

function SectionJobsSidebar2 ({ _config, job }) {
    return (
			<>
				<div className="side-bar mb-4">
					<div className="twm-s-info2-wrap mb-5">
						<div className="twm-s-info2">
							<h4 className="section-head-small mb-4">Job Information</h4>
							
							<ul className="twm-job-hilites">
								{/* <li>
                                <i className="fas fa-calendar-alt" />
                                <span className="twm-title">Date Posted</span>
                            </li>*/}
								<li>
									<i className="fas fa-eye" />
									<span className="twm-title">{job?.vacancies || 'Not specified'} Vacancies</span>
								</li>

								<li>
									<i className="fas fa-file-signature" />
									<span className="twm-title">{job?.applicationCount || 0} Applications{(typeof job?.applicationLimit === 'number' && job.applicationLimit > 0) ? ` / Limit: ${job.applicationLimit}` : ''}</span>
								</li>
							</ul>

							<ul className="twm-job-hilites2">
								<li>
									<div className="twm-s-info-inner">
										<i className="fas fa-calendar-alt" />
										<span className="twm-title">Date Posted</span>
										<div className="twm-s-info-discription">{job ? new Date(job.createdAt).toLocaleDateString() : 'Not available'}</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fas fa-calendar-alt" />
										<span className="twm-title">Application Last Date</span>
										<div className="twm-s-info-discription">August 30, 2025</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fas fa-map-marker-alt" />
										<span className="twm-title">Location</span>
										<div className="twm-s-info-discription">
											{job?.location || 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fas fa-user-tie" />
										<span className="twm-title">Job Title</span>
										<div className="twm-s-info-discription">{job?.title || 'Not specified'}</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fas fa-clock" />
										<span className="twm-title">Experience</span>
										<div className="twm-s-info-discription">{job?.minExperience || 0} Year(s)</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fas fa-suitcase" />
										<span className="twm-title">Qualification</span>
										<div className="twm-s-info-discription">
											{job?.education || 'Not specified'}
										</div>
									</div>
								</li>
								{/* <li>
                                <div className="twm-s-info-inner">
                                    <i className="fas fa-venus-mars" />
                                    <span className="twm-title">Gender</span>
                                    <div className="twm-s-info-discription">Both</div>
                                </div>
                            </li> */}
								<li>
									<div className="twm-s-info-inner">
										<i className="fas fa-money-bill-wave" />
										<span className="twm-title">Offered Salary</span>
											<div className="twm-s-info-discription">
											{job?.ctc && typeof job.ctc === 'object' && job.ctc.min > 0 && job.ctc.max > 0 ? (
												job.ctc.min === job.ctc.max ? `₹${Math.floor(job.ctc.min/100000)}LPA` : `₹${Math.floor(job.ctc.min/100000)} - ${Math.floor(job.ctc.max/100000)} LPA`
											) : 'Not specified'}
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>

					<div className="widget tw-sidebar-tags-wrap">
						<h4 className="section-head-small mb-4">Job Skills</h4>
						<div className="tagcloud">
							{job?.requiredSkills && job.requiredSkills.length > 0 ? (
								job.requiredSkills.map((skill, index) => (
									<a key={index} href="#">{skill}</a>
								))
							) : (
								<span>No skills specified</span>
							)}
						</div>
					</div>
				</div>



				{/* <SectionSideAdvert /> */}
			</>
		);
}

export default SectionJobsSidebar2;
