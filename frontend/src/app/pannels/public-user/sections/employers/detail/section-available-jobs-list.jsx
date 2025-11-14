

import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicUser } from "../../../../../../globals/route-names";

function SectionAvailableJobsList({ employerId }) {
	const [jobs, setJobs] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (employerId) {
			fetchEmployerJobs();
		}
	}, [employerId]);

	const fetchEmployerJobs = async () => {
		try {
			console.log('Fetching jobs for employer:', employerId);
			const response = await fetch(`http://localhost:5000/api/public/jobs?employerId=${employerId}`);
			const data = await response.json();
			
			console.log('Jobs API response:', data);
			console.log('First job details:', data.jobs?.[0]);
			
			if (data.success) {
				// No filtering needed - backend already filters properly
				const validJobs = data.jobs || [];
				
				console.log('Valid jobs after filtering:', validJobs.length);
				setJobs(validJobs);
			} else {
				console.log('API returned success: false');
				setJobs([]);
			}
		} catch (error) {
			console.error('Error fetching jobs:', error);
			setJobs([]);
		} finally {
			setLoading(false);
		}
	};

	const formatSalary = (job) => {
		if (job.ctc && (job.ctc.min || job.ctc.max)) {
			if (job.ctc.min && job.ctc.max) {
				return `₹${job.ctc.min} - ₹${job.ctc.max} LPA`;
			} else {
				return `₹${job.ctc.min || job.ctc.max} LPA`;
			}
		}
		if (job.salary && (job.salary.min || job.salary.max)) {
			const currency = job.salary.currency === 'USD' ? '$' : '₹';
			if (job.salary.min && job.salary.max) {
				return `${currency}${job.salary.min} - ${currency}${job.salary.max}`;
			} else {
				return `${currency}${job.salary.min || job.salary.max}`;
			}
		}
		return 'Salary not disclosed';
	};

	const formatJobType = (jobType) => {
		return jobType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified';
	};

	if (loading) {
		return <div className="text-center p-3">Loading jobs...</div>;
	}

	return (
		<>
			<h4 className="twm-s-title">Available Jobs ({jobs.length})</h4>

			<div className="twm-jobs-list-wrap">
				{jobs.length > 0 ? (
					<ul>
						{jobs.map((job) => (
							<li key={job._id}>
								<div className="twm-jobs-list-style1 mb-2 compact-job-card">
									<div className="job-category-badge">
										{job.category || 'General'}
									</div>
									<div className="twm-mid-content">
										<NavLink to={`/job-detail/${job._id}`} className="twm-job-title">
											<h5>{job.title}</h5>
										</NavLink>
										<p className="twm-job-address">
											<i className="feather-map-pin"></i>
											{job.location}
										</p>
									</div>
									<div className="twm-right-content">
										<div className="twm-jobs-amount">
											{formatSalary(job)}
										</div>
										<NavLink
											to={`/job-detail/${job._id}`}
											className="view-details-btn"
										>
											View Details
										</NavLink>
									</div>
								</div>
							</li>
						))}
					</ul>
				) : (
					<div className="text-center p-4">
						<p>No jobs available from this employer.</p>
					</div>
				)}
			</div>
		</>
	);
}

export default SectionAvailableJobsList;
