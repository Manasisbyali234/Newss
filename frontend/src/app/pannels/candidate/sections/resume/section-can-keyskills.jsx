import { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
function SectionCanKeySkills({ profile }) {
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [customSkill, setCustomSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);

    const predefinedSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala',
        'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Bootstrap', 'jQuery', 'Next.js', 'Nuxt.js', 'Tailwind CSS', 'Material UI', 'Redux', 'Svelte',
        'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'Redis', 'Firebase', 'Cassandra', 'DynamoDB',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'Terraform', 'Ansible', 'CI/CD', 'GitLab', 'GitHub Actions',
        'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'FastAPI',
        'React Native', 'Flutter', 'Ionic', 'Xamarin', 'Android', 'iOS',
        'GraphQL', 'REST API', 'Microservices', 'WebSockets', 'gRPC',
        'Selenium', 'Cypress', 'Jest', 'Mocha', 'Pytest', 'JUnit', 'Postman',
        'Linux', 'Unix', 'Windows Server', 'Shell Scripting', 'PowerShell',
        'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Trello',
        'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
        'Salesforce', 'SAP', 'ServiceNow', 'Workday',
        'Power BI', 'Tableau', 'Excel', 'Google Analytics', 'Looker',
        'Hadoop', 'Spark', 'Kafka', 'Airflow', 'ETL',
        'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
        'Blockchain', 'Ethereum', 'Solidity', 'Web3',
        'Penetration Testing', 'Ethical Hacking', 'OWASP', 'Security Auditing',
        'Project Management', 'Team Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
        'Data Analysis', 'Business Analysis', 'Financial Analysis', 'Marketing', 'Sales', 'Accounting',
        'Digital Marketing', 'Content Writing', 'SEO', 'Social Media Marketing', 'Email Marketing', 'PPC',
        'Software Testing', 'Quality Assurance', 'System Administration', 'Network Administration',
        'Cybersecurity', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Deep Learning', 'NLP', 'Computer Vision'
    ];

    useEffect(() => {
        setSkills(profile?.skills || []);
    }, [profile]);

    const addSkill = async (skillToAdd) => {
        if (!skillToAdd || skills.includes(skillToAdd)) return;
        
        setLoading(true);
        try {
            const updatedSkills = [...skills, skillToAdd];
            const response = await api.updateCandidateProfile({ skills: updatedSkills });
            if (response.success) {
                setSkills(updatedSkills);
                setSelectedSkill('');
                setCustomSkill('');
                setShowCustomInput(false);
                showSuccess(`Skill "${skillToAdd}" added successfully!`);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            showError('Failed to add skill');
        } finally {
            setLoading(false);
        }
    };

    const removeSkill = async (skillToRemove) => {
        setLoading(true);
        try {
            const updatedSkills = skills.filter(skill => skill !== skillToRemove);
            const response = await api.updateCandidateProfile({ skills: updatedSkills });
            if (response.success) {
                setSkills(updatedSkills);
                showSuccess(`Skill "${skillToRemove}" removed successfully!`);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            showError('Failed to remove skill');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFromDropdown = () => {
        if (selectedSkill) {
            addSkill(selectedSkill);
        }
    };

    const handleAddCustom = () => {
        if (customSkill.trim()) {
            addSkill(customSkill.trim());
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 d-flex justify-content-between align-items-center">
                <h4 className="panel-tittle m-a0">
                    Key Skills
                </h4>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-12 col-md-8 mb-2">
                                <label><i className="fa fa-cogs me-1"></i> Select a skill from list</label>
                                <select 
                                    className="form-control"
                                    value={selectedSkill}
                                    onChange={(e) => setSelectedSkill(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Select a skill from list</option>
                                    {predefinedSkills.filter(skill => !skills.includes(skill)).map(skill => (
                                        <option key={skill} value={skill}>{skill}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-4 d-flex align-items-end">
                                <button 
                                    type="button"
                                    className="btn btn-outline-primary w-100"
                                    onClick={handleAddFromDropdown}
                                    disabled={!selectedSkill || loading}
                                    style={{backgroundColor: 'transparent'}}
                                >
                                    <i className="fa fa-plus me-1"></i>
                                    Add Skill
                                </button>
                            </div>
                        </div>
                        
                        {showCustomInput && (
                            <div className="row mt-3">
                                <div className="col-12 col-md-8 mb-2">
                                    <label><i className="fa fa-keyboard me-1"></i> Enter custom skill</label>
                                    <input 
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter your custom skill"
                                        value={customSkill}
                                        onChange={(e) => setCustomSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                                        autoFocus
                                    />
                                </div>
                                <div className="col-12 col-md-4 d-flex gap-2">
                                    <button 
                                        className="btn btn-outline-primary flex-fill"
                                        onClick={handleAddCustom}
                                        disabled={!customSkill.trim() || loading}
                                        style={{backgroundColor: 'transparent'}}
                                    >
                                        <i className="fa fa-check me-1"></i>
                                        Add
                                    </button>
                                    <button 
                                        className="btn btn-secondary flex-fill"
                                        onClick={() => {setShowCustomInput(false); setCustomSkill('');}}
                                    >
                                        <i className="fa fa-times me-1"></i>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="text-left mt-4">
                            <button 
                                type="button" 
                                onClick={() => setShowCustomInput(true)}
                                className="btn btn-outline-primary" 
                                disabled={loading || showCustomInput}
                                style={{backgroundColor: 'transparent'}}
                            >
                                <i className="fa fa-keyboard me-1"></i>
                                Add Custom Skill
                            </button>
                        </div>

                        {skills.length > 0 ? (
                            <div className="mt-4">
                                <label><i className="fa fa-tags me-1"></i> Your Skills</label>
                                <style>{`
                                    @media (max-width: 576px) {
                                        .skill-badge {
                                            font-size: 11px !important;
                                            padding: 5px 8px !important;
                                            max-width: fit-content !important;
                                            width: auto !important;
                                        }
                                        .skill-badge .skill-text {
                                            overflow: hidden;
                                            text-overflow: ellipsis;
                                            white-space: nowrap;
                                            max-width: calc(100vw - 120px);
                                        }
                                        .skill-badge .btn-sm {
                                            width: 10px !important;
                                            height: 10px !important;
                                            font-size: 7px !important;
                                        }
                                    }
                                `}</style>
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {skills.map((skill, index) => (
                                        <span key={index} className="badge bg-light skill-badge" style={{fontSize: '13px', padding: '8px 12px', borderRadius: '20px', color: '#333', border: '1px solid #ddd', display: 'inline-flex', alignItems: 'center', flexDirection: 'row'}}>
                                            <i className="fa fa-tag me-2" style={{color: '#0056b3', fontSize: '11px', flexShrink: 0}}></i>
                                            <span className="skill-text" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{skill}</span>
                                            <button 
                                                className="btn btn-sm ms-2 p-0"
                                                style={{background: 'none', border: 'none', color: '#dc3545', fontSize: '12px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}
                                                onClick={() => removeSkill(skill)}
                                                disabled={loading}
                                                title="Remove skill"
                                            >
                                                <i className="fa fa-times"></i>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 text-center py-3">
                                <i className="fa fa-info-circle text-muted mb-2" style={{fontSize: '20px'}}></i>
                                <p className="text-muted mb-0">No skills added yet. Select from the list above or add custom skills.</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </>
    )
}
export default SectionCanKeySkills;
