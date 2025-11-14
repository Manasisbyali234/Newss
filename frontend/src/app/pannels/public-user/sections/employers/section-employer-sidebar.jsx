import { useState, useEffect, useMemo } from "react";

function SectionEmployerSidebar({ onFilterChange }) {
    const [industries, setIndustries] = useState([]);
    const [locations, setLocations] = useState([]);
    const [companyTypes, setCompanyTypes] = useState([]);
    const [establishedYears, setEstablishedYears] = useState([]);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        industry: '',
        teamSize: '',
        companyType: '',
        establishedSince: ''
    });

    // Predefined team size options - matching employer profile page
    const teamSizeOptions = useMemo(() => [
        '1-10',
        '11-50', 
        '51-200',
        '201-500',
        '501-1000',
        '1000+'
    ], []);

    useEffect(() => {
        fetchEmployerData();
    }, []);

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const fetchEmployerData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/employers');
            const data = await response.json();
            if (data.success) {
                const industrySet = new Set();
                const locationSet = new Set();
                const companyTypeSet = new Set();
                const establishedYearSet = new Set();

                data.employers.forEach(emp => {
                    // Extract industry from both industrySector and industry fields
                    const industry = emp.profile?.industrySector || emp.profile?.industry;
                    if (industry && industry !== 'Various Industries') {
                        industrySet.add(industry);
                    }
                    
                    // Extract location from both corporateAddress and location fields
                    const location = emp.profile?.corporateAddress || emp.profile?.location;
                    if (location && location !== 'Multiple Locations') {
                        locationSet.add(location);
                    }
                    
                    // Extract company type
                    if (emp.profile?.companyType) {
                        companyTypeSet.add(emp.profile.companyType);
                    }
                    
                    // Extract established year
                    const establishedYear = emp.establishedSince || emp.profile?.establishedSince;
                    if (establishedYear && establishedYear !== 'Not specified') {
                        establishedYearSet.add(establishedYear);
                    }
                });

                setIndustries(Array.from(industrySet).sort());
                setLocations(Array.from(locationSet).sort());
                setCompanyTypes(Array.from(companyTypeSet).sort());
                setEstablishedYears(Array.from(establishedYearSet).sort((a, b) => b - a));
            }
        } catch (error) {
            console.error('Error fetching employer data:', error);
        }
    };

    return (
        <div className="side-bar">
            <div className="sidebar-elements search-bx">
                <form>
                    <div className="form-group mb-4">
                        <h4 className="section-head-small mb-4">Company Name</h4>
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search company" 
                                value={filters.keyword}
                                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                            />
                            <button className="btn" type="button"><i className="feather-search" /></button>
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <h4 className="section-head-small mb-4">Location</h4>
                        <select 
                            className="form-control"
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                        >
                            <option value="">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="twm-sidebar-ele-filter">
                        <h4 className="section-head-small mb-4">Industry</h4>
                        <ul>
                            <li>
                                <div className="form-check">
                                    <input 
                                        type="radio" 
                                        className="form-check-input" 
                                        id="allIndustry"
                                        name="industry"
                                        value=""
                                        checked={filters.industry === ''}
                                        onChange={(e) => setFilters({...filters, industry: e.target.value})}
                                    />
                                    <label className="form-check-label" htmlFor="allIndustry">All Industries</label>
                                </div>
                            </li>
                            {industries.map((industry, index) => (
                                <li key={industry}>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id={`industry${index}`}
                                            name="industry"
                                            value={industry}
                                            checked={filters.industry === industry}
                                            onChange={(e) => setFilters({...filters, industry: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor={`industry${index}`}>
                                            {industry}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="twm-sidebar-ele-filter">
                        <h4 className="section-head-small mb-4">Team Size</h4>
                        <ul>
                            <li>
                                <div className="form-check">
                                    <input 
                                        type="radio" 
                                        className="form-check-input" 
                                        id="allTeamSize"
                                        name="teamSize"
                                        value=""
                                        checked={filters.teamSize === ''}
                                        onChange={(e) => setFilters({...filters, teamSize: e.target.value})}
                                    />
                                    <label className="form-check-label" htmlFor="allTeamSize">All Sizes</label>
                                </div>
                            </li>
                            {teamSizeOptions.map((size) => (
                                <li key={`teamsize-${size}`}>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id={`teamSize-${size}`}
                                            name="teamSize"
                                            value={size}
                                            checked={filters.teamSize === size}
                                            onChange={(e) => setFilters({...filters, teamSize: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor={`teamSize-${size}`}>
                                            {size}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="twm-sidebar-ele-filter">
                        <h4 className="section-head-small mb-4">Company Type</h4>
                        <ul>
                            <li>
                                <div className="form-check">
                                    <input 
                                        type="radio" 
                                        className="form-check-input" 
                                        id="allCompanyType"
                                        name="companyType"
                                        value=""
                                        checked={filters.companyType === ''}
                                        onChange={(e) => setFilters({...filters, companyType: e.target.value})}
                                    />
                                    <label className="form-check-label" htmlFor="allCompanyType">All Types</label>
                                </div>
                            </li>
                            {companyTypes.map((type, index) => (
                                <li key={type}>
                                    <div className="form-check">
                                        <input 
                                            type="radio" 
                                            className="form-check-input" 
                                            id={`companyType${index}`}
                                            name="companyType"
                                            value={type}
                                            checked={filters.companyType === type}
                                            onChange={(e) => setFilters({...filters, companyType: e.target.value})}
                                        />
                                        <label className="form-check-label" htmlFor={`companyType${index}`}>
                                            {type}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="form-group mb-4">
                        <h4 className="section-head-small mb-4">Established Since</h4>
                        <select 
                            className="form-control"
                            value={filters.establishedSince}
                            onChange={(e) => setFilters({...filters, establishedSince: e.target.value})}
                        >
                            <option value="">All Years</option>
                            {establishedYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group mt-4">
                        <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm w-100"
                            onClick={() => setFilters({
                                keyword: '',
                                location: '',
                                industry: '',
                                teamSize: '',
                                companyType: '',
                                establishedSince: ''
                            })}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SectionEmployerSidebar;
