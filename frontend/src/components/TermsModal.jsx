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
                { heading: 'Registration and Profile Creation', content: 'Candidates must register using accurate, complete, and verifiable personal, educational, and professional details. All profiles, resumes, and supporting information submitted on the platform must be truthful. Any misrepresentation, falsification, or omission may result in immediate disqualification and permanent suspension of the account. By registering, candidates acknowledge that such registration constitutes a valid electronic agreement under Section 10A of the Information Technology Act, 2000 and that they consent to the lawful processing of their data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act).' },
                { heading: 'Application and Fees', content: 'TaleGlobal operates on a pay-per-application system, where a nominal, non-refundable processing fee is charged per job application. The fee is collected solely to maintain platform functionality, verification, and digital-interview infrastructure and shall not be construed as a fee for employment or placement services. Once payment is made, no refund shall be permitted under any circumstances, regardless of interview outcome or employer decision. Candidates are responsible for ensuring stable internet access and device readiness during online interviews. TaleGlobal is not liable for disruptions caused by user connectivity or technical limitations.' },
                { heading: 'Conduct', content: 'Candidates must maintain professional etiquette, punctuality, and decorum throughout all stages of the recruitment process conducted through TaleGlobal. Use of abusive language, impersonation, unauthorized recording, or sharing of interview content is strictly prohibited and may lead to account suspension and legal consequences under the Information Technology Act, 2000. Any misuse of the platform, attempt to manipulate results, or unethical activity shall result in immediate termination of access without refund.' },
                { heading: 'Data and Privacy', content: 'Candidate data shall be shared only with verified employers, consultancies, or institutions registered on the TaleGlobal platform for legitimate recruitment purposes. TaleGlobal complies with the Digital Personal Data Protection Act, 2023, Information Technology Act, 2000, and the IT (Data Protection) Rules 2011 to ensure confidentiality, lawful processing, and secure storage of personal data. Candidates retain rights of access, correction, and erasure of their personal data in accordance with applicable privacy laws and may contact the designated Grievance Officer for any related concerns.' },
                { heading: 'Liability', content: 'TaleGlobal acts solely as an online intermediary connecting candidates with verified employers and does not guarantee interviews, employment, or offer letters. TaleGlobal shall not be liable for any act, omission, or representation made by employers, consultancies, or placement officers, nor for any loss financial, professional, or reputational arising from platform usage. In no event shall TaleGlobal\'s aggregate liability exceed the total fee paid by the candidate for the specific application that gave rise to such claim.' }
            ]
        },
        candidateProfile: {
            title: 'Terms & Conditions for Candidates',
            sections: [
                { heading: 'Registration and Profile Creation', content: 'Candidates must register using accurate, complete, and verifiable personal, educational, and professional details. All profiles, resumes, and supporting information submitted on the platform must be truthful. Any misrepresentation, falsification, or omission may result in immediate disqualification and permanent suspension of the account. By registering, candidates acknowledge that such registration constitutes a valid electronic agreement under Section 10A of the Information Technology Act, 2000 and that they consent to the lawful processing of their data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act).' },
                { heading: 'Application and Fees', content: 'TaleGlobal operates on a pay-per-application system, where a nominal, non-refundable processing fee is charged per job application. The fee is collected solely to maintain platform functionality, verification, and digital-interview infrastructure and shall not be construed as a fee for employment or placement services. Once payment is made, no refund shall be permitted under any circumstances, regardless of interview outcome or employer decision. Candidates are responsible for ensuring stable internet access and device readiness during online interviews. TaleGlobal is not liable for disruptions caused by user connectivity or technical limitations.' },
                { heading: 'Conduct', content: 'Candidates must maintain professional etiquette, punctuality, and decorum throughout all stages of the recruitment process conducted through TaleGlobal. Use of abusive language, impersonation, unauthorized recording, or sharing of interview content is strictly prohibited and may lead to account suspension and legal consequences under the Information Technology Act, 2000. Any misuse of the platform, attempt to manipulate results, or unethical activity shall result in immediate termination of access without refund.' },
                { heading: 'Data and Privacy', content: 'Candidate data shall be shared only with verified employers, consultancies, or institutions registered on the TaleGlobal platform for legitimate recruitment purposes. TaleGlobal complies with the Digital Personal Data Protection Act, 2023, Information Technology Act, 2000, and the IT (Data Protection) Rules 2011 to ensure confidentiality, lawful processing, and secure storage of personal data. Candidates retain rights of access, correction, and erasure of their personal data in accordance with applicable privacy laws and may contact the designated Grievance Officer for any related concerns.' },
                { heading: 'Liability', content: 'TaleGlobal acts solely as an online intermediary connecting candidates with verified employers and does not guarantee interviews, employment, or offer letters. TaleGlobal shall not be liable for any act, omission, or representation made by employers, consultancies, or placement officers, nor for any loss financial, professional, or reputational arising from platform usage. In no event shall TaleGlobal\'s aggregate liability exceed the total fee paid by the candidate for the specific application that gave rise to such claim.' }
            ]
        },
        employer: {
            title: 'Terms & Conditions for Employers',
            sections: [
                { heading: 'Registration and Verification', content: 'Employers must complete the mandatory TaleGlobal verification process prior to posting any job openings. Verification shall include submission of valid business registration certificates, GSTIN, PAN, and other business identity proofs as may be required under the Information Technology Act, 2000 and applicable labour and tax laws. TaleGlobal reserves the right to seek additional documents or conduct background checks to ensure authenticity. Only verified employers shall be permitted to post job listings on the platform. The act of registration constitutes a valid and binding electronic agreement under Section 10A of the Information Technology Act, 2000.' },
                { heading: 'Job Posting and Process', content: 'Each job listing must accurately specify the job title, eligibility criteria, remuneration or compensation (if applicable), interview schedule, and selection process. Employers must declare the expected timeline for issuing offer letters and adhere to the same to maintain process transparency. Job postings shall be genuine, lawful, and compliant with employment and labour regulations, including those relating to equal opportunity and non-discrimination. TaleGlobal reserves the right to moderate, suspend, or remove any job listing that is false, misleading, discriminatory, or otherwise violates these Terms or any applicable law. Posting of fraudulent, deceptive, or unverifiable job listings shall attract immediate suspension and may invite civil or criminal proceedings.' }
            ]
        },
        employerProfile: {
            title: 'Terms & Conditions for Employers',
            sections: [
                { heading: 'Registration and Verification', content: 'Employers must complete the mandatory TaleGlobal verification process prior to posting any job openings. Verification shall include submission of valid business registration certificates, GSTIN, PAN, and other business identity proofs as may be required under the Information Technology Act, 2000 and applicable labour and tax laws. TaleGlobal reserves the right to seek additional documents or conduct background checks to ensure authenticity. Only verified employers shall be permitted to post job listings on the platform. TaleGlobal may suspend or cancel access if verification information is found to be false, incomplete, or misleading. The act of registration constitutes a valid and binding electronic agreement under Section 10A of the Information Technology Act, 2000, confirming the employer\'s acceptance of these Terms and Conditions.' },
                { heading: 'Job Posting and Process', content: 'Each job listing must accurately specify the job title, eligibility criteria, remuneration or compensation (if applicable), interview schedule, and selection process. Employers must declare the expected timeline for issuing offer letters and adhere to the same to maintain process transparency. Job postings shall be genuine, lawful, and compliant with employment and labour regulations, including those relating to equal opportunity and non-discrimination. TaleGlobal reserves the right to moderate, suspend, or remove any job listing that is false, misleading, discriminatory, or otherwise violates these Terms or any applicable law. Employers acknowledge that TaleGlobal functions solely as an intermediary platform and bears no responsibility for the accuracy, outcome, or fulfillment of any employment contract arising from such postings. Posting of fraudulent, deceptive, or unverifiable job listings shall attract immediate suspension and may invite civil or criminal proceedings under the Information Technology Act, 2000, BNS, and other applicable laws.' }
            ]
        },
        placement: {
            title: 'Terms & Conditions for Placement Officers',
            sections: [
                { heading: 'Registration and Verification', content: 'Placement Officers must provide valid institutional credentials and official contact information. Your account will be verified before activation to ensure authenticity. Registration constitutes a legally binding electronic agreement under applicable laws.' },
                { heading: 'Student Data Management', content: 'You are responsible for the accuracy of student data uploaded to the platform. Student information must be uploaded with proper consent from students and the institution. All data must comply with UGC and AICTE guidelines governing campus placements.' },
                { heading: 'Credit Allocation', content: 'Credits allocated to students are managed by your institution. You are responsible for fair distribution of credits among students. Credit usage and allocation must be transparent and documented.' },
                { heading: 'Data Privacy', content: 'You must comply with data protection regulations when handling student information. Student data should only be used for placement purposes. Unauthorized sharing or commercial use of student data is strictly prohibited.' }
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
                            Please read and accept the following terms and conditions before proceeding with your registration.
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
