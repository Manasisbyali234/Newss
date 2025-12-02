import React, { useState, useEffect } from 'react';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose, onAccept, role = 'candidate' }) => {
    const [hasScrolled, setHasScrolled] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHasScrolled(false);
            setAccepted(false);
        }
    }, [isOpen]);

    const handleScroll = (e) => {
        const element = e.target;
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
        if (isAtBottom && !hasScrolled) {
            setHasScrolled(true);
        }
    };

    const handleAccept = () => {
        if (accepted && hasScrolled) {
            onAccept();
        }
    };

    const termsContent = {
        candidate: {
            title: 'Terms & Conditions for Candidates',
            sections: [
                { heading: 'Account Registration', content: 'You must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials.' },
                { heading: 'Profile Information', content: 'You agree to keep your profile information up-to-date and accurate. False information may result in account suspension.' },
                { heading: 'Job Applications', content: 'You may apply to jobs using the credits provided. Each application consumes credits as specified on the platform.' },
                { heading: 'Code of Conduct', content: 'You agree to maintain professional conduct in all communications with employers and placement officers.' },
                { heading: 'Data Usage', content: 'Your profile data may be shared with potential employers when you apply for jobs. We will not share your data without your consent.' },
                { heading: 'Account Termination', content: 'We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities.' }
            ]
        },
        employer: {
            title: 'Terms & Conditions for Employers',
            sections: [
                { heading: 'Company Verification', content: 'You must provide accurate company information. Your account will be reviewed and approved by our admin team before activation.' },
                { heading: 'Job Postings', content: 'All job postings must be legitimate and comply with employment laws. Misleading job descriptions may result in account suspension.' },
                { heading: 'Candidate Data', content: 'You agree to use candidate information solely for recruitment purposes. Misuse of candidate data is strictly prohibited.' },
                { heading: 'Payment & Fees', content: 'You agree to pay applicable fees for premium services as per the pricing structure displayed on the platform.' },
                { heading: 'Professional Conduct', content: 'You must maintain professional standards in all interactions with candidates and respond to applications in a timely manner.' },
                { heading: 'Account Suspension', content: 'We reserve the right to suspend accounts that violate these terms, post fraudulent jobs, or engage in discriminatory practices.' }
            ]
        },
        placement: {
            title: 'Terms & Conditions for Placement Officers',
            sections: [
                { heading: 'Institution Verification', content: 'You must provide valid institutional credentials and official contact information. Your account will be verified before activation.' },
                { heading: 'Student Data Management', content: 'You are responsible for the accuracy of student data uploaded to the platform. Student information must be uploaded with proper consent.' },
                { heading: 'Credit Allocation', content: 'Credits allocated to students are managed by your institution. You are responsible for fair distribution of credits among students.' },
                { heading: 'Data Privacy', content: 'You must comply with data protection regulations when handling student information. Student data should only be used for placement purposes.' },
                { heading: 'Institutional Responsibility', content: 'You represent your institution and must maintain professional standards in all platform activities.' },
                { heading: 'Account Access', content: 'Your account access may be revoked if institutional verification fails or if terms are violated.' }
            ]
        },
        employerProfile: {
            title: 'Company Profile Submission Terms & Conditions',
            sections: [
                { heading: 'Information Accuracy', content: 'You certify that all information provided in your company profile is accurate, complete, and up-to-date. Any false or misleading information may result in account suspension or termination.' },
                { heading: 'Document Verification', content: 'All uploaded documents (PAN, GST, CIN, authorization letters, etc.) must be authentic and legally valid. We reserve the right to verify these documents with relevant authorities.' },
                { heading: 'Profile Review Process', content: 'Your profile will be reviewed by our admin team. Approval is not guaranteed and may take 2-5 business days. You will be notified via email once your profile is approved or if additional information is required.' },
                { heading: 'Data Usage & Privacy', content: 'The information you provide will be used for verification purposes and may be displayed to candidates. We will handle your data in accordance with our privacy policy and applicable data protection laws.' },
                { heading: 'Profile Updates', content: 'You are responsible for keeping your profile information current. Any material changes to your company details must be updated promptly and may require re-verification.' },
                { heading: 'Compliance & Legal', content: 'You agree to comply with all applicable employment laws, anti-discrimination regulations, and platform policies. Violation of these terms may result in immediate account suspension and legal action if necessary.' }
            ]
        }
    };

    const content = termsContent[role] || termsContent.candidate;

    if (!isOpen) return null;

    return (
        <div className="terms-modal-overlay">
            <div className="terms-modal">
                <div className="terms-modal-header">
                    <h2>{content.title}</h2>
                    <button className="terms-close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="terms-modal-body" onScroll={handleScroll}>
                    <div className="terms-content">
                        <p className="terms-intro">
                            {role === 'employerProfile' 
                                ? 'Please read and accept the following terms and conditions before submitting your company profile for review.'
                                : 'Please read and accept the following terms and conditions before proceeding with your registration.'}
                        </p>
                        
                        {content.sections.map((section, index) => (
                            <div key={index} className="terms-section">
                                <h3>{index + 1}. {section.heading}</h3>
                                <p>{section.content}</p>
                            </div>
                        ))}

                        <div className="terms-section">
                            <h3>{content.sections.length + 1}. Acceptance of Terms</h3>
                            <p>
                                By checking the acceptance box and clicking "Accept & Continue", you acknowledge that you have read, 
                                understood, and agree to be bound by these terms and conditions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="terms-modal-footer">
                    <div className="terms-checkbox-wrapper">
                        <input
                            type="checkbox"
                            id="terms-accept"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            disabled={!hasScrolled}
                        />
                        <label htmlFor="terms-accept">
                            I have read and accept the terms and conditions
                            {!hasScrolled && <span className="scroll-hint"> (Please scroll to the bottom)</span>}
                        </label>
                    </div>
                    
                    <div className="terms-actions">
                        <button className="terms-btn terms-btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            className="terms-btn terms-btn-accept" 
                            onClick={handleAccept}
                            disabled={!accepted || !hasScrolled}
                        >
                            Accept & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
