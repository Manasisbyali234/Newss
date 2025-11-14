
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadScript } from "../../../../../globals/constants";
import JobZImage from "../../../../common/jobz-img";
import ApplyJobPopup from "../../../../common/popups/popup-apply-job";
import SectionShareProfile from "../../sections/common/section-share-profile";
import SectionJobsSidebar2 from "../../sections/jobs/sidebar/section-jobs-sidebar2";
import "./job-detail.css";

function JobDetail1Page() {
    const { id, param1 } = useParams();
    const jobId = id || param1;
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [candidateId, setCandidateId] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [candidateCredits, setCandidateCredits] = useState(0);

    const authState = useMemo(() => {
        const token = localStorage.getItem('candidateToken');
        const storedCandidateId = localStorage.getItem('candidateId');
        return { token, candidateId: storedCandidateId, isLoggedIn: !!token };
    }, []);

    const { limitReached, isEnded } = useMemo(() => {
        if (!job) return { limitReached: false, isEnded: false };
        const limitReached = typeof job.applicationLimit === 'number' && job.applicationLimit > 0 && (job.applicationCount || 0) >= job.applicationLimit;
        const isEnded = (job.status && job.status !== 'active') || limitReached;
        return { limitReached, isEnded };
    }, [job]);

    const fetchJobDetails = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/public/jobs/${jobId}`);
            const data = await response.json();
            if (data.success) {
                
                
                if (data.job.employerProfile) {
                    
                    
                }
                setJob(data.job);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    const checkApplicationStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            const response = await fetch(`http://localhost:5000/api/candidate/applications/status/${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setHasApplied(data.hasApplied);
            }
        } catch (error) {
            
        }
    }, [jobId]);

    const fetchCandidateCredits = useCallback(async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            const response = await fetch('http://localhost:5000/api/candidate/credits', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCandidateCredits(data.credits || 0);
            }
        } catch (error) {
            
        }
    }, []);

    useEffect(() => {
        setIsLoggedIn(authState.isLoggedIn);
        setCandidateId(authState.candidateId);
        
        if (authState.token && authState.candidateId && jobId) {
            Promise.all([
                checkApplicationStatus(),
                fetchCandidateCredits()
            ]);
        }
    }, [jobId, authState.token, authState.candidateId, checkApplicationStatus, fetchCandidateCredits]);

    const sidebarConfig = {
        showJobInfo: true
    }

    const handleScroll = useCallback(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((window.scrollY / totalHeight) * 100, 100);
        setScrollProgress(progress);
    }, []);

    useEffect(() => {
        loadScript("js/custom.js");
        if (jobId) {
            fetchJobDetails();
        }
        
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', throttledScroll, { passive: true });
        return () => window.removeEventListener('scroll', throttledScroll);
    }, [jobId, handleScroll, fetchJobDetails]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p style={{marginLeft: '16px', color: '#6c757d'}}>Loading job details...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center p-5" style={{animation: 'fadeInUp 0.6s ease-out'}}>
                <h3 style={{color: '#6c757d'}}>Job not found</h3>
                <p style={{color: '#9ca3af'}}>The job you're looking for doesn't exist or has been removed.</p>
            </div>
        );
    }

    const handleApplyClick = async () => {
        if (isEnded) return; // Guard
        if (!isLoggedIn) {
            alert('Please login first to apply for jobs!');
            return;
        } else if (hasApplied) {
            alert('You have already applied for this job!');
        } else {
            try {
                const token = localStorage.getItem('candidateToken');
                
                // Check candidate credits first
                const statsResponse = await fetch('http://localhost:5000/api/candidate/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsResponse.json();
                
                if (statsData.success && statsData.candidate.registrationMethod === 'placement') {
                    const credits = statsData.candidate.credits || 0;
                    if (credits <= 0) {
                        alert('You have insufficient credits to apply for jobs. Please contact your placement coordinator to get more credits.');
                        return;
                    }
                    
                    // Show credit deduction warning
                    const confirmApply = window.confirm(`You have ${credits} credits remaining. Applying for this job will deduct 1 credit. Do you want to continue?`);
                    if (!confirmApply) {
                        return;
                    }
                }
                
                // Check if candidate has uploaded resume
                const profileResponse = await fetch('http://localhost:5000/api/candidate/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const profileData = await profileResponse.json();
                
                if (!profileData.success || !profileData.profile?.resume) {
                    alert('Please upload your resume first before applying for jobs. Go to My Resume section to upload.');
                    navigate('/candidate/my-resume');
                    return;
                }
                
                const response = await fetch('http://localhost:5000/api/candidate/applications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ jobId: jobId })
                });
                const data = await response.json();
                if (data.success) {
                    setHasApplied(true);
                    alert('Application submitted successfully!');
                } else {
                    alert(data.message || 'Failed to submit application');
                }
            } catch (error) {
                
                alert('Failed to submit application');
            }
        }
    };



    return (
			<>
				{/* Scroll Progress Indicator */}
				<div className="scroll-progress" style={{width: `${scrollProgress}%`}}></div>
				
				<div className="section-full  p-t120 p-b90 bg-white">
					<div className="container">
						{/* BLOG SECTION START */}
						<div className="section-content">
							<div className="row d-flex justify-content-center">
								<div className="col-lg-8 col-md-12">
									{/* Candidate detail START */}
									<div className="cabdidate-de-info">
										<div className="twm-job-self-wrap">
											<div className="twm-job-self-info">
												<div className="twm-job-self-top">
													<div className="twm-media-bg">
														{job.employerProfile?.coverImage ? (
															<img src={job.employerProfile.coverImage} alt="Company Cover" />
														) : (
															<JobZImage src="images/employer-bg.jpg" alt="#" />
														)}
														<div className="twm-jobs-category green">
															<span className="twm-bg-green">New</span>
														</div>
													</div>

													<div className="twm-mid-content">
														<div className="twm-media">
															{job.employerProfile?.logo ? (
																<img src={job.employerProfile.logo} alt="Company Logo" />
															) : (
																<JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
															)}
														</div>

														<h4 className="twm-job-title">
															{job.title}
															<span className="twm-job-post-duration">
																/ {new Date(job.createdAt).toLocaleDateString()}
															</span>
														</h4>
														{job.companyName && (
															<p className="twm-job-company"><strong>Company: {job.companyName}</strong></p>
														)}
														<p className="twm-job-address"><i className="feather-map-pin" />{job.location}</p>
														
														{((typeof job.salary === 'string' || typeof job.salary === 'number') || job.minSalary || job.maxSalary) && (
															<div className="salary-info">
																<span className="salary-amount">
																	{typeof job.salary === 'string' || typeof job.salary === 'number' ? `₹${job.salary}` : 
																	 (job.minSalary && job.maxSalary) ? `₹${job.minSalary} - ₹${job.maxSalary}` :
																	 job.minSalary ? `₹${job.minSalary}+` :
																	 `₹${job.maxSalary}`}
																</span>
															</div>
														)}

														<div className="twm-job-self-bottom" style={{marginTop: '40px', paddingTop: '20px', textAlign: 'right', paddingRight: '20px'}}>
															<button
																className={`btn btn-outline-primary ${(hasApplied || isEnded) ? 'disabled' : ''}`}
																onClick={handleApplyClick}
																disabled={hasApplied}
															>
																{hasApplied ? 'Already Applied' : 'Apply Now'}
															</button>
														</div>
													</div>
												</div>
											</div>
										</div>

										{job.companyDescription && (
											<>
												<h4 className="twm-s-title">About Company:</h4>
												<p>{job.companyDescription}</p>
											</>
										)}

										{job.employerProfile && (
											<>
												{job.employerProfile.whyJoinUs && (
													<>
														<h4 className="twm-s-title">Why Join Us:</h4>
														<p>{job.employerProfile.whyJoinUs}</p>
													</>
												)}

												{job.employerProfile.location && (
													<>
														<h4 className="twm-s-title">Location:</h4>
														<p><i className="feather-map-pin" style={{marginRight: '8px'}}></i>{job.employerProfile.location}</p>
													</>
												)}
											</>
										)}

										{job.postedBy === 'Consultant' && job.employerProfile && (
											<>
												<h4 className="twm-s-title">About Consultant:</h4>
												<div style={{padding: '20px', marginBottom: '20px', border: '1px solid #dee2e6', borderRadius: '12px'}} className="consultant-info-box">
													<div className="row">
														<div className="col-md-3">
															{job.employerProfile.logo && (
																<img 
																	src={job.employerProfile.logo} 
																	alt="Consultant Logo" 
																	style={{width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px'}}
																	loading="lazy"
																/>
															)}
														</div>
														<div className="col-md-9">
															<h5>{job.employerId?.companyName || 'Consultant'}</h5>
															{job.employerProfile.description && <p>{job.employerProfile.description}</p>}
															{job.employerProfile.website && (
																<p><strong>Website:</strong> <a href={job.employerProfile.website} target="_blank" rel="noopener noreferrer">{job.employerProfile.website}</a></p>
															)}
															{job.employerProfile.location && (
																<p><strong>Location:</strong> {job.employerProfile.location}</p>
															)}
														</div>
													</div>
												</div>
											</>
										)}
										<h4 className="twm-s-title">Job Description:</h4>
										<p>{job.description}</p>


										
										<div className="job-details-grid">
											<div className="row">
												<div className="col-md-6">
													<div className="detail-item" style={{marginBottom: '15px'}}>
														<h5 style={{display: 'inline'}}><i className="feather-briefcase" style={{marginRight: '8px'}}></i>Job Type: </h5>
														<span>{job.jobType}</span>
													</div>
												</div>
												<div className="col-md-6">
													<div className="detail-item" style={{marginBottom: '15px'}}>
														<h5 style={{display: 'inline'}}><i className="feather-check-circle" style={{marginRight: '8px'}}></i>Backlogs Allowed: </h5>
														<span className={`badge ${job.backlogsAllowed ? 'badge-success' : 'badge-danger'}`}>{job.backlogsAllowed ? 'Yes' : 'No'}</span>
													</div>
												</div>
												{job.lastDateOfApplication && (
													<div className="col-md-6">
														<div className="detail-item" style={{marginBottom: '15px'}}>
															<h5 style={{display: 'inline'}}><i className="feather-calendar" style={{marginRight: '8px'}}></i>Last Date to Apply: </h5>
															<span style={{color: '#dc3545', fontWeight: '600'}}>{new Date(job.lastDateOfApplication).toLocaleDateString()}</span>
														</div>
													</div>
												)}
												{job.employerProfile?.website && (
													<div className="col-md-6">
														<div className="detail-item" style={{marginBottom: '15px'}}>
															<h5 style={{display: 'inline'}}><i className="feather-globe" style={{marginRight: '8px'}}></i>Website: </h5>
															<a href={job.employerProfile.website} target="_blank" rel="noopener noreferrer">{job.employerProfile.website}</a>
														</div>
													</div>
												)}
											</div>
										</div>

										<h4 className="twm-s-title" style={{marginTop: '32px'}}>Required Skills:</h4>
										{job.requiredSkills && job.requiredSkills.length > 0 ? (
											<div className="skills-container">
												{job.requiredSkills.map((skill, index) => (
													<span key={index} className="skill-tag">
														<i className="feather-check"></i>
														{skill}
													</span>
												))}
											</div>
										) : (
											<p style={{color: '#6c757d', fontStyle: 'italic'}}>No specific skills mentioned</p>
										)}

										{job.responsibilities && job.responsibilities.length > 0 && (
											<>
												<h4 className="twm-s-title">Responsibilities:</h4>
												<ul className="description-list-2">
													{job.responsibilities.map((resp, index) => (
														<li key={index}>{resp}</li>
													))}
												</ul>
											</>
										)}

										{job.benefits && job.benefits.length > 0 && (
											<>
												<h4 className="twm-s-title">Benefits:</h4>
												<ul className="description-list-2">
													{job.benefits.map((benefit, index) => (
														<li key={index}>{benefit}</li>
													))}
												</ul>
											</>
										)}

										<SectionShareProfile />
										{/* <SectionJobLocation /> */}


									</div>
								</div>
								
								<div className="col-lg-4 col-md-12 rightSidebar">
									<SectionJobsSidebar2 _config={sidebarConfig} job={job} />
								</div>
							</div>
						</div>
					</div>
				</div>
				<ApplyJobPopup />
				



			</>
		);
}

export default JobDetail1Page;
