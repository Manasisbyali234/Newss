import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaClock } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../../../utils/api";
import TermsModal from "../components/TermsModal";
import ViolationModal from "../components/ViolationModal";
import AssessmentTerminated from "../components/AssessmentTerminated";

const ASSESSMENT_SESSION_KEY = 'candidateCurrentAssessment';
const ASSESSMENT_ATTEMPT_KEY = 'candidateCurrentAssessmentAttempt';

const StartAssessment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const navigationState = location.state || {};

    const getSessionInfo = () => {
        const params = new URLSearchParams(location.search);
        let stored = {};
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                stored = JSON.parse(window.sessionStorage.getItem(ASSESSMENT_SESSION_KEY) || '{}');
            } catch (err) {
                stored = {};
            }
        }
        return {
            assessmentId: navigationState.assessmentId || params.get('assessmentId') || stored.assessmentId || null,
            jobId: navigationState.jobId || params.get('jobId') || stored.jobId || null,
            applicationId: navigationState.applicationId || params.get('applicationId') || stored.applicationId || null
        };
    };

    const [sessionInfo, setSessionInfo] = useState(getSessionInfo);
    const { assessmentId, jobId, applicationId } = sessionInfo;

    // Assessment state
    const [assessment, setAssessment] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        setSessionInfo(getSessionInfo());
    }, [location.search, location.state]);

    useEffect(() => {
        if (assessmentId && jobId && applicationId && typeof window !== 'undefined' && window.sessionStorage) {
            try {
                window.sessionStorage.setItem(ASSESSMENT_SESSION_KEY, JSON.stringify({ assessmentId, jobId, applicationId }));
            } catch (err) {}
        }
    }, [assessmentId, jobId, applicationId]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                const savedAttemptId = window.sessionStorage.getItem(ASSESSMENT_ATTEMPT_KEY);
                if (savedAttemptId) {
                    setAttemptId(savedAttemptId);
                }
            } catch (err) {}
        }
    }, []);

    const clearStoredAssessment = useCallback(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                window.sessionStorage.removeItem(ASSESSMENT_SESSION_KEY);
                window.sessionStorage.removeItem(ASSESSMENT_ATTEMPT_KEY);
            } catch (err) {}
        }
        setAttemptId(null);
    }, []);

    // Security and modal state
    const [assessmentState, setAssessmentState] = useState('not_started'); // not_started, terms_pending, in_progress, terminated, completed
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [currentViolation, setCurrentViolation] = useState(null);
    const [isTerminated, setIsTerminated] = useState(false);
    const [terminationReason, setTerminationReason] = useState(null);
    const [terminationTimestamp, setTerminationTimestamp] = useState(null);

    // Refs for event listeners
    const assessmentContainerRef = useRef(null);
    const visibilityChangeListener = useRef(null);
    const blurListener = useRef(null);
    const focusListener = useRef(null);
    const contextMenuListener = useRef(null);
    const copyListener = useRef(null);
    const pasteListener = useRef(null);

    // Violation detection functions
    const logViolation = useCallback(async (violationType, details = '') => {
        if (!attemptId || assessmentState !== 'in_progress') return;

        try {
            const timestamp = new Date().toISOString();
            const response = await api.logAssessmentViolation({
                attemptId,
                violationType,
                timestamp,
                details
            });

            if (response.success) {
                const terminatingViolations = ['tab_switch', 'window_blur', 'right_click', 'copy_attempt'];
                if (terminatingViolations.includes(violationType)) {
                    setTerminationReason(violationType);
                    setTerminationTimestamp(timestamp);
                    setIsTerminated(true);
                    setAssessmentState('terminated');
                    removeSecurityListeners();
                    clearStoredAssessment();
                }
            }
        } catch (error) {
            console.error('Failed to log violation:', error);
        }
    }, [attemptId, assessmentState]);

    const handleVisibilityChange = useCallback(() => {
        if (document.hidden && assessmentState === 'in_progress') {
            logViolation('tab_switch', 'User switched browser tabs');
            setCurrentViolation({
                type: 'tab_switch',
                timestamp: new Date()
            });
            setShowViolationModal(true);
        }
    }, [assessmentState, logViolation]);

    const handleWindowBlur = useCallback(() => {
        if (assessmentState === 'in_progress') {
            logViolation('window_blur', 'Browser window lost focus');
            setCurrentViolation({
                type: 'window_blur',
                timestamp: new Date()
            });
            setShowViolationModal(true);
        }
    }, [assessmentState, logViolation]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        if (assessmentState === 'in_progress') {
            logViolation('right_click', 'Right-click attempted');
            setCurrentViolation({
                type: 'right_click',
                timestamp: new Date()
            });
            setShowViolationModal(true);
        }
    }, [assessmentState, logViolation]);

    const handleCopy = useCallback((e) => {
        if (assessmentState === 'in_progress') {
            e.preventDefault();
            logViolation('copy_attempt', 'Copy action attempted');
            setCurrentViolation({
                type: 'copy_attempt',
                timestamp: new Date()
            });
            setShowViolationModal(true);
        }
    }, [assessmentState, logViolation]);

    const handlePaste = useCallback((e) => {
        if (assessmentState === 'in_progress') {
            e.preventDefault();
            logViolation('copy_attempt', 'Paste action attempted');
            setCurrentViolation({
                type: 'copy_attempt',
                timestamp: new Date()
            });
            setShowViolationModal(true);
        }
    }, [assessmentState, logViolation]);

    // Security listeners management
    const addSecurityListeners = useCallback(() => {
        if (assessmentState !== 'in_progress') return;

        // Tab/window visibility change
        visibilityChangeListener.current = handleVisibilityChange;
        document.addEventListener('visibilitychange', visibilityChangeListener.current);

        // Window blur/focus
        blurListener.current = handleWindowBlur;
        window.addEventListener('blur', blurListener.current);

        // Right-click prevention
        contextMenuListener.current = handleContextMenu;
        document.addEventListener('contextmenu', contextMenuListener.current);

        // Copy-paste prevention
        copyListener.current = handleCopy;
        document.addEventListener('copy', copyListener.current);

        pasteListener.current = handlePaste;
        document.addEventListener('paste', pasteListener.current);
    }, [assessmentState, handleVisibilityChange, handleWindowBlur, handleContextMenu, handleCopy, handlePaste]);

    const removeSecurityListeners = useCallback(() => {
        if (visibilityChangeListener.current) {
            document.removeEventListener('visibilitychange', visibilityChangeListener.current);
        }
        if (blurListener.current) {
            window.removeEventListener('blur', blurListener.current);
        }
        if (contextMenuListener.current) {
            document.removeEventListener('contextmenu', contextMenuListener.current);
        }
        if (copyListener.current) {
            document.removeEventListener('copy', copyListener.current);
        }
        if (pasteListener.current) {
            document.removeEventListener('paste', pasteListener.current);
        }
    }, []);

	useEffect(() => {
		if (!assessmentId || !jobId || !applicationId) {
			setError("Missing assessment information. Please go back and try again.");
			clearStoredAssessment();
			setLoading(false);
			return;
		}

		fetchAssessment();
	}, [assessmentId, jobId, applicationId]);

	// Add security listeners when assessment starts
	useEffect(() => {
		if (assessmentState === 'in_progress') {
			addSecurityListeners();
		} else {
			removeSecurityListeners();
		}

		return () => {
			removeSecurityListeners();
		};
	}, [assessmentState, addSecurityListeners, removeSecurityListeners]);

	// Timer effect with violation logging for time expiration
	useEffect(() => {
		if (timeLeft > 0 && !isSubmitted && assessmentState === 'in_progress') {
			const timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						handleTimeExpired();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [timeLeft, isSubmitted, assessmentState]);

	const fetchAssessment = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch assessment questions first (without starting attempt)
			const assessmentResponse = await api.getAssessmentForCandidate(assessmentId);
			if (assessmentResponse.success) {
				const assessmentData = assessmentResponse.assessment;
				setAssessment(assessmentData);
				setAnswers(new Array(assessmentData.questions.length).fill(null));
				setAssessmentState('terms_pending');
				setShowTermsModal(true);
			} else {
				setError("Failed to load assessment questions");
			}
		} catch (err) {
			console.error("Error fetching assessment:", err);
			setError("Failed to load assessment. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleTermsAccept = async () => {
		try {
			setShowTermsModal(false);

			const startResponse = await api.startAssessment({
				assessmentId,
				jobId,
				applicationId
			});

			if (startResponse.success && startResponse.attempt && startResponse.attempt._id) {
				setAttemptId(startResponse.attempt._id);
				if (typeof window !== 'undefined' && window.sessionStorage) {
					try {
						window.sessionStorage.setItem(ASSESSMENT_ATTEMPT_KEY, startResponse.attempt._id);
					} catch (err) {}
				}
				setStartTime(new Date());
				const timerSeconds = Number(assessment?.timer || 0) * 60;
				setTimeLeft(timerSeconds);
				setAssessmentState('in_progress');
				setError(null);
			} else {
				setError(startResponse.message || "Failed to start assessment. No attempt ID received.");
				setShowTermsModal(true);
				setAssessmentState('terms_pending');
			}
		} catch (err) {
			console.error("Error starting assessment:", err);
			setError("Failed to start assessment. Please try again.");
			setShowTermsModal(true);
			setAssessmentState('terms_pending');
		}
	};

	const handleTermsDecline = () => {
		setShowTermsModal(false);
		clearStoredAssessment();
		navigate(-1);
	};

	const handleViolationAcknowledge = () => {
		setShowViolationModal(false);
		// Assessment is already terminated, component will show termination screen
	};

	const handleTimeExpired = async () => {
		if (!isSubmitted) {
			setIsSubmitted(true);
			await logViolation('time_expired', 'Assessment time expired');
			const success = await submitAssessment();
			if (!success) {
				setIsSubmitted(false);
			}
		}
	};

	const submitAssessment = async () => {
		if (!attemptId) {
			setError("Assessment session not started. Please restart the assessment.");
			setShowTermsModal(true);
			setAssessmentState('terms_pending');
			return false;
		}
		try {
			const submitResponse = await api.submitAssessment(attemptId, []);
			if (submitResponse.success) {
				setAssessmentState('completed');
				removeSecurityListeners();
				clearStoredAssessment();
				navigate("/candidate/assessment-result", {
					state: {
						result: submitResponse.result,
						assessment: assessment
					},
				});
				return true;
			}
			setError("Failed to submit assessment");
			return false;
		} catch (err) {
			console.error("Error submitting assessment:", err);
			setError("Failed to submit assessment");
			return false;
		}
	};

	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	};

	const handleOptionChange = async (option) => {
		if (isSubmitted) return;
		if (!attemptId) return;

		const updated = [...answers];
		updated[currentQuestionIndex] = option;
		setAnswers(updated);

		try {
			await api.submitAnswer(attemptId, currentQuestionIndex, option, 0);
		} catch (err) {
			console.error("Error submitting answer:", err);
			if (err.message.includes('404') || err.message.includes('not found')) {
				setError("Assessment session expired. Please restart the assessment.");
			}
		}
	};

	const handleSubmit = async () => {
		if (isSubmitted) return;
		setIsSubmitted(true);
		const success = await submitAssessment();
		if (!success) {
			setIsSubmitted(false);
		}
	};

	if (loading) {
		return (
			<div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
				<div style={{ fontSize: "18px", marginBottom: "20px" }}>Loading Assessment...</div>
				<div style={{ fontSize: "16px", color: "#666" }}>Please wait while we prepare your assessment.</div>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
				<div style={{ fontSize: "18px", color: "#e74c3c", marginBottom: "20px" }}>Error</div>
				<div style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>{error}</div>
				<button
					onClick={() => navigate("/candidate/status")}
					style={{
						background: "#3498db",
						color: "#fff",
						border: "none",
						padding: "10px 20px",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					Back to Status
				</button>
			</div>
		);
	}

	if (assessmentState === 'terminated') {
		return (
			<AssessmentTerminated
				violationType={terminationReason}
				violationTimestamp={terminationTimestamp}
				assessmentTitle={assessment?.title}
			/>
		);
	}

	if (!assessment) {
		return (
			<div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
				<div style={{ fontSize: "18px", color: "#e74c3c" }}>Assessment Not Found</div>
			</div>
		);
	}

	const question = assessment.questions[currentQuestionIndex];

	return (
		<>
			<TermsModal
				isOpen={showTermsModal}
				onAccept={handleTermsAccept}
				onDecline={handleTermsDecline}
				assessment={assessment}
			/>
			<ViolationModal
				isOpen={showViolationModal}
				violationType={currentViolation?.type}
				timestamp={currentViolation?.timestamp}
				onAcknowledge={handleViolationAcknowledge}
			/>
			<div
				ref={assessmentContainerRef}
				style={{
					padding: "20px",
					fontFamily: "Arial, sans-serif",
					backgroundColor: "#f5f6fa",
					minHeight: "100vh",
				}}
			>
				<div style={{ maxWidth: "900px", margin: "0 auto" }}>
				{/* Title Bar */}
				<div
					style={{
						background: "#fff",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
						marginBottom: "15px",
					}}
				>
					<h2 style={{ margin: "0", fontSize: "20px", fontWeight: "bold" }}>
						{assessment.title}
					</h2>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginTop: "10px",
							alignItems: "center",
						}}
					>
						<div style={{ fontSize: "14px", color: "#555" }}>
							Progress:{" "}
							{Math.round(
								((currentQuestionIndex + 1) / assessment.questions.length) * 100
							)}
							% complete
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								fontWeight: "bold",
								color: "#e74c3c",
							}}
						>
							<FaClock style={{ marginRight: "5px" }} />
							{formatTime(timeLeft)}
						</div>
					</div>
					{/* Progress Bar */}
					<div
						style={{
							height: "6px",
							background: "#e0e0e0",
							borderRadius: "3px",
							marginTop: "10px",
						}}
					>
						<div
							style={{
								width: `${
									((currentQuestionIndex + 1) / assessment.questions.length) *
									100
								}%`,
								height: "100%",
								background: "#2c3e50",
								borderRadius: "3px",
							}}
						></div>
					</div>
				</div>

				{/* Question Card */}
				<div
					style={{
						background: "#fff",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
					}}
				>
					<div
						style={{
							marginBottom: "10px",
							fontSize: "16px",
							fontWeight: "bold",
						}}
					>
						{currentQuestionIndex + 1}. {question.question}
					</div>
					<div style={{ display: "flex", flexDirection: "column" }}>
						{question.options.map((option, idx) => (
							<label
								key={idx}
								style={{
									border:
										answers[currentQuestionIndex] === option
											? "2px solid #3498db"
											: "1px solid #ccc",
									borderRadius: "5px",
									padding: "10px",
									marginBottom: "8px",
									cursor: isSubmitted ? "not-allowed" : "pointer",
									backgroundColor:
										answers[currentQuestionIndex] === option
											? "#ecf6fd"
											: "#fff",
									display: "flex",
									alignItems: "center",
								}}
							>
								<input
									type="radio"
									name={`q-${currentQuestionIndex}`}
									value={option}
									checked={answers[currentQuestionIndex] === option}
									onChange={() => handleOptionChange(option)}
									disabled={isSubmitted}
									style={{ marginRight: "10px" }}
								/>
								{option}
							</label>
						))}
					</div>

					{/* Navigation */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginTop: "20px",
							alignItems: "center",
						}}
					>
						{/* Left side - Previous button */}
						<button
							onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
							disabled={currentQuestionIndex === 0 || isSubmitted}
							style={{
								background: "transparent",
								border: "1px solid #ccc",
								padding: "8px 15px",
								borderRadius: "5px",
								cursor:
									currentQuestionIndex === 0 || isSubmitted
										? "not-allowed"
										: "pointer",
							}}
						>
							← Previous
						</button>

						{/* Center - Question Navigator */}
						<div style={{ display: "flex", gap: "5px" }}>
							{assessment.questions.map((_, idx) => (
								<button
									key={idx}
									onClick={() => setCurrentQuestionIndex(idx)}
									disabled={isSubmitted}
									style={{
										padding: "5px 10px",
										borderRadius: "4px",
										border:
											idx === currentQuestionIndex ? "none" : "1px solid #ccc",
										background:
											idx === currentQuestionIndex ? "#3498db" : "#fff",
										color: idx === currentQuestionIndex ? "#fff" : "#000",
										cursor: isSubmitted ? "not-allowed" : "pointer",
									}}
								>
									{idx + 1}
								</button>
							))}
						</div>

						{/* Right side - Next/Submit buttons */}
						<div style={{ display: "flex", gap: "10px" }}>
							{currentQuestionIndex < assessment.questions.length - 1 ? (
								<button
									onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
									disabled={isSubmitted}
									style={{
										background: "#3498db",
										color: "#fff",
										border: "none",
										padding: "8px 15px",
										borderRadius: "5px",
										cursor: isSubmitted ? "not-allowed" : "pointer",
									}}
								>
									Next →
								</button>
							) : null}
							<button
								onClick={handleSubmit}
								disabled={isSubmitted}
								style={{
									background: "#2ecc71",
									color: "#fff",
									border: "none",
									padding: "8px 15px",
									borderRadius: "5px",
									cursor: isSubmitted ? "not-allowed" : "pointer",
								}}
							>
								Submit Assessment
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
);
};

export default StartAssessment;
