import { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";
import showToast from "../../../../../utils/toastNotification";

function SectionCanKeySkills({ profile }) {
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [customSkill, setCustomSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);

    const predefinedSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
        'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Bootstrap', 'jQuery',
        'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'Redis',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
        'Project Management', 'Team Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
        'Data Analysis', 'Business Analysis', 'Financial Analysis', 'Marketing', 'Sales', 'Accounting',
        'Digital Marketing', 'Content Writing', 'SEO', 'Social Media Marketing',
        'Software Testing', 'Quality Assurance', 'System Administration', 'Network Administration',
        'Cybersecurity', 'Data Science', 'Machine Learning', 'Artificial Intelligence'
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
                showToast(`Skill "${skillToAdd}" added successfully!`, 'success', 4000);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            showToast('Failed to add skill', 'error', 4000);
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
                showToast(`Skill "${skillToRemove}" removed successfully!`, 'success', 4000);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            showToast('Failed to remove skill', 'error', 4000);
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
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">
                    Key Skills
                </h4>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-md-8">
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
                            <div className="col-md-4 d-flex align-items-end">
                                <button 
                                    type="button"
                                    className="btn btn-outline-primary me-2"
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
                                <div className="col-md-8">
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
                                <div className="col-md-4 d-flex align-items-end">
                                    <button 
                                        className="btn btn-outline-primary me-2"
                                        onClick={handleAddCustom}
                                        disabled={!customSkill.trim() || loading}
                                        style={{backgroundColor: 'transparent'}}
                                    >
                                        <i className="fa fa-check me-1"></i>
                                        Add
                                    </button>
                                    <button 
                                        className="btn btn-secondary"
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
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {skills.map((skill, index) => (
                                        <span key={index} className="badge bg-light d-flex align-items-center" style={{fontSize: '13px', padding: '8px 12px', borderRadius: '20px', color: '#333', border: '1px solid #ddd'}}>
                                            <i className="fa fa-tag me-2" style={{color: '#0056b3', fontSize: '11px'}}></i>
                                            {skill}
                                            <button 
                                                className="btn btn-sm ms-2 p-0"
                                                style={{background: 'none', border: 'none', color: '#dc3545', fontSize: '12px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
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
