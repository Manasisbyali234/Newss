import React, { useState, useEffect } from "react";
import AssessmentCard from "../assessments/AssessmnetCard";
import CreateAssessmentModal from "../assessments/CreateassessmentModal";
import axios from "axios";
import showToast from "../../../../../utils/toastNotification";
import './assessment-dashboard.css';

export default function AssessmentDashboard() {
	const [assessments, setAssessments] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchAssessments();
	}, []);

	const fetchAssessments = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const response = await axios.get('http://localhost:5000/api/employer/assessments', {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (response.data.success) {
				setAssessments(response.data.assessments);
			}
		} catch (error) {
			console.error('Error fetching assessments:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateAssessment = async (newAssessment) => {
		try {
			const token = localStorage.getItem('employerToken');
			const response = await axios.post('http://localhost:5000/api/employer/assessments', newAssessment, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (response.data.success) {
				setAssessments((prev) => [response.data.assessment, ...prev]);
				setShowModal(false);
				showToast('Assessment created successfully!', 'success');
			}
		} catch (error) {
			console.error('Error creating assessment:', error);
			
			// Show specific error message from server
			let errorMessage = 'Failed to create assessment';
			if (error.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
				errorMessage = error.response.data.errors[0].msg;
			}
			
			showToast(errorMessage, 'error');
		}
	};

	const handleDeleteAssessment = async (id) => {
		if (!window.confirm('Are you sure you want to delete this assessment?')) return;
		try {
			const token = localStorage.getItem('employerToken');
			await axios.delete(`http://localhost:5000/api/employer/assessments/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setAssessments(prev => prev.filter(a => a._id !== id));
			showToast('Assessment deleted successfully', 'success');
		} catch (error) {
			console.error('Error deleting assessment:', error);
			showToast('Failed to delete assessment', 'error');
		}
	};

	if (loading) {
		return (
			<div className="twm-right-section-panel site-bg-gray" style={{
				width: '100%',
				margin: 0,
				padding: '2rem',
				background: '#f7f7f7',
				minHeight: '100vh'
			}}>
				<div className="text-center py-4">
					<div className="spinner-border" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="twm-right-section-panel site-bg-gray emp-assessment-page" style={{
			width: '100%',
			margin: 0,
			padding: 0,
			background: '#f7f7f7',
			minHeight: '100vh'
		}}>
			{/* Header */}
			<div style={{ padding: '2rem 2rem 2rem 2rem' }}>
				<div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
					<div className="d-flex justify-content-between align-items-center">
						<div>
							<h2>Assessments</h2>
							<p className="text-muted mb-0">Manage and create your assessments ({assessments.length})</p>
						</div>
						<button className="btn btn-dark" onClick={() => setShowModal(true)}>
							<i className="fa fa-plus me-2"></i>Create Assessment
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div style={{ padding: '0 2rem 2rem 2rem' }}>
				<div className="panel panel-default site-bg-white p-3" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
					{assessments.length === 0 ? (
						<div className="text-center py-5">
							<i className="fa fa-clipboard-list" style={{fontSize: '64px', color: '#ccc'}}></i>
							<p className="mt-3 text-muted">No assessments yet. Create one to get started.</p>
						</div>
					) : (
						<div className="row">
							{assessments.map((assessment, index) => (
								<div key={assessment._id} className="col-md-6 col-lg-4 mb-3">
									<AssessmentCard 
										data={assessment} 
										onDelete={handleDeleteAssessment}
										index={index}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{showModal && (
				<CreateAssessmentModal
					onClose={() => setShowModal(false)}
					onCreate={handleCreateAssessment}
				/>
			)}
		</div>
	);
}
