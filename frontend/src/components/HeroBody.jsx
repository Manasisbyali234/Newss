import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroBody.css';
import { FaBriefcase, FaCalculator, FaCode, FaUsers } from 'react-icons/fa';

const HeroBody = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    what: '',
    type: '',
    location: ''
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({
    what: '',
    type: '',
    location: ''
  });
  const [touched, setTouched] = useState({
    what: false,
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
              Find the <span className="highlight">job</span> that fits<br />
              your life
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
            
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-field">
                <label className="search-label">WHAT</label>
                <select 
                  className={`search-select${touched.what && errors.what ? ' has-error' : ''}`}
                  value={searchData.what}
                  onChange={(e) => handleFieldChange('what', e.target.value)}
                  onBlur={() => handleFieldBlur('what')}
                >
                  <option value="">Job Title</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Consultant">Consultant</option>
                </select>
                {touched.what && errors.what && (
                  <div className="search-error">
                    {errors.what}
                  </div>
                )}
              </div>
              
              <div className="search-field">
                <label className="search-label">TYPE</label>
                <select 
                  className={`search-select${touched.type && errors.type ? ' has-error' : ''}`}
                  value={searchData.type}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  onBlur={() => handleFieldBlur('type')}
                >
                  <option value="">All Category</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Remote">Remote</option>
                  <option value="Work From Home">Work From Home</option>
                </select>
                {touched.type && errors.type && (
                  <div className="search-error">
                    {errors.type}
                  </div>
                )}
              </div>
              
              <div className="search-field location-field">
                <label className="search-label">LOCATION</label>
                <div className="location-input">
                  <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
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
                    placeholder="Search location..."
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
              
              <button className="search-btn" onClick={handleSearch}>
                Find Job
              </button>
            </div>
          </div>
          <div className="hero-illustration">
            <img 
              src="/assets/images/Resume-amico.svg" 
              alt="Find Job" 
              className="hero-image"
            />
          </div>
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
            <div className="categories-track" style={{
              display: 'flex',
              gap: '1.5rem',
              padding: '1rem 0',
              animation: 'scroll-categories 15s linear infinite',
              width: 'calc(200% + 1.5rem)',
              willChange: 'transform'
            }}>
              {/* Duplicate categories for seamless loop */}
              {[...jobCategories, ...jobCategories].map((category, index) => (
                <div key={index} className="category-card" style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '1.25rem 1rem',
                  boxShadow: '0 3px 14px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  minWidth: '140px',
                  maxWidth: '220px',
                  flex: '0 0 140px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.15rem'
                }}>
                  <div className="category-icon" style={{
                    backgroundColor: 'rgba(255, 156, 0, 0.1)',
                    border: '1px solid rgba(255, 156, 0, 0.3)',
                    color: '#e68900',
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {category.icon && React.createElement(category.icon, { size: 20 })}
                  </div>
                  <h3 className="category-name" style={{
                    color: '#333',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    margin: '0',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>{category.name}</h3>
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
