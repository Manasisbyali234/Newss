import React from 'react';

const TermsModal = ({ isOpen, onAccept, onDecline, assessment }) => {
    if (!isOpen) return null;
    const timeLimit = assessment?.timer ?? assessment?.timeLimit ?? '--';

    return (
        <div className="modal fade twm-model-popup show" id="termsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-hidden="false" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Assessment Terms & Conditions</h5>
                    </div>

                    <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <div className="terms-content">
                            <h6><strong>Assessment Rules & Guidelines</strong></h6>

                            <div className="mb-3">
                                <h6>Time Limit</h6>
                                <p>You have <strong>{timeLimit} minutes</strong> to complete this assessment. The timer will start once you begin the assessment.</p>
                            </div>

                            <div className="mb-3">
                                <h6>Assessment Integrity</h6>
                                <ul>
                                    <li>You must complete the assessment in one continuous session</li>
                                    <li>Switching browser tabs will result in immediate termination</li>
                                    <li>Minimizing the browser window will result in immediate termination</li>
                                    <li>Using Alt+Tab or other window switching will result in immediate termination</li>
                                    <li>Right-clicking is disabled during the assessment</li>
                                    <li>Copy-paste functionality is disabled during the assessment</li>
                                </ul>
                            </div>

                            <div className="mb-3">
                                <h6>Violation Consequences</h6>
                                <ul>
                                    <li><strong>Tab Switch:</strong> Assessment will be terminated immediately</li>
                                    <li><strong>Window Minimize/Blur:</strong> Assessment will be terminated immediately</li>
                                    <li><strong>Right Click:</strong> Assessment will be terminated immediately</li>
                                    <li><strong>Copy/Paste Attempt:</strong> Assessment will be terminated immediately</li>
                                    <li><strong>Time Expiration:</strong> Assessment will auto-submit with current answers</li>
                                </ul>
                            </div>

                            <div className="mb-3">
                                <h6>Technical Requirements</h6>
                                <ul>
                                    <li>Use a stable internet connection</li>
                                    <li>Ensure your browser is up to date</li>
                                    <li>Close all unnecessary applications</li>
                                    <li>Do not refresh the page during the assessment</li>
                                </ul>
                            </div>

                            <div className="mb-3">
                                <h6>Important Notes</h6>
                                <ul>
                                    <li>All violations are logged with timestamps</li>
                                    <li>Once terminated, the assessment cannot be resumed</li>
                                    <li>Your progress will be saved only upon successful completion</li>
                                    <li>Ensure you have answered all questions before submitting</li>
                                </ul>
                            </div>

                            <div className="alert alert-warning mt-4">
                                <strong>Warning:</strong> By proceeding with this assessment, you agree to abide by all the rules stated above. Any violation will result in immediate termination of your assessment.
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onDecline}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #6c757d',
                                color: '#6c757d'
                            }}
                        >
                            Decline & Exit
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onAccept}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #ff6b35',
                                color: '#ff6b35'
                            }}
                        >
                            I Accept - Start Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;