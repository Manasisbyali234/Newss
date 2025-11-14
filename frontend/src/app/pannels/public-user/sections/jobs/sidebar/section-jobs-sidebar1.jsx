
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../../globals/route-names";
import SectionSideAdvert from "./section-side-advert";
import { useState, useEffect } from "react";
import "../../../../../../custom-tags.css";
import "../../../../../../remove-tag-hover.css";

function SectionJobsSidebar1 ({ onFilterChange }) {
    const [jobTypes, setJobTypes] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        jobType: [],
        employmentType: '',
        jobTitle: '',
        skills: [],
        category: ''
    });

    const skillCategories = [
        'Developer',
        'Python',
        'React',
        'JavaScript',
        'Node.js',
        'Java',
        'Tester',
        'QA Engineer',
        'DevOps',
        'UI/UX Designer',
        'Data Analyst',
        'Machine Learning',
        'Angular',
        'Vue.js',
        'PHP',
        'C++',
        '.NET',
        'Mobile Developer',
        'Flutter',
        'React Native'
    ];

    useEffect(() => {
        fetchJobTypes();
        fetchJobTitles();
        fetchLocations();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=1000');
            const data = await response.json();
            if (data.success) {
                const categoryCounts = {};
                data.jobs.forEach(job => {
                    if (job.category) {
                        categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
                    }
                });
                
                // Add IT category if it doesn't exist
                if (!categoryCounts['IT']) {
                    categoryCounts['IT'] = 4; // Default count
                }
                
                setCategories(Object.entries(categoryCounts));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Set default categories
            setCategories([['IT', 4]]);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=1000');
            const data = await response.json();
            if (data.success) {
                const dbLocations = [...new Set(data.jobs.map(job => job.location))].filter(location => location).sort();
                
                // Add default locations if none exist
                const defaultLocations = ['Bangalore', 'Mumbai'];
                const allLocations = [...new Set([...dbLocations, ...defaultLocations])].sort();
                
                setLocations(allLocations);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            // Set default locations
            setLocations(['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune']);
        }
    };

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setFilters({...filters, location: value});
        setShowLocationSuggestions(value.length > 0);
    };

    const selectLocation = (location) => {
        setFilters({...filters, location});
        setShowLocationSuggestions(false);
    };

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const fetchJobTypes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=1000');
            const data = await response.json();
            if (data.success) {
                // Count job types
                const typeCounts = {};
                data.jobs.forEach(job => {
                    const type = job.jobType || 'Full-Time';
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                });
                
                // Add default job types if they don't exist
                const defaultTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];
                defaultTypes.forEach(type => {
                    if (!typeCounts[type]) {
                        typeCounts[type] = 0;
                    }
                });
                
                setJobTypes(Object.entries(typeCounts).filter(([type, count]) => count > 0));
            }
        } catch (error) {
            console.error('Error fetching job types:', error);
            // Set default job types
            setJobTypes([['Full-Time', 4], ['Part-Time', 0], ['Contract', 0], ['Internship', 0]]);
        }
    };

    const fetchJobTitles = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=1000');
            const data = await response.json();
            if (data.success) {
                const allKeywords = new Set();
                
                data.jobs.forEach(job => {
                    if (job.title) allKeywords.add(job.title);
                    if (job.requiredSkills && Array.isArray(job.requiredSkills)) {
                        job.requiredSkills.forEach(skill => allKeywords.add(skill));
                    }
                    if (job.description) {
                        const techWords = ['React', 'Angular', 'Vue', 'Node', 'Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'Laravel', 'Django', 'Spring', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'Bootstrap', 'jQuery', 'Express', 'API', 'REST', 'GraphQL', 'Redux', 'DevOps', 'Linux', 'Windows', 'iOS', 'Android', 'Flutter', 'React Native', 'Swift', 'Kotlin', 'C++', 'C#', '.NET', 'Ruby', 'Rails', 'Golang', 'Rust', 'Scala', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Jira', 'Figma', 'Photoshop', 'Illustrator', 'Unity', 'Salesforce', 'Tableau', 'Power BI', 'Excel', 'Machine Learning', 'AI', 'Data Science', 'Big Data', 'Cloud', 'Cybersecurity', 'Blockchain', 'UI', 'UX', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Web', 'Database', 'Testing', 'QA', 'Automation'];
                        techWords.forEach(word => {
                            if (job.description.toLowerCase().includes(word.toLowerCase())) {
                                allKeywords.add(word);
                            }
                        });
                    }
                });
                
                // Add default job titles if none exist
                const defaultTitles = ['Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'];
                defaultTitles.forEach(title => allKeywords.add(title));
                
                setJobTitles(Array.from(allKeywords).sort());
            }
        } catch (error) {
            console.error('Error fetching job titles:', error);
            // Set default job titles
            setJobTitles(['Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'UI/UX Designer']);
        }
    };

    return (
        <>
            <div className="side-bar">
                <div className="sidebar-elements search-bx">
                    <form>
                        <div className="form-group mb-4 position-relative">
                            <h4 className="section-head-small mb-4">Job Title ({jobTitles.length} available)</h4>
                            <div className="input-group" style={{background: 'transparent', border: 'none', boxShadow: 'none'}}>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search job title" 
                                    value={filters.keyword}
                                    onChange={(e) => {
                                        setFilters({...filters, keyword: e.target.value});
                                        setShowJobTitleSuggestions(e.target.value.length > 0);
                                    }}
                                    onFocus={() => setShowJobTitleSuggestions(filters.keyword.length > 0)}
                                    onBlur={() => setTimeout(() => setShowJobTitleSuggestions(false), 200)}
                                    style={{background: 'transparent', border: '1px solid #ddd'}}
                                />
                                <button className="btn" type="button" style={{background: 'transparent', border: '1px solid #ddd', borderLeft: 'none'}}><i className="feather-search" /></button>
                            </div>
                            {showJobTitleSuggestions && jobTitles.length > 0 && (
                                <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                                    {jobTitles
                                        .filter(title => title && title.toLowerCase().includes(filters.keyword.toLowerCase()))
                                        .slice(0, 10)
                                        .map((title) => (
                                            <div 
                                                key={title} 
                                                className="p-2 border-bottom cursor-pointer hover-bg-light"
                                                onClick={() => {
                                                    setFilters({...filters, keyword: title});
                                                    setShowJobTitleSuggestions(false);
                                                }}
                                                style={{cursor: 'pointer'}}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            >
                                                <i className="feather-briefcase me-2"></i>{title}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        <div className="form-group mb-4 position-relative">
                            <h4 className="section-head-small mb-4">Location ({locations.length} available)</h4>
                            <div className="input-group" style={{background: 'transparent', border: 'none', boxShadow: 'none'}}>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search location" 
                                    value={filters.location}
                                    onChange={handleLocationChange}
                                    onFocus={() => setShowLocationSuggestions(filters.location.length > 0)}
                                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                                    style={{background: 'transparent', border: '1px solid #ddd'}}
                                />
                                <button className="btn" type="button" style={{background: 'transparent', border: '1px solid #ddd', borderLeft: 'none'}}><i className="feather-map-pin" /></button>
                            </div>
                            {showLocationSuggestions && (
                                <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                                    {locations
                                        .filter(location => location.toLowerCase().includes(filters.location.toLowerCase()))
                                        .slice(0, 10)
                                        .map((location, index) => (
                                            <div 
                                                key={index} 
                                                className="p-2 border-bottom cursor-pointer hover-bg-light"
                                                onClick={() => selectLocation(location)}
                                                style={{cursor: 'pointer'}}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            >
                                                <i className="feather-map-pin me-2"></i>{location}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Job Type</h4>
                            <ul style={{listStyle: 'none', padding: 0}}>
                                <li style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id="jobTypeAll"
                                            name="jobType"
                                            value=""
                                            checked={!filters.jobType || filters.jobType.length === 0}
                                            onChange={() => setFilters({...filters, jobType: []})}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="jobTypeAll" style={{fontSize: '14px', color: '#333', fontWeight: (!filters.jobType || filters.jobType.length === 0) ? '600' : 'normal'}}>
                                            All Types
                                        </label>
                                    </div>
                                </li>
                                {jobTypes.length > 0 ? jobTypes.map(([type, count], index) => (
                                    <li key={type} style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div className="form-check" style={{margin: 0}}>
                                            <input 
                                                type="radio" 
                                                className="form-check-input" 
                                                id={`jobType${index}`}
                                                name="jobType"
                                                value={type}
                                                checked={filters.jobType.includes(type)}
                                                onChange={() => setFilters({...filters, jobType: [type]})}
                                                style={{marginRight: '8px'}}
                                            />
                                            <label className="form-check-label" htmlFor={`jobType${index}`} style={{fontSize: '14px', color: '#333', fontWeight: filters.jobType.includes(type) ? '600' : 'normal'}}>
                                                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                                            </label>
                                        </div>
                                        <span className="twm-job-type-count" style={{fontSize: '14px', color: '#000', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold'}}>{count}</span>
                                    </li>
                                )) : (
                                    <li style={{color: '#666', fontSize: '14px', padding: '10px 0'}}>Loading job types...</li>
                                )}
                            </ul>
                        </div>
                        
                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Skills & Technologies</h4>
                            <ul style={{maxHeight: '300px', overflowY: 'auto', listStyle: 'none', padding: 0}}>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id="skillAll"
                                            name="skills"
                                            value=""
                                            checked={!filters.skills || filters.skills.length === 0}
                                            onChange={() => setFilters({...filters, skills: []})}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="skillAll" style={{fontSize: '14px', color: '#333', fontWeight: (!filters.skills || filters.skills.length === 0) ? '600' : 'normal'}}>
                                            All Skills
                                        </label>
                                    </div>
                                </li>
                                {skillCategories.map((skill, index) => (
                                    <li key={skill} style={{marginBottom: '10px'}}>
                                        <div className="form-check" style={{margin: 0}}>
                                            <input 
                                                type="radio" 
                                                className="form-check-input" 
                                                id={`skill${index}`}
                                                name="skills"
                                                value={skill}
                                                checked={filters.skills.includes(skill)}
                                                onChange={() => setFilters({...filters, skills: [skill]})}
                                                style={{marginRight: '8px'}}
                                            />
                                            <label className="form-check-label" htmlFor={`skill${index}`} style={{fontSize: '14px', color: '#333', fontWeight: filters.skills.includes(skill) ? '600' : 'normal'}}>
                                                {skill}
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Type of employment</h4>
                            <ul>
                                <li>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id="AllEmployment" 
                                            name="employmentType"
                                            value=""
                                            checked={filters.employmentType === ''}
                                            onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor="AllEmployment">All Types</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id="Freelance1" 
                                            name="employmentType"
                                            value="freelance"
                                            checked={filters.employmentType === 'freelance'}
                                            onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor="Freelance1">Freelance</label>
                                    </div>
                                </li>

                                <li>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id="FullTime1" 
                                            name="employmentType"
                                            value="full-time"
                                            checked={filters.employmentType === 'full-time'}
                                            onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor="FullTime1">Full Time</label>
                                    </div>
                                </li>

                                <li>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id="Intership1" 
                                            name="employmentType"
                                            value="internship"
                                            checked={filters.employmentType === 'internship'}
                                            onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor="Intership1">Internship</label>
                                    </div>
                                </li>


                            </ul>
                        </div>
                        
                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Job Category</h4>
                            <ul style={{listStyle: 'none', padding: 0}}>
                                <li style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id="categoryAll"
                                            name="category"
                                            value=""
                                            checked={filters.category === ''}
                                            onChange={(e) => setFilters({...filters, category: e.target.value})}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="categoryAll" style={{fontSize: '14px', color: '#333', fontWeight: filters.category === '' ? '600' : 'normal'}}>
                                            All Categories
                                        </label>
                                    </div>
                                </li>
                                {categories.length > 0 ? categories.map(([category, count], index) => (
                                    <li key={category} style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div className="form-check" style={{margin: 0}}>
                                            <input 
                                                type="radio" 
                                                className="form-check-input" 
                                                id={`category${index}`}
                                                name="category"
                                                value={category}
                                                checked={filters.category === category}
                                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                                                style={{marginRight: '8px'}}
                                            />
                                            <label className="form-check-label" htmlFor={`category${index}`} style={{fontSize: '14px', color: '#333', fontWeight: filters.category === category ? '600' : 'normal'}}>
                                                {category}
                                            </label>
                                        </div>
                                        <span className="twm-job-type-count" style={{fontSize: '14px', color: '#000', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold'}}>{count}</span>
                                    </li>
                                )) : (
                                    <li style={{color: '#666', fontSize: '14px', padding: '10px 0'}}>Loading categories...</li>
                                )}
                            </ul>
                        </div>



                        <div className="form-group mt-4">
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary btn-sm w-100"
                                onClick={() => {
                                    setFilters({
                                        keyword: '',
                                        location: '',
                                        jobType: [],
                                        employmentType: '',
                                        jobTitle: '',
                                        skills: [],
                                        category: ''
                                    });
                                    setShowLocationSuggestions(false);
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="widget tw-sidebar-tags-wrap">
                    <h4 className="section-head-small mb-4">Tags</h4>
                    <div className="tagcloud">
                        {['General', 'Jobs', 'Payment', 'Application', 'Work', 'Recruiting', 'Employer', 'Income', 'Tips'].map(tag => (
                            <a 
                                key={tag}
                                href="#" 
                                className={`tag-link ${filters.keyword === tag ? 'active' : ''}`}
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    if (filters.keyword === tag) {
                                        // If clicking the same tag, clear the filter
                                        setFilters({...filters, keyword: ''});
                                    } else {
                                        // Set the new tag filter
                                        setFilters({...filters, keyword: tag});
                                    }
                                }}
                                style={{
                                    backgroundColor: filters.keyword === tag ? '#1967d2' : '',
                                    color: filters.keyword === tag ? 'white' : '',
                                    fontWeight: filters.keyword === tag ? 'bold' : 'normal'
                                }}
                            >
                                {tag}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            {/* <SectionSideAdvert />    */}
        </>
    )
}

export default SectionJobsSidebar1;
