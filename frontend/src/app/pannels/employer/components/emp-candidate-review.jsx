import { ArrowLeft, Award, Briefcase, Calendar, Check, Download, FileText, GraduationCap, Mail, MapPin, Phone, Save, User, UserCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import showToast from "../../../../utils/toastNotification";
import InterviewProcessManager from "./InterviewProcessManager";
import './emp-candidate-review.css';
import './emp-candidate-review-mobile.css';


function EmpCandidateReviewPage () {
	const navigate = useNavigate();
	const { applicationId } = useParams();
	const [application, setApplication] = useState(null);
	const [candidate, setCandidate] = useState(null);
	const [loading, setLoading] = useState(true);
	const [interviewRounds, setInterviewRounds] = useState([]);
	const [remarks, setRemarks] = useState('');
	const [isSelected, setIsSelected] = useState(false);

	useEffect(() => {
		loadScript("js/custom.js");
		fetchApplicationDetails();
	}, [applicationId]);

	const fetchApplicationDetails = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			if (!token) return;

			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			
			if (response.ok) {
				const data = await response.json();
				setApplication(data.application);
				setCandidate(data.application.candidateId);
				
				// Load existing review data if available
				if (data.application.employerRemarks) {
					setRemarks(data.application.employerRemarks);
				}
				if (data.application.isSelectedForProcess) {
					setIsSelected(data.application.isSelectedForProcess);
				}
				
				// Show interview rounds if job has interview rounds
				const job = data.application.jobId;
				const allRounds = [];
				
				// Check if job has interview rounds (not just assessment)
				const hasInterviewRounds = (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) || 
					(job?.interviewRoundTypes && Object.keys(job.interviewRoundTypes).filter(key => job.interviewRoundTypes[key]).length > 0);
				
				if (hasInterviewRounds) {
					if (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
						job.interviewRoundOrder.forEach((uniqueKey, index) => {
							const roundType = job.interviewRoundTypes?.[uniqueKey];
							if (roundType) {
								const roundNames = {
									technical: 'Technical Round',
									nonTechnical: 'Non-Technical Round',
									managerial: 'Managerial Round',
									final: 'Final Round',
									hr: 'HR Round'
								};
								
								const existingRound = data.application.interviewRounds?.find(r => r.round === index + 1);
								allRounds.push({
									round: index + 1,
									name: roundNames[roundType] || roundType,
									uniqueKey: uniqueKey,
									roundType: roundType,
									status: existingRound?.status || 'pending',
									feedback: existingRound?.feedback || ''
								});
							}
						});
					} else if (job?.interviewRoundTypes && Object.values(job.interviewRoundTypes).some(Boolean)) {
						let roundsCount = job?.interviewRoundsCount || 1;
						
						const roundNames = [];
						if (job.interviewRoundTypes.technical) roundNames.push('Technical Round');
						if (job.interviewRoundTypes.managerial) roundNames.push('Managerial Round');
						if (job.interviewRoundTypes.nonTechnical) roundNames.push('Non-Technical Round');
						if (job.interviewRoundTypes.hr) roundNames.push('HR Round');
						if (job.interviewRoundTypes.final) roundNames.push('Final Round');
						
						for (let i = 0; i < Math.min(roundsCount, roundNames.length); i++) {
							const existingRound = data.application.interviewRounds?.find(r => r.round === i + 1);
							allRounds.push({
								round: i + 1,
								name: roundNames[i],
								status: existingRound?.status || 'pending',
								feedback: existingRound?.feedback || ''
							});
						}
					}
				}
				
				setInterviewRounds(allRounds);

			}
		} catch (error) {
			
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case 'pending': return 'twm-bg-yellow';
			case 'shortlisted': return 'twm-bg-purple';
			case 'interviewed': return 'twm-bg-orange';
			case 'hired': return 'twm-bg-green';
			case 'rejected': return 'twm-bg-red';
			default: return 'twm-bg-light-blue';
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric'
		});
	};

	const saveReview = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/review`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					interviewRounds,
					remarks,
					isSelected
				})
			});
			
			if (response.ok) {
				const result = await response.json();
				showToast('Interview review saved successfully! Candidate will see the updated status.', 'success');
				
			} else {
				const errorData = await response.json();
				showToast(`Failed to save review: ${errorData.message || 'Unknown error'}`, 'error');
			}
		} catch (error) {
			
			showToast('Error saving review. Please try again.', 'error');
		}
	};

	const shortlistCandidate = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ status: 'shortlisted' })
			});
			
			if (response.ok) {
				showToast('Candidate shortlisted successfully! Status updated for candidate.', 'success');
				setApplication(prev => ({ ...prev, status: 'shortlisted' }));
			} else {
				const errorData = await response.json();
				showToast(`Failed to shortlist candidate: ${errorData.message || 'Unknown error'}`, 'error');
			}
		} catch (error) {
			
			showToast('Error shortlisting candidate. Please try again.', 'error');
		}
	};

	const rejectCandidate = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ status: 'rejected' })
			});
			
			if (response.ok) {
				showToast('Candidate rejected. Status updated for candidate.', 'success');
				setApplication(prev => ({ ...prev, status: 'rejected' }));
			} else {
				const errorData = await response.json();
				showToast(`Failed to reject candidate: ${errorData.message || 'Unknown error'}`, 'error');
			}
		} catch (error) {
			
			showToast('Error rejecting candidate. Please try again.', 'error');
		}
	};

	const downloadDocument = (fileData, fileName) => {
		if (!fileData) return;
		
		// Handle Base64 encoded files
		if (fileData.startsWith('data:')) {
			const link = document.createElement('a');
			link.href = fileData;
			link.download = fileName || 'document';
			link.click();
		} else {
			// Handle file paths
			const link = document.createElement('a');
			link.href = `http://localhost:5000/${fileData}`;
			link.download = fileName || 'document';
			link.click();
		}
	};

	const viewDocument = (fileData) => {
		if (!fileData) return;
		
		// Handle Base64 encoded files
		if (fileData.startsWith('data:')) {
			// Create a blob URL for better viewing
			const byteCharacters = atob(fileData.split(',')[1]);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const mimeType = fileData.split(',')[0].split(':')[1].split(';')[0];
			const blob = new Blob([byteArray], { type: mimeType });
			const blobUrl = URL.createObjectURL(blob);
			window.open(blobUrl, '_blank');
		} else {
			// Handle file paths
			window.open(`http://localhost:5000/${fileData}`, '_blank');
		}
	};

	if (loading) {
		return <div className="text-center p-4">Loading candidate details...</div>;
	}

	if (!application || !candidate) {
		return <div className="text-center p-4">Candidate not found</div>;
	}

	return (
		<div className="container-fluid py-4 emp-candidate-review-page" style={{backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
			{/* Header Section */}
			<div className="row mb-4">
				<div className="col-12">
					<div className="d-flex justify-content-between align-items-center bg-white p-4 rounded-3 shadow-sm border-0" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'}}>
						<div className="d-flex align-items-center gap-3">
							<button
								className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
								style={{width: '40px', height: '40px', borderColor: '#ff6600', color: '#ff6600'}}
								onClick={() => navigate(-1)}
							>
								<ArrowLeft size={18} />
							</button>
							<div>
								<h2 className="mb-1 fw-bold" style={{color: '#2c3e50'}}>
									Candidate Review
								</h2>
								<p className="text-muted mb-0 fs-6">Comprehensive candidate evaluation & assessment</p>
							</div>
						</div>
						<span className={`badge ${getStatusBadge(application.status)} text-capitalize fs-6 px-4 py-2 rounded-pill`} style={{fontSize: '0.9rem !important'}}>
							{application.status}
						</span>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="row g-4">
				{/* Left Column - Candidate Profile */}
				<div className="col-lg-8">
					{/* Personal Information Card */}
					<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
						<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
							<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
								<User size={22} />
								Basic Information
							</h5>
						</div>
						<div className="card-body p-4">
							<div className="row align-items-center mb-4">
								<div className="col-auto">
									<div
										className="rounded-circle overflow-hidden shadow-sm"
										style={{ width: "100px", height: "100px", border: '4px solid #ff6600' }}
									>
										{candidate.profilePicture ? (
											<img
												src={candidate.profilePicture}
												alt={candidate.name}
												style={{ width: "100px", height: "100px", objectFit: "cover" }}
											/>
										) : (
											<div className="d-flex align-items-center justify-content-center h-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
												<User size={50} style={{color: '#ff6600'}} />
											</div>
										)}
									</div>
								</div>
								<div className="col">
									<h3 className="mb-2 fw-bold" style={{color: '#2c3e50'}}>{candidate.name}</h3>
									<p className="mb-2 d-flex align-items-center gap-2" style={{color: '#ff6600', fontWeight: '500'}}>
										<Briefcase size={18} />
										Applied for: {application.jobId?.title || 'Unknown Job'}
									</p>
									<p className="text-muted mb-0 d-flex align-items-center gap-2">
										<Calendar size={16} />
										Applied on: {formatDate(application.createdAt)}
									</p>
								</div>
							</div>

							<div className="row g-4">
								<div className="col-md-6">
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<Mail size={16} style={{ color: "#ff6600" }} />
											<strong>Email:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.email}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<Phone size={16} style={{ color: "#ff6600" }} />
											<strong>Mobile:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.phone || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<Calendar size={16} style={{ color: "#ff6600" }} />
											<strong>Date of Birth:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.dateOfBirth ? formatDate(candidate.dateOfBirth) : 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<User size={16} style={{ color: "#ff6600" }} />
											<strong>Gender:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.gender || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<MapPin size={16} style={{ color: "#ff6600" }} />
											<strong>Pincode:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.pincode || 'Not provided'}</p>
									</div>
								</div>
								<div className="col-md-6">
									<h6 className="text-primary mb-3 d-flex align-items-center gap-2"><User size={16} style={{ color: "#ff6600" }} />Family Information</h6>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<User size={16} style={{ color: "#ff6600" }} />
											<strong>Father's/Husband's Name:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.fatherName || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<User size={16} style={{ color: "#ff6600" }} />
											<strong>Mother's Name:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.motherName || 'Not provided'}</p>
									</div>

									<h6 className="text-primary mb-3 mt-4 d-flex align-items-center gap-2"><MapPin size={16} style={{ color: "#ff6600" }} />Address Information</h6>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<MapPin size={16} style={{ color: "#ff6600" }} />
											<strong>Residential Address:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.residentialAddress || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<MapPin size={16} style={{ color: "#ff6600" }} />
											<strong>Permanent Address:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.permanentAddress || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<MapPin size={16} style={{ color: "#ff6600" }} />
											<strong>Correspondence Address:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.correspondenceAddress || 'Not provided'}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Education Card */}
					{candidate.education && candidate.education.length > 0 && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<GraduationCap size={22} />
									Education Details
								</h5>
							</div>
							<div className="card-body">
								<div className="row">
									{candidate.education.map((edu, index) => (
										<div key={index} className="col-md-6 mb-3 d-flex">
											<div className="border rounded p-3 w-100 d-flex flex-column">
												<h6 className="text-primary mb-2">
													{index === 0 ? '10th Grade' : index === 1 ? '12th Grade' : 'Degree'}
												</h6>
												<p className="mb-1"><strong>Institution:</strong> {edu.collegeName || 'Not provided'}</p>
												{edu.specialization && <p className="mb-1"><strong>Specialization:</strong> {edu.specialization}</p>}
												<p className="mb-1"><strong>Year:</strong> {edu.passYear || 'Not provided'}</p>
												<p className="mb-2"><strong>Score:</strong> {edu.scoreValue || edu.percentage || 'Not provided'}{edu.scoreType === 'percentage' ? '%' : ''}</p>
												{edu.marksheet && (
													<div className="d-flex gap-2">
														<button
															className="btn btn-outline-primary btn-sm"
															style={{color: 'white', backgroundColor: '#ff6600', borderColor: '#ff6600'}}
															onClick={() => viewDocument(edu.marksheet)}
														>
															<i className="fa fa-eye me-1" style={{color: 'white'}}></i>View
														</button>
														<button
															className="btn btn-outline-secondary btn-sm"
															style={{color: 'white', backgroundColor: '#ff6600', borderColor: '#ff6600'}}
															onClick={() => downloadDocument(edu.marksheet, `marksheet_${index}.pdf`)}
														>
															<Download size={14} className="me-1" />Download
														</button>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Skills & Summary */}
					{(candidate.skills?.length > 0 || candidate.profileSummary) && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<Award size={22} />
									Skills & Summary
								</h5>
							</div>
							<div className="card-body p-4">
								{candidate.skills && candidate.skills.length > 0 && (
									<div className="mb-4">
										<h6 className="fw-bold mb-3" style={{color: '#2c3e50'}}>Key Skills</h6>
										<div className="d-flex flex-wrap gap-2">
											{candidate.skills.map((skill, index) => (
												<span key={index} className="badge px-3 py-2 rounded-pill" style={{backgroundColor: '#ff6600', color: 'white', fontSize: '0.85rem', fontWeight: '500'}}>{skill}</span>
											))}
										</div>
									</div>
								)}
								{candidate.profileSummary && (
									<div>
										<h6>Profile Summary</h6>
										<p className="text-muted" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{candidate.profileSummary}</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Right Column - Actions & Review */}
				<div className="col-lg-4">
					{/* Resume Card */}
					{candidate.resume && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<FileText size={22} />
									Resume
								</h5>
							</div>
							<div className="card-body p-4">
								<button
									className="btn btn-lg rounded-pill px-4 py-2 fw-semibold"
									style={{backgroundColor: '#ff6600', color: 'white', border: 'none', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}
									onClick={() => downloadDocument(candidate.resume, 'resume.pdf')}
								>
									<Download size={18} className="me-2" />Download Resume
								</button>
							</div>
						</div>
					)}



					{/* Interview Rounds */}
					{(interviewRounds.length > 0 || application?.jobId?.assessmentId) && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<UserCircle2 size={22} />
									Interview Rounds ({interviewRounds.length + (application?.jobId?.assessmentId ? 1 : 0)})
								</h5>
							</div>
							<div className="card-body p-4">
								{/* Assessment Round - Show first if job has assessment */}
								{application?.jobId?.assessmentId && (
									<div className="mb-4 p-3 border rounded-3" style={{borderColor: '#e9ecef', backgroundColor: '#fafafa'}}>
										<div className="d-flex align-items-center justify-content-between mb-3">
											<h6 className="mb-0 fw-bold" style={{color: '#2c3e50'}}>
												{application.assessmentAttempt?.assessmentId?.title || 'Technical Assessment'}
											</h6>
											<span className={`badge ${
												application.assessmentAttempt?.status === 'completed' ? 'bg-success' :
												application.assessmentAttempt?.status === 'in_progress' ? 'bg-warning' :
												application.assessmentAttempt?.status === 'expired' ? 'bg-danger' :
												'bg-secondary'
											}`}>
												{application.assessmentAttempt?.status ? 
													application.assessmentAttempt.status.charAt(0).toUpperCase() + application.assessmentAttempt.status.slice(1) : 
													'Not Attempted'
												}
											</span>
										</div>
										
										{application.assessmentAttempt ? (
											<div className="row g-3">
												{application.assessmentAttempt.startTime && (
													<div className="col-md-6">
														<small className="text-muted d-block">Started:</small>
														<div className="fw-semibold">{new Date(application.assessmentAttempt.startTime).toLocaleString()}</div>
													</div>
												)}
												{application.assessmentAttempt.endTime && (
													<div className="col-md-6">
														<small className="text-muted d-block">Completed:</small>
														<div className="fw-semibold">{new Date(application.assessmentAttempt.endTime).toLocaleString()}</div>
													</div>
												)}
												{application.assessmentAttempt.score !== undefined && (
													<div className="col-md-4">
														<small className="text-muted d-block">Score:</small>
														<div className="fw-semibold">{application.assessmentAttempt.score}/{application.assessmentAttempt.totalMarks || 'N/A'}</div>
													</div>
												)}
												{application.assessmentAttempt.percentage !== undefined && (
													<div className="col-md-4">
														<small className="text-muted d-block">Percentage:</small>
														<div className="fw-semibold">{application.assessmentAttempt.percentage.toFixed(1)}%</div>
													</div>
												)}
												{application.assessmentAttempt.result && (
													<div className="col-md-4">
														<small className="text-muted d-block">Result:</small>
														<div className="mt-1">
															<span className={`badge ${
																application.assessmentAttempt.result === 'pass' ? 'bg-success' :
																application.assessmentAttempt.result === 'fail' ? 'bg-danger' :
																'bg-warning'
															}`}>
																{application.assessmentAttempt.result.toUpperCase()}
															</span>
														</div>
													</div>
												)}
												{application.assessmentAttempt.startTime && application.assessmentAttempt.endTime && (
													<div className="col-md-6">
														<small className="text-muted d-block">Time Taken:</small>
														<div className="fw-semibold">{Math.round((new Date(application.assessmentAttempt.endTime) - new Date(application.assessmentAttempt.startTime)) / (1000 * 60))} minutes</div>
													</div>
												)}
												{application.assessmentAttempt.violations && application.assessmentAttempt.violations.length > 0 && (
													<div className="col-md-6">
														<small className="text-muted d-block">Violations:</small>
														<div className="mt-1">
															<span className="badge bg-danger me-2">{application.assessmentAttempt.violations.length}</span>
															<small className="text-muted">
																{application.assessmentAttempt.violations.map(v => v.type).join(', ')}
															</small>
														</div>
													</div>
												)}
											</div>
										) : (
											<div className="text-center py-3">
												<p className="text-muted mb-2">Assessment not yet attempted by candidate</p>
												<span className="badge bg-warning">Pending</span>
											</div>
										)}
									</div>
								)}
								
								{/* Interview Rounds */}
								{interviewRounds.map((round, index) => (
									<div key={index} className="mb-4 p-3 border rounded-3" style={{borderColor: '#e9ecef', backgroundColor: '#fafafa'}}>
										<div className="d-flex align-items-center justify-content-between mb-3">
											<h6 className="mb-0 fw-bold" style={{color: '#2c3e50'}}>
												<span className="badge me-2" style={{backgroundColor: '#ff6600', color: 'white'}}>{round.round}</span>
												{round.name}
											</h6>
											<span className={`badge ${
												round.status === 'passed' ? 'bg-success' :
												round.status === 'failed' ? 'bg-danger' :
												'bg-warning'
											}`}>
												{round.status.charAt(0).toUpperCase() + round.status.slice(1)}
											</span>
										</div>
										
										<div className="row g-3">
											<div className="col-md-6">
												<label className="form-label fw-semibold" style={{color: '#2c3e50'}}>Status</label>
												<select 
													className="form-select border-2"
													value={round.status}
													onChange={(e) => {
														const updated = [...interviewRounds];
														updated[index].status = e.target.value;
														setInterviewRounds(updated);
													}}
													style={{borderColor: '#ff6600'}}
												>
													<option value="pending">Pending</option>
													<option value="passed">Passed</option>
													<option value="failed">Failed</option>
												</select>
											</div>
											<div className="col-md-12">
												<label className="form-label fw-semibold" style={{color: '#2c3e50'}}>Feedback</label>
												<textarea
													className="form-control border-2"
													rows="2"
													placeholder="Enter feedback for this round..."
													value={round.feedback}
													onChange={(e) => {
														const updated = [...interviewRounds];
														updated[index].feedback = e.target.value;
														setInterviewRounds(updated);
													}}
													style={{borderColor: '#ff6600'}}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Interview Process Manager */}
					<div className="mb-4">
						<InterviewProcessManager 
							applicationId={applicationId}
							onSave={(process) => {
								console.log('Interview process saved:', process);
							}}
						/>
					</div>

					{/* Review & Actions */}
					<div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
						<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
							<h5 className="mb-0 fw-bold" style={{color: '#000'}}>Review & Actions</h5>
						</div>
						<div className="card-body p-4">
							<div className="mb-4">
								<label className="form-label fw-semibold" style={{color: '#2c3e50'}}>Overall Remarks</label>
								<textarea
									className="form-control border-2 rounded-3"
									rows="4"
									placeholder="Enter your detailed remarks and feedback..."
									value={remarks}
									onChange={(e) => setRemarks(e.target.value)}
									style={{borderColor: '#ff6600', fontSize: '0.95rem'}}
								/>
							</div>

							<div className="form-check mb-4 p-3 rounded-3" style={{backgroundColor: '#f8f9fa', border: '2px solid #e9ecef'}}>
								<input
									className="form-check-input"
									type="checkbox"
									id="candidateSelection"
									checked={isSelected}
									onChange={(e) => setIsSelected(e.target.checked)}
									style={{transform: 'scale(1.2)', accentColor: '#ff6600'}}
								/>
								<label className="form-check-label fw-semibold ms-2" htmlFor="candidateSelection" style={{color: '#2c3e50'}}>
									Select for further process
								</label>
							</div>

							<div className="d-flex flex-column gap-2">
								<button className="btn btn-outline-primary w-100 px-4 py-2" style={{backgroundColor: '#ff6600', borderColor: '#ff6600', color: 'white', borderRadius: '50px', fontSize: '14px', fontWeight: '600', minHeight: '40px', transition: 'none'}} onMouseEnter={(e) => {e.target.style.backgroundColor = '#ff6600'; e.target.style.borderColor = '#ff6600'; e.target.style.color = 'white';}} onClick={saveReview}>
									<Save size={16} className="me-2" />Save Review
								</button>
								<button className="btn btn-outline-primary w-100 px-4 py-2" style={{backgroundColor: '#ff6600', borderColor: '#ff6600', color: 'white', borderRadius: '50px', fontSize: '14px', fontWeight: '600', minHeight: '40px', transition: 'none'}} onMouseEnter={(e) => {e.target.style.backgroundColor = '#ff6600'; e.target.style.borderColor = '#ff6600'; e.target.style.color = 'white';}} onClick={shortlistCandidate}>
									<Check size={16} className="me-2" />Shortlist Candidate
								</button>
								<button className="btn btn-outline-primary w-100 px-4 py-2" style={{backgroundColor: '#ff6600', borderColor: '#ff6600', color: 'white', borderRadius: '50px', fontSize: '14px', fontWeight: '600', minHeight: '40px', transition: 'none'}} onMouseEnter={(e) => {e.target.style.backgroundColor = '#ff6600'; e.target.style.borderColor = '#ff6600'; e.target.style.color = 'white';}} onClick={rejectCandidate}>
									<X size={16} className="me-2" />Reject Candidate
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default EmpCandidateReviewPage;
