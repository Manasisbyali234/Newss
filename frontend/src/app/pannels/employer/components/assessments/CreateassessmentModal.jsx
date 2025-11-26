import React, { useState, useEffect, useMemo } from "react";
import showToast from "../../../../../utils/toastNotification";
import './CreateassessmentModal.css';
import { disableBodyScroll, enableBodyScroll } from "../../../../../utils/scrollUtils";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function CreateAssessmentModal({ onClose, onCreate, editData = null }) {
	const [title, setTitle] = useState(editData?.title || "");
	const [type, setType] = useState(editData?.type || "Technical");
	const [timeLimit, setTimeLimit] = useState(editData?.timer || 30);
	const [description, setDescription] = useState(editData?.description || "");
	const [questions, setQuestions] = useState(
		editData?.questions || [{ question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: 0, marks: 1 }]
	);
	const [isMinimized, setIsMinimized] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);

	const quillModules = useMemo(() => ({
		toolbar: [
			[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
			[{ 'font': [] }],
			[{ 'size': ['small', false, 'large', 'huge'] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ 'color': [] }, { 'background': [] }],
			[{ 'script': 'sub' }, { 'script': 'super' }],
			[{ 'list': 'ordered' }, { 'list': 'bullet' }],
			[{ 'indent': '-1' }, { 'indent': '+1' }],
			[{ 'align': [] }],
			['blockquote', 'code-block'],
			['link', 'image'],
			['clean']
		]
	}), []);

	const quillFormats = [
		'header', 'font', 'size',
		'bold', 'italic', 'underline', 'strike',
		'color', 'background',
		'script',
		'list', 'bullet', 'indent',
		'align',
		'blockquote', 'code-block',
		'link', 'image'
	];

	useEffect(() => {
		disableBodyScroll();
		return () => enableBodyScroll();
	}, []);

	const handleQuestionChange = (index, field, value) => {
		const updated = [...questions];
		if (field === "question") updated[index].question = value;
		if (field === "marks") updated[index].marks = value;
		if (field === "type") {
			updated[index].type = value;
			if (value === "subjective" || value === "upload") {
				updated[index].options = [];
				updated[index].correctAnswer = null;
			} else {
				updated[index].options = ["", "", "", ""];
				updated[index].correctAnswer = 0;
			}
		}
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
			{ question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: 0, marks: 1 },
		]);
	};

	const removeQuestion = (index) => {
		if (questions.length > 1) {
			const updated = questions.filter((_, i) => i !== index);
			setQuestions(updated);
		} else {
			showToast("Assessment must have at least one question", 'warning');
		}
	};

	const handleMinimize = () => {
		if (isMaximized) setIsMaximized(false);
		setIsMinimized(!isMinimized);
	};

	const handleMaximize = () => {
		if (isMinimized) setIsMinimized(false);
		setIsMaximized(!isMaximized);
	};

	const handleSubmit = (isDraft = false) => {
		if (!isDraft) {
			if (!title.trim()) {
				showToast("Please enter an assessment title", 'warning');
				return;
			}
			
			if (!timeLimit || timeLimit < 1) {
				showToast("Please enter a valid time limit (at least 1 minute)", 'warning');
				return;
			}
			
			if (questions.length === 0) {
				showToast("Please add at least one question", 'warning');
				return;
			}
			
			for (let i = 0; i < questions.length; i++) {
				const question = questions[i];
				
				if (!question.question.trim()) {
					showToast(`Please enter text for Question ${i + 1}`, 'warning');
					return;
				}
				
				if (question.type === "mcq") {
					for (let j = 0; j < question.options.length; j++) {
						if (!question.options[j].trim()) {
							showToast(`Please fill Option ${String.fromCharCode(65 + j)} for Question ${i + 1}`, 'warning');
							return;
						}
					}
					
					if (question.correctAnswer === null || question.correctAnswer === undefined) {
						showToast(`Please select the correct answer for Question ${i + 1}`, 'warning');
						return;
					}
				}
				
				if (!question.marks || question.marks < 1) {
					showToast(`Please enter valid marks for Question ${i + 1} (at least 1)`, 'warning');
					return;
				}
			}
		}
		
		onCreate({
			id: editData?._id,
			title,
			type,
			timer: timeLimit,
			description,
			questions,
			status: isDraft ? 'draft' : 'published'
		});
	};

	return (
		<div
			className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center"
			style={{ 
				background: isMinimized ? "transparent" : "rgba(0,0,0,0.5)", 
				zIndex: 1050,
				alignItems: isMinimized ? "flex-end" : "center",
				padding: isMinimized ? "0 0 20px 0" : "0"
			}}
		>
			<div
				className="bg-white rounded-3 shadow-lg"
				style={{
					width: isMaximized ? "100vw" : isMinimized ? "400px" : "600px",
					height: isMaximized ? "100vh" : isMinimized ? "60px" : "auto",
					maxHeight: isMaximized ? "100vh" : isMinimized ? "60px" : "90vh",
					minHeight: isMinimized ? "60px" : "auto",
					display: "flex",
					flexDirection: "column",
					transition: "all 0.3s ease",
					overflow: isMinimized ? "hidden" : "visible",
					position: isMaximized ? "fixed" : "relative",
					top: isMaximized ? "0" : "auto",
					left: isMaximized ? "0" : "auto",
					zIndex: isMaximized ? "9999" : "1050",
					borderRadius: isMaximized ? "0" : "12px",
					boxShadow: isMinimized ? "0 -2px 10px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.15)",
				}}
			>
				<div className="p-3 d-flex justify-content-between align-items-center" style={{ borderBottom: isMinimized ? 'none' : '1px solid #e5e7eb' }}>
					<h5 className="m-0 fw-bold">{editData ? 'Edit Assessment' : 'Create New Assessment'}</h5>
					<div className="d-flex gap-1">
						<button
							type="button"
							style={{
								background: 'none',
								border: 'none',
								width: '20px',
								height: '20px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								color: '#6c757d',
								fontSize: '14px'
							}}
							onClick={handleMinimize}
							title="Minimize"
						>
							−
						</button>
						<button
							type="button"
							style={{
								background: 'none',
								border: 'none',
								width: '20px',
								height: '20px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								color: '#6c757d',
								fontSize: '14px'
							}}
							onClick={handleMaximize}
							title={isMaximized ? "Restore" : "Maximize"}
						>
							{isMaximized ? '❐' : '□'}
						</button>
						<button
							type="button"
							style={{
								background: 'none',
								border: 'none',
								width: '20px',
								height: '20px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								color: '#6c757d',
								fontSize: '14px'
							}}
							onClick={() => { enableBodyScroll(); onClose(); }}
							title="Close"
						>
							×
						</button>
					</div>
				</div>

				{!isMinimized && (
				<div
					className="p-4 overflow-auto"
					style={{ flex: "1 1 auto", minHeight: 0 }}
				>
					<div className="mb-3">
						<label className="form-label small text-muted mb-2">
							Assessment Title
						</label>
						<input
							type="text"
							className="form-control"
							placeholder="e.g., JavaScript Fundamentals"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>

					<div className="row mb-3">
						<div className="col-6">
							<label className="form-label small text-muted mb-2">Type</label>
							<select
								className="form-select"
								value={type}
								onChange={(e) => setType(e.target.value)}
							>
								<option value="Technical">Technical</option>
								<option value="Soft Skill">Soft Skill</option>
								<option value="General">General</option>
							</select>
						</div>
						<div className="col-6">
							<label className="form-label small text-muted mb-2">
								Time Limit (min)
							</label>
							<input
								type="number"
								className="form-control"
								value={timeLimit}
								onChange={(e) => setTimeLimit(e.target.value)}
								min="1"
							/>
						</div>
					</div>

					<div className="mb-4">
						<label className="form-label small text-muted mb-2">
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

					<h6 className="fw-semibold mb-3 mt-2">Questions ({questions.length})</h6>

					{questions.map((q, qIndex) => (
						<div
							key={qIndex}
							className="border rounded-3 p-3 mb-4"
							style={{ background: "#f9fafb" }}
						>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<label className="form-label small text-muted mb-0 fw-semibold">
									Question {qIndex + 1}
								</label>
								<div className="d-flex gap-2">
									<select
										className="form-select form-select-sm"
										value={q.type}
										onChange={(e) => handleQuestionChange(qIndex, "type", e.target.value)}
										style={{ width: "120px", fontSize: "12px" }}
									>
										<option value="mcq">MCQ</option>
										<option value="subjective">Subjective</option>
										<option value="upload">Upload</option>
									</select>
									<button
										type="button"
										className="btn btn-sm btn-outline-danger"
										onClick={() => removeQuestion(qIndex)}
										title="Remove Question"
										style={{ fontSize: "12px", padding: "2px 6px" }}
									>
										Remove
									</button>
								</div>
							</div>
							<ReactQuill
								theme="snow"
								value={q.question || ''}
								onChange={(value) => handleQuestionChange(qIndex, "question", value)}
								modules={quillModules}
								formats={quillFormats}
								placeholder="Enter your question here..."
								style={{ marginBottom: '1rem' }}
							/>
							{q.type === "mcq" ? (
								<>
									<div style={{
										background: '#e3f2fd',
										border: '1px solid #2196f3',
										borderRadius: 6,
										padding: '8px 12px',
										marginBottom: 12,
										display: 'flex',
										alignItems: 'center',
										gap: 8
									}}>
										<i className="fa fa-info-circle" style={{color: '#2196f3', fontSize: 14}}></i>
										<small style={{color: '#1565c0', fontSize: 12, margin: 0}}>
											Select the correct answer by clicking the radio button next to the option
										</small>
									</div>
									<div className="row mb-3">
										{q.options.map((opt, optIndex) => (
										<div
											key={optIndex}
											className="col-6 mb-3 d-flex align-items-center"
										>
											<input
												type="radio"
												name={`correct-${qIndex}`}
												checked={q.correctAnswer === optIndex}
												onChange={() =>
													handleCorrectAnswerChange(qIndex, optIndex)
												}
												style={{ 
													width: "18px", 
													height: "18px", 
													marginRight: "8px",
													flexShrink: 0,
													appearance: "auto"
												}}
											/>
											<input
												type="text"
												className="form-control"
												placeholder={`Option ${String.fromCharCode(
													65 + optIndex
												)}`}
												value={opt}
												onChange={(e) =>
													handleOptionChange(qIndex, optIndex, e.target.value)
												}
											/>
										</div>
										))}
									</div>
								</>
							) : q.type === "upload" ? (
								<div className="mb-3">
									<small className="text-muted">This is an upload question. Candidates will upload files as their answer.</small>
									<div className="mt-2 p-2 border rounded" style={{backgroundColor: '#f8f9fa'}}>
										<small className="text-info">📎 Accepted file types: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</small>
									</div>
								</div>
							) : (
								<div className="mb-3">
									<small className="text-muted">This is a subjective question. Candidates will provide written answers.</small>
								</div>
							)}
							<div className="row">
								<div className="col-6">
									<label className="form-label small text-muted mb-1">Marks</label>
									<input
										type="number"
										className="form-control"
										value={q.marks}
										onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value) || 1)}
										min="1"
									/>
								</div>
							</div>
						</div>
					))}

					<button
						type="button"
						className="btn btn-outline-primary btn-sm mb-4"
						onClick={addQuestion}
					>
						+ Add Question
					</button>
				</div>
				)}

				{!isMinimized && (
				<div className="p-3 border-top d-flex justify-content-end gap-2">
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={() => handleSubmit(true)}
					>
						Save as Draft
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => { enableBodyScroll(); onClose(); }}
					>
						Cancel
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => handleSubmit(false)}
					>
						{editData ? 'Update Assessment' : 'Create Assessment'}
					</button>
				</div>
				)}
			</div>
		</div>
	);
}