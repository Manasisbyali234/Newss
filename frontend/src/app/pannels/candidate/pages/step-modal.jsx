import React from "react";
import "./step-modal.css";

export default function StepModal({ stepTitle, onClose, onComplete }) {
	return (
		<div className="modal-overlay">
			<div className="modal">
				<h2>{stepTitle}</h2>
				<p>Form for {stepTitle} goes here...</p>
				<div className="modal-actions">
					<button onClick={onComplete}>Mark as Complete</button>
					<button onClick={onClose}>Close</button>
				</div>
			</div>
		</div>
	);
}
