import React from "react";
import { useNavigate } from "react-router-dom";

export default function AssessmentCard({ data, onDelete, onEdit, index }) {
	const navigate = useNavigate();
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	return (
		<div className="card h-100 shadow-sm">
			<div className="card-body">
				{/* Serial Number and Created Date */}
				<div className="d-flex justify-content-between align-items-center mb-2">
					<small className="text-muted fw-bold">#{data.serialNumber || (index + 1)}</small>
					<small className="text-muted">
						<i className="fa fa-calendar me-1"></i>
						{formatDate(data.createdAt)}
					</small>
				</div>
				
				<div className="d-flex justify-content-between align-items-start mb-2">
					<h5 className="card-title mb-0">{data.title}</h5>
					<div className="d-flex flex-column align-items-end gap-1">
						<span className="btn btn-sm btn-outline-primary" style={{pointerEvents: 'none', cursor: 'default', fontSize: '10px', padding: '1px 6px', lineHeight: '1.2'}}>
							{data.type}
						</span>
						{data.designation && (
							<span className="btn btn-sm btn-outline-primary" style={{pointerEvents: 'none', cursor: 'default', fontSize: '10px', padding: '1px 6px', lineHeight: '1.2'}}>
								{data.designation}
							</span>
						)}
					</div>
				</div>
				{data.description && (
					<p className="card-text text-muted small">{data.description}</p>
				)}
				<div className="d-flex gap-3 mb-3">
					<small className="text-muted">
						<i className="fa fa-clock me-1"></i>{data.timer} min
					</small>
					<small className="text-muted">
						<i className="fa fa-question-circle me-1"></i>{data.totalQuestions || data.questions?.length || 0} questions
					</small>
				</div>
				<div className="d-flex gap-2">
					<button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/employer/assessment-results/${data._id}`)}>
						<i className="fa fa-chart-bar"></i> Results
					</button>
					<button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(data)} title="Edit Assessment">
						<i className="fa fa-edit"></i>
					</button>
					<button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(data._id)}>
						<i className="fa fa-trash"></i>
					</button>
				</div>
				</div>
		</div>
	);
}
