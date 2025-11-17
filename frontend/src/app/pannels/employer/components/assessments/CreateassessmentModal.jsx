
// import React, { useState } from "react";

// export default function CreateAssessmentModal({ onClose, onCreate }) {
// 	const [title, setTitle] = useState("");
// 	const [type, setType] = useState("Technical"); // New state for Type
// 	const [timeLimit, setTimeLimit] = useState(30);
// 	const [description, setDescription] = useState("");
// 	const [questions, setQuestions] = useState([
// 		{ question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 },
// 	]);

// 	const handleQuestionChange = (index, field, value) => {
// 		const updated = [...questions];
// 		if (field === "question") updated[index].question = value;
// 		if (field === "marks") updated[index].marks = value;
// 		setQuestions(updated);
// 	};

// 	const handleOptionChange = (qIndex, optIndex, value) => {
// 		const updated = [...questions];
// 		updated[qIndex].options[optIndex] = value;
// 		setQuestions(updated);
// 	};

// 	const handleCorrectAnswerChange = (qIndex, optIndex) => {
// 		const updated = [...questions];
// 		updated[qIndex].correctAnswer = optIndex;
// 		setQuestions(updated);
// 	};

// 	const addQuestion = () => {
// 		setQuestions([
// 			...questions,
// 			{ question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 },
// 		]);
// 	};

// 	const handleSubmit = () => {
// 		if (!title.trim()) return alert("Please enter an assessment title");
// 		onCreate({
// 			title,
// 			type, // Include type in submission
// 			timeLimit,
// 			description,
// 			questions,
// 		});
// 	};

// 	return (
// 		<div
// 			className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
// 			style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
// 		>
// 			<div
// 				className="bg-white rounded shadow"
// 				style={{
// 					width: "700px",
// 					maxHeight: "90vh",
// 					display: "flex",
// 					flexDirection: "column",
// 				}}
// 			>
// 				{/* Header */}
// 				<div className="p-3 border-bottom d-flex justify-content-between align-items-center">
// 					<h5 className="m-0">Create New Assessment</h5>
// 					<button
// 						className="btn-close"
// 						onClick={onClose}
// 						aria-label="Close"
// 					></button>
// 				</div>

// 				{/* Scrollable body */}
// 				<div
// 					className="p-3 overflow-auto"
// 					style={{ flex: "1 1 auto", minHeight: 0 }}
// 				>
// 					{/* Title */}
// 					<div className="mb-3">
// 						<label className="form-label fw-semibold">Assessment Title</label>
// 						<input
// 							type="text"
// 							className="form-control"
// 							placeholder="e.g., JavaScript Fundamentals"
// 							value={title}
// 							onChange={(e) => setTitle(e.target.value)}
// 						/>
// 					</div>

// 					{/* Type Dropdown */}
// 					<div className="mb-3">
// 						<label className="form-label fw-semibold">Type</label>
// 						<select
// 							className="form-select"
// 							value={type}
// 							onChange={(e) => setType(e.target.value)}
// 						>
// 							<option value="Technical">Technical</option>
// 							<option value="Soft Skill">Soft Skill</option>
// 							<option value="General">General</option>
// 						</select>
// 					</div>

// 					{/* Time Limit */}
// 					<div className="mb-3">
// 						<label className="form-label fw-semibold">
// 							Time Limit (minutes)
// 						</label>
// 						<input
// 							type="number"
// 							className="form-control"
// 							value={timeLimit}
// 							onChange={(e) => setTimeLimit(e.target.value)}
// 						/>
// 					</div>

// 					{/* Description */}
// 					<div className="mb-3">
// 						<label className="form-label fw-semibold">Description</label>
// 						<textarea
// 							className="form-control"
// 							placeholder="Describe what this assessment covers..."
// 							rows={3}
// 							value={description}
// 							onChange={(e) => setDescription(e.target.value)}
// 						/>
// 					</div>

// 					<hr />
// 					<h6 className="fw-bold">Questions ({questions.length})</h6>

// 					{/* Questions */}
// 					{questions.map((q, qIndex) => (
// 						<div key={qIndex} className="border rounded p-3 mb-3 bg-light">
// 							<input
// 								type="text"
// 								className="form-control mb-2"
// 								placeholder={`Question ${qIndex + 1}`}
// 								value={q.question}
// 								onChange={(e) =>
// 									handleQuestionChange(qIndex, "question", e.target.value)
// 								}
// 							/>
// 							{q.options.map((opt, optIndex) => (
// 								<div key={optIndex} className="d-flex align-items-center mb-2">
// 									<input
// 										type="radio"
// 										className="form-check-input me-2"
// 										name={`correct-${qIndex}`}
// 										checked={q.correctAnswer === optIndex}
// 										onChange={() => handleCorrectAnswerChange(qIndex, optIndex)}
// 									/>
// 									<input
// 										type="text"
// 										className="form-control"
// 										placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
// 										value={opt}
// 										onChange={(e) =>
// 											handleOptionChange(qIndex, optIndex, e.target.value)
// 										}
// 									/>
// 								</div>
// 							))}
// 							<div className="mt-2">
// 								<label className="form-label mb-1">Marks</label>
// 								<input
// 									type="number"
// 									className="form-control"
// 									style={{ width: "120px" }}
// 									value={q.marks}
// 									onChange={(e) =>
// 										handleQuestionChange(qIndex, "marks", e.target.value)
// 									}
// 								/>
// 							</div>
// 						</div>
// 					))}

// 					<button className="btn btn-outline-primary" onClick={addQuestion}>
// 						+ Add Question
// 					</button>
// 				</div>

// 				{/* Footer */}
// 				<div className="p-3 border-top d-flex justify-content-end gap-2">
// 					<button className="btn btn-secondary" onClick={onClose}>
// 						Cancel
// 					</button>
// 					<button className="btn btn-dark" onClick={handleSubmit}>
// 						Create Assessment
// 					</button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }



import React, { useState } from "react";

export default function CreateAssessmentModal({ onClose, onCreate }) {
	const [title, setTitle] = useState("");
	const [type, setType] = useState("Technical");
	const [timeLimit, setTimeLimit] = useState(30);
	const [description, setDescription] = useState("");
	const [questions, setQuestions] = useState([
		{ question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 },
	]);

	const handleQuestionChange = (index, field, value) => {
		const updated = [...questions];
		if (field === "question") updated[index].question = value;
		if (field === "marks") updated[index].marks = value;
		setQuestions(updated);
	};

	const handleOptionChange = (qIndex, optIndex, value) => {
		const updated = [...questions];
		updated[qIndex].options[optIndex] = value;
		setQuestions(updated);
	};

	const handleCorrectAnswerChange = (qIndex, optIndex) => {
		const updated = [...questions];
		updated[qIndex].correctAnswer = optIndex;
		setQuestions(updated);
	};

	const addQuestion = () => {
		setQuestions([
			...questions,
			{ question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 },
		]);
	};

	const removeQuestion = (index) => {
		if (questions.length > 1) {
			const updated = questions.filter((_, i) => i !== index);
			setQuestions(updated);
		} else {
			alert("Assessment must have at least one question");
		}
	};

	const handleSubmit = () => {
		// Validate title
		if (!title.trim()) {
			alert("Please enter an assessment title");
			return;
		}
		
		// Validate time limit
		if (!timeLimit || timeLimit < 1) {
			alert("Please enter a valid time limit (at least 1 minute)");
			return;
		}
		
		// Validate questions
		if (questions.length === 0) {
			alert("Please add at least one question");
			return;
		}
		
		// Validate each question
		for (let i = 0; i < questions.length; i++) {
			const question = questions[i];
			
			if (!question.question.trim()) {
				alert(`Please enter text for Question ${i + 1}`);
				return;
			}
			
			// Check if all options are filled
			for (let j = 0; j < question.options.length; j++) {
				if (!question.options[j].trim()) {
					alert(`Please fill Option ${String.fromCharCode(65 + j)} for Question ${i + 1}`);
					return;
				}
			}
			
			if (!question.marks || question.marks < 1) {
				alert(`Please enter valid marks for Question ${i + 1} (at least 1)`);
				return;
			}
		}
		
		onCreate({
			title,
			type,
			timer: timeLimit,
			description,
			questions,
		});
	};

	return (
		<div
			className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
			style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
		>
			<div
				className="bg-white rounded-3 shadow-lg"
				style={{
					width: "600px",
					maxHeight: "90vh",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Header */}
				<div className="p-3 border-bottom d-flex justify-content-between align-items-center">
					<h5 className="m-0 fw-bold">Create New Assessment</h5>
					<button
						className="btn-close"
						onClick={onClose}
						aria-label="Close"
					></button>
				</div>

				{/* Body */}
				<div
					className="p-4 overflow-auto"
					style={{ flex: "1 1 auto", minHeight: 0 }}
				>
					{/* Row: Title, Type & Time */}
					<div className="row mb-3">
						<div className="col-6">
							<label className="form-label small text-muted mb-1">
								Assessment Title <span className="text-danger">*</span>
							</label>
							<input
								type="text"
								className="form-control"
								placeholder="e.g., JavaScript Fundamentals"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
							/>
						</div>
						<div className="col-3">
							<label className="form-label small text-muted mb-1">Type <span className="text-danger">*</span></label>
							<select
								className="form-select"
								value={type}
								onChange={(e) => setType(e.target.value)}
								required
							>
								<option value="Technical">Technical</option>
								<option value="Soft Skill">Soft Skill</option>
								<option value="General">General</option>
							</select>
						</div>
						<div className="col-3">
							<label className="form-label small text-muted mb-1">
								Time Limit (min) <span className="text-danger">*</span>
							</label>
							<input
								type="number"
								className="form-control"
								value={timeLimit}
								onChange={(e) => setTimeLimit(e.target.value)}
								min="1"
								required
							/>
						</div>
					</div>

					{/* Description */}
					<div className="mb-3">
						<label className="form-label small text-muted mb-1">
							Description
						</label>
						<textarea
							className="form-control"
							placeholder="Describe what this assessment covers..."
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					{/* Questions */}
					<h6 className="fw-semibold mb-3">Questions ({questions.length})</h6>

					{questions.map((q, qIndex) => (
						<div
							key={qIndex}
							className="border rounded-3 p-3 mb-3"
							style={{ background: "#f9fafb" }}
						>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<label className="form-label small text-muted mb-0">
									Question {qIndex + 1} <span className="text-danger">*</span>
								</label>
								<button
									type="button"
									className="btn btn-sm btn-outline-danger"
									onClick={() => removeQuestion(qIndex)}
									title="Remove Question"
									style={{ fontSize: "12px", padding: "2px 6px" }}
								>
									❌
								</button>
							</div>
							<input
								type="text"
								className="form-control mb-3"
								placeholder="Enter your question here..."
								value={q.question}
								onChange={(e) =>
									handleQuestionChange(qIndex, "question", e.target.value)
								}
								required
							/>
							<div className="row">
								{q.options.map((opt, optIndex) => (
									<div
										key={optIndex}
										className="col-6 mb-2 d-flex align-items-center"
									>
										<input
											type="radio"
											className="form-check-input me-2"
											name={`correct-${qIndex}`}
											checked={q.correctAnswer === optIndex}
											onChange={() =>
												handleCorrectAnswerChange(qIndex, optIndex)
											}
										/>
										<input
											type="text"
											className="form-control"
											placeholder={`Option ${String.fromCharCode(
												65 + optIndex
											)} *`}
											value={opt}
											onChange={(e) =>
												handleOptionChange(qIndex, optIndex, e.target.value)
											}
											required
										/>
									</div>
								))}
							</div>
							<div className="mt-2">
								<label className="form-label small text-muted mb-1">
									Marks <span className="text-danger">*</span>
								</label>
								<input
									type="number"
									className="form-control"
									style={{ width: "100px" }}
									value={q.marks}
									onChange={(e) =>
										handleQuestionChange(qIndex, "marks", e.target.value)
									}
									min="1"
									required
								/>
							</div>
						</div>
					))}

					<button
						className="btn btn-outline-primary w-100"
						onClick={addQuestion}
					>
						+ Add Question
					</button>
				</div>

				{/* Footer */}
				<div className="p-3 border-top d-flex justify-content-end gap-2">
					<button className="btn btn-light" onClick={onClose}>
						Cancel
					</button>
					<button className="btn btn-dark" onClick={handleSubmit}>
						Create Assessment
					</button>
				</div>
			</div>
		</div>
	);
}
