import React, { useEffect } from 'react';
import { disableBodyScroll, enableBodyScroll } from '../../../../utils/scrollUtils';

const TermsModal = ({ isOpen, onAccept, onDecline, assessment }) => {
    useEffect(() => {
        if (isOpen) {
            disableBodyScroll();
        } else {
            enableBodyScroll();
        }
        return () => enableBodyScroll();
    }, [isOpen]);

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

                            <div className="mb-3">
                                <h6>Legal Compliance and Jurisdiction</h6>
                                <p>All users of TaleGlobal including employers, candidates, consultancies, and placement officers agree to comply with all applicable laws, regulations, and guidelines in force in India, including but not limited to: Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; Digital Personal Data Protection Act, 2023; Indian Contract Act, 1872; Right to Privacy as enshrined under Article 21 of the Constitution of India; Applicable Employment, Labour, and Anti-Discrimination Laws of India; UGC and AICTE Guidelines governing campus placements and institutional data management.</p>
                                <p>TaleGlobal operates solely as a digital intermediary within the meaning of Section 2(1)(w) of the Information Technology Act, 2000 and shall not be deemed to create any employment, partnership, or agency relationship with any user.</p>
                                <p>Any dispute, claim, or controversy arising out of or in connection with these Terms, the Privacy Policy, or use of the platform shall be governed exclusively by the laws of India. The parties agree that the courts at Bengaluru, Karnataka, shall have exclusive jurisdiction to adjudicate all such disputes.</p>
                            </div>

                            <div className="mb-3">
                                <h6>Privacy Policy</h6>
                                <p>TaleGlobal is committed to protecting the privacy, security, and lawful use of personal information entrusted to it by all individuals using its website and services. By creating an account, accessing, or using the TaleGlobal platform, you expressly acknowledge that you have read, understood, and agree to be bound by this Privacy Policy and consent to the collection and use of your personal data as set out herein in accordance with the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000, and other applicable laws of India.</p>
                            </div>

                            <div className="mb-3">
                                <h6>Disclaimer and Limitation of Liability</h6>
                                <p>TaleGlobal functions solely as a digital recruitment intermediary and does not guarantee employment, selection, job placement, or any hiring outcome. TaleGlobal shall not be held liable for any hiring decisions, rejections, delayed offers, job cancellations, or any consequential, indirect, emotional, reputational, or financial loss arising out of or in connection with the use of the platform. TaleGlobal provides all services on an "as is" and "as available" basis, without any express or implied warranties.</p>
                            </div>

                            <div className="mb-3">
                                <h6>Legal Validity and Governing Law</h6>
                                <p>This Disclaimer and all related Terms and Conditions shall be governed by and construed in accordance with the laws of India. Users agree that any dispute, claim, or controversy arising from or relating to the use of the TaleGlobal platform, these Terms, or this Disclaimer shall be subject to the exclusive jurisdiction of the competent courts at Bengaluru, Karnataka, India. The invalidity or unenforceability of any provision of this Disclaimer shall not affect the validity of the remaining provisions, which shall remain in full force and effect.</p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={() => { enableBodyScroll(); onDecline(); }}
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: '#6c757d',
                                color: '#6c757d'
                            }}
                        >
                            Decline & Exit
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary px-4"
                            onClick={() => { enableBodyScroll(); onAccept(); }}
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: '#ff6b35',
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