


import React from "react";

export default function AssessmentCard({ data, onDelete }) {
	return (
		<div className="card h-100 shadow-sm">
			<div className="card-body">
				<div className="d-flex justify-content-between align-items-start mb-2">
					<h5 className="card-title mb-0">{data.title}</h5>
					<span className={`badge ${data.type === 'Technical' ? 'bg-primary' : data.type === 'Soft Skill' ? 'bg-success' : 'bg-warning'}`}>
						{data.type}
					</span>
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
					<button className="btn btn-sm btn-outline-primary" onClick={() => window.location.href = `/employer/assessment-results/${data._id}`}>
						<i className="fa fa-chart-bar"></i> Results
					</button>
					<button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(data._id)}>
						<i className="fa fa-trash"></i>
					</button>
				</div>
			</div>
		</div>
	);
}
