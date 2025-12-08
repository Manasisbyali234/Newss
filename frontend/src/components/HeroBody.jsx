import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroBody.css';
import { FaBriefcase, FaCalculator, FaCode, FaUsers } from 'react-icons/fa';

const HeroBody = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    what: '',
    category: '',
    type: '',
    location: ''
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({
    what: '',
    category: '',
    type: '',
    location: ''
  });
  const [touched, setTouched] = useState({
    what: false,
    category: false,
    type: false,
    location: false
  });

  const locations = [
    'Agra', 'Ahmedabad', 'Ajmer', 'Aligarh', 'Allahabad', 'Amritsar', 'Aurangabad', 'Bangalore', 'Bareilly', 'Belgaum',
    'Bhopal', 'Bhubaneswar', 'Bikaner', 'Bilaspur', 'Chandigarh', 'Chennai', 'Coimbatore', 'Cuttack', 'Dehradun', 'Delhi',
    'Dhanbad', 'Durgapur', 'Erode', 'Faridabad', 'Firozabad', 'Ghaziabad', 'Gorakhpur', 'Gulbarga', 'Guntur', 'Gurgaon',
    'Guwahati', 'Gwalior', 'Hubli', 'Hyderabad', 'Indore', 'Jabalpur', 'Jaipur', 'Jalandhar', 'Jammu', 'Jamnagar',
    'Jamshedpur', 'Jodhpur', 'Kanpur', 'Kochi', 'Kolhapur', 'Kolkata', 'Kota', 'Kozhikode', 'Kurnool', 'Lucknow',
    'Ludhiana', 'Madurai', 'Mangalore', 'Meerut', 'Moradabad', 'Mumbai', 'Mysore', 'Nagpur', 'Nashik', 'Nellore',
    'New Delhi', 'Noida', 'Patna', 'Pondicherry', 'Pune', 'Raipur', 'Rajkot', 'Ranchi', 'Salem', 'Sangli',
    'Shimla', 'Siliguri', 'Solapur', 'Srinagar', 'Surat', 'Thiruvananthapuram', 'Thrissur', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur',
    'Udaipur', 'Ujjain', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam', 'Warangal', 'Remote', 'Work From Home'
  ];

  // Validation functions
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'category':
        // Category is optional, no validation needed
        break;
      case 'what':
        if (value && value.length < 2) {
          error = 'Job title must be at least 2 characters';
        } else if (value && value.length > 100) {
          error = 'Job title must not exceed 100 characters';
        } else if (value && !/^[a-zA-Z0-9\s/\-().&+,]+$/.test(value)) {
          error = 'Job title contains invalid characters';
        }
        break;
      case 'type':
        // Type is optional, no validation needed
        break;
      case 'location':
        if (value && value.length < 2) {
          error = 'Location must be at least 2 characters';
        } else if (value && value.length > 100) {
          error = 'Location must not exceed 100 characters';
        } else if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Location should only contain letters and spaces';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateAllFields = () => {
    const newErrors = {
      what: validateField('what', searchData.what),
      category: validateField('category', searchData.category),
      type: validateField('type', searchData.type),
      location: validateField('location', searchData.location)
    };
    
    setErrors(newErrors);
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleFieldChange = (name, value) => {
    setSearchData({...searchData, [name]: value});
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({...errors, [name]: error});
    }
  };

  const handleFieldBlur = (name) => {
    setTouched({...touched, [name]: true});
    const error = validateField(name, searchData[name]);
    setErrors({...errors, [name]: error});
  };

  const handleLocationChange = (value) => {
    handleFieldChange('location', value);
    
    if (value.length > 0) {
      const filtered = locations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setSearchData({...searchData, location});
    setShowSuggestions(false);
    // Clear location error when selecting from suggestions
    setErrors({...errors, location: ''});
    setTouched({...touched, location: true});
  };

  const jobCategories = [
    { icon: FaCode, name: 'IT' },
    { icon: FaBriefcase, name: 'Sales' },
    { icon: FaUsers, name: 'Marketing' },
    { icon: FaCalculator, name: 'Finance' },
    { icon: FaUsers, name: 'HR' },
    { icon: FaBriefcase, name: 'Operations' },
    { icon: FaCode, name: 'Design' }
  ];

  const handleSearch = () => {
    // Mark all fields as touched
    setTouched({
      what: true,
      category: true,
      type: true,
      location: true
    });
    
    // Validate all fields
    if (!validateAllFields()) {
      alert('Please fix the validation errors before searching');
      return;
    }
    
    const filters = {};
    if (searchData.what && searchData.what !== '') filters.search = searchData.what.trim();
    if (searchData.category && searchData.category !== '') filters.category = searchData.category;
    if (searchData.type && searchData.type !== '') filters.jobType = searchData.type;
    if (searchData.location && searchData.location !== '') filters.location = searchData.location.trim();
    
    // If onSearch prop exists, use it for home page filtering
    if (onSearch && typeof onSearch === 'function') {
      onSearch(filters);
    } else {
      // Navigate to job grid page with filters
      const queryString = Object.keys(filters)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
        .join('&');
      
      navigate(`/job-grid${queryString ? '?' + queryString : ''}`);
    }
  };

  const scrollToRecruiters = () => {
    const recruitersSection = document.querySelector('.twm-recruiters5-wrap');
    if (recruitersSection) {
      recruitersSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="hero-body" style={{
      backgroundImage: "url('/assets/images/photo_2025-10-09_11-01-43.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      {/* Hero Section */}
      <div className="hero-content">
        <div className="hero-layout">
          <div className="hero-text" style={{ flex: 1, textAlign: 'left' }}>
            <h1 className="hero-title">
              Find the <span className="highlight">job</span> that fits your life
            </h1>
            <p className="hero-subtitle" style={{ color: '#ff9c00' }}>
              Type your keyword, then click search to find your perfect job.
            </p>
            <button 
              onClick={() => navigate('/job-grid')}
              className="hero-cta"
            >
              Explore Jobs
            </button>
          </div>
          <div className="hero-illustration">
            <img 
              src="/assets/images/Resume-amico.svg" 
              alt="Find Job" 
              className="hero-image"
            />
          </div>
        </div>


        {/* Search Bar */}
        <div className="search-container">
          <div className="search-field">
            <label className="search-label">EDUCATION</label>
            <select 
              className={`search-select${touched.type && errors.type ? ' has-error' : ''}`}
              value={searchData.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              onBlur={() => handleFieldBlur('type')}
            >
              <option value="">Select Education</option>
              <option value="Below 10th">Below 10th</option>
              <option value="10th Pass">10th Pass</option>
              <option value="12th Pass">12th Pass</option>
              <option value="ITI">ITI</option>
              <option value="Diploma">Diploma</option>
              <option value="Polytechnic">Polytechnic</option>
              <option value="Certificate Course">Certificate Course</option>
              <option value="B.E">B.E</option>
              <option value="B.Tech">B.Tech</option>
              <option value="B.Sc">B.Sc</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
              <option value="B.Com">B.Com</option>
              <option value="BA">BA</option>
              <option value="B.Pharm">B.Pharm</option>
              <option value="B.Arch">B.Arch</option>
              <option value="BDS">BDS</option>
              <option value="MBBS">MBBS</option>
              <option value="BAMS">BAMS (Ayurveda)</option>
              <option value="BHMS">BHMS (Homeopathy)</option>
              <option value="B.V.Sc">B.V.Sc (Veterinary)</option>
              <option value="B.Sc Nursing">B.Sc Nursing</option>
              <option value="GNM">GNM (Nursing)</option>
              <option value="ANM">ANM (Nursing)</option>
              <option value="BHM">BHM (Hotel Management)</option>
              <option value="B.Des">B.Des (Design)</option>
              <option value="B.F.Tech">B.F.Tech (Fashion)</option>
              <option value="B.Sc Agriculture">B.Sc Agriculture</option>
              <option value="LLB">LLB (Law)</option>
              <option value="B.Ed">B.Ed</option>
              <option value="B.P.Ed">B.P.Ed (Physical Education)</option>
              <option value="BFA">BFA (Fine Arts)</option>
              <option value="B.Lib">B.Lib (Library Science)</option>
              <option value="Journalism">Journalism</option>
              <option value="CA">CA (Chartered Accountant)</option>
              <option value="CS">CS (Company Secretary)</option>
              <option value="CMA">CMA (Cost Management)</option>
              <option value="M.E">M.E</option>
              <option value="M.Tech">M.Tech</option>
              <option value="M.Sc">M.Sc</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
              <option value="M.Com">M.Com</option>
              <option value="MA">MA</option>
              <option value="M.Pharm">M.Pharm</option>
              <option value="M.Arch">M.Arch</option>
              <option value="MDS">MDS</option>
              <option value="MD">MD</option>
              <option value="MS">MS (Surgery)</option>
              <option value="M.V.Sc">M.V.Sc (Veterinary)</option>
              <option value="M.Sc Nursing">M.Sc Nursing</option>
              <option value="MHM">MHM (Hotel Management)</option>
              <option value="M.Des">M.Des (Design)</option>
              <option value="M.Sc Agriculture">M.Sc Agriculture</option>
              <option value="LLM">LLM (Law)</option>
              <option value="M.Ed">M.Ed</option>
              <option value="M.P.Ed">M.P.Ed (Physical Education)</option>
              <option value="MFA">MFA (Fine Arts)</option>
              <option value="M.Lib">M.Lib (Library Science)</option>
              <option value="M.Phil">M.Phil</option>
              <option value="PhD">PhD</option>
              <option value="Post Doctoral">Post Doctoral</option>
            </select>
            {touched.type && errors.type && (
              <div className="search-error">
                {errors.type}
              </div>
            )}
          </div>
          
          <div className="search-field">
            <label className="search-label">CATEGORY</label>
            <select 
              className={`search-select${touched.category && errors.category ? ' has-error' : ''}`}
              value={searchData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              onBlur={() => handleFieldBlur('category')}
            >
              <option value=""hidden>Select Categories</option>
              <option value="Information Technology (IT) & Software">Information Technology (IT) & Software</option>
              <option value="Design & Creative">Design & Creative</option>
              <option value="Marketing & Advertising">Marketing & Advertising</option>
              <option value="Sales & Business Development">Sales & Business Development</option>
              <option value="Customer Support & Service">Customer Support & Service</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
              <option value="Human Resources (HR) & Recruitment">Human Resources (HR) & Recruitment</option>
              <option value="Engineering & Manufacturing">Engineering & Manufacturing</option>
              <option value="Construction & Real Estate">Construction & Real Estate</option>
              <option value="Healthcare & Medical">Healthcare & Medical</option>
              <option value="Education & Training">Education & Training</option>
              <option value="Hospitality & Travel">Hospitality & Travel</option>
              <option value="Retail & Commerce">Retail & Commerce</option>
              <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
              <option value="Legal & Compliance">Legal & Compliance</option>
              <option value="Administration & Operations">Administration & Operations</option>
              <option value="Government & Public Sector">Government & Public Sector</option>
              <option value="Media & Journalism">Media & Journalism</option>
              <option value="Agriculture & Environment">Agriculture & Environment</option>
              <option value="Energy & Utilities">Energy & Utilities</option>
              <option value="Automobile">Automobile</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Non-Profit & Social Work">Non-Profit & Social Work</option>
              <option value="Product & Project Management">Product & Project Management</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data Science & Analytics">Data Science & Analytics</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Skilled Trades">Skilled Trades</option>
              <option value="Security Services">Security Services</option>
              <option value="Domestic & Care Services">Domestic & Care Services</option>
            </select>
            {touched.category && errors.category && (
              <div className="search-error">
                {errors.category}
              </div>
            )}
          </div>
          
          <div className="search-field">
            <label className="search-label">Designation</label>
            <select 
              className={`search-select${touched.what && errors.what ? ' has-error' : ''}`}
              value={searchData.what}
              onChange={(e) => handleFieldChange('what', e.target.value)}
              onBlur={() => handleFieldBlur('what')}
            >
              <option value="" hidden>Select skills</option>
              <option value="Data Entry Operator">Data Entry Operator</option>
              <option value="Computer Operator">Computer Operator</option>
              <option value="IT Support Assistant">IT Support Assistant</option>
              <option value="Junior Web Developer">Junior Web Developer</option>
              <option value="Software Developer">Software Developer</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Cloud Engineer">Cloud Engineer</option>
              <option value="Network Administrator">Network Administrator</option>
              <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="AI/ML Engineer">AI/ML Engineer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Graphic Designer">Graphic Designer</option>
              <option value="Motion Designer">Motion Designer</option>
              <option value="3D Artist">3D Artist</option>
              <option value="Video Editor">Video Editor</option>
              <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
              <option value="SEO Specialist">SEO Specialist</option>
              <option value="Social Media Manager">Social Media Manager</option>
              <option value="Content Writer">Content Writer</option>
              <option value="Performance Marketer">Performance Marketer</option>
              <option value="Brand Manager">Brand Manager</option>
              <option value="Sales Executive">Sales Executive</option>
              <option value="Business Development Executive">Business Development Executive</option>
              <option value="Regional Sales Manager">Regional Sales Manager</option>
              <option value="Inside Sales Specialist">Inside Sales Specialist</option>
              <option value="Tele Sales Executive">Tele Sales Executive</option>
              <option value="HR Executive">HR Executive</option>
              <option value="Talent Acquisition Specialist">Talent Acquisition Specialist</option>
              <option value="HR Manager">HR Manager</option>
              <option value="L&D Manager">L&D Manager</option>
              <option value="Accountant">Accountant</option>
              <option value="Auditor">Auditor</option>
              <option value="Tax Consultant">Tax Consultant</option>
              <option value="Finance Manager">Finance Manager</option>
              <option value="Billing Executive">Billing Executive</option>
              <option value="Site Engineer">Site Engineer</option>
              <option value="Safety Officer">Safety Officer</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Lab Technician">Lab Technician</option>
              <option value="IVF Specialist">IVF Specialist</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Medical Equipment Specialist">Medical Equipment Specialist</option>
              <option value="Teacher">Teacher</option>
              <option value="Professor">Professor</option>
              <option value="HOD">HOD</option>
              <option value="Principal">Principal</option>
              <option value="Logistics Coordinator">Logistics Coordinator</option>
              <option value="Warehouse Manager">Warehouse Manager</option>
              <option value="Supply Chain Executive">Supply Chain Executive</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Chef">Chef</option>
              <option value="Housekeeping Staff">Housekeeping Staff</option>
              <option value="Store Manager">Store Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Delivery Executive">Delivery Executive</option>
              <option value="Legal Advisor">Legal Advisor</option>
              <option value="Compliance Officer">Compliance Officer</option>
              <option value="Office Administrator">Office Administrator</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Security Guard">Security Guard</option>
              <option value="Social Worker">Social Worker</option>
              <option value="Program Coordinator (NGO)">Program Coordinator (NGO)</option>
              <option value="Machine Operator">Machine Operator</option>
              <option value="Welder">Welder</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Technician">Technician</option>
            </select>
            {touched.what && errors.what && (
              <div className="search-error">
                {errors.what}
              </div>
            )}
          </div>
          
          <div className="search-field location-field">
            <label className="search-label">LOCATION</label>
            <div className="location-input">
              <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="2" fill="none"/>
                <path d="m21 21-4.35-4.35" stroke="#000000" strokeWidth="2" fill="none"/>
              </svg>
              <input
                type="text"
                className={`search-select location-select${touched.location && errors.location ? ' has-error' : ''}`}
                value={searchData.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => searchData.location && setShowSuggestions(true)}
                onBlur={() => {
                  handleFieldBlur('location');
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Enter Location"
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="location-suggestions">
                  {locationSuggestions.map((location, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectLocation(location)}
                    >
                      {location}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {touched.location && errors.location && (
              <div className="search-error">
                {errors.location}
              </div>
            )}
          </div>
          
          <button className="search-btn" onClick={scrollToRecruiters}>
            Find Job
          </button>
        </div>

        {/* Job Categories Carousel */}
        <div className="categories-container" style={{
          overflow: 'hidden',
          width: '100%'
        }}>
          <div className="categories-carousel" style={{
            width: '100%',
            overflow: 'hidden'
          }}>
            <div className="categories-track">
              {/* Duplicate categories for seamless loop */}
              {[...jobCategories, ...jobCategories].map((category, index) => (
                <div key={index} className="category-card">
                  <div className="category-icon small">
                    {category.icon && React.createElement(category.icon, { size: 20 })}
                  </div>
                  <h3 className="category-name">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes scroll-categories {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default HeroBody;
