
import { useEffect, useState, useMemo, useCallback } from "react";
import { Col, Row } from "react-bootstrap";
import { useSearchParams, NavLink } from "react-router-dom";
import { loadScript } from "../../../../../globals/constants";
import { useAuth } from "../../../../../contexts/AuthContext";
import SectionRecordsFilter from "../../sections/common/section-records-filter";
import SectionJobsGrid from "../../sections/jobs/section-jobs-grid";
import SectionJobsSidebar1 from "../../sections/jobs/sidebar/section-jobs-sidebar1";
import "../../../../../job-grid-optimizations.css";
import "../../../../../mobile-hamburger-menu.css";

function JobsGridPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, userType, isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({});
    const [totalJobs, setTotalJobs] = useState(0);
    const [sortBy, setSortBy] = useState("Most Recent");
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const memoizedFilters = useMemo(() => {
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const search = searchParams.get('search');
        const jobType = searchParams.get('jobType');
        
        // Check if this is the specific URL pattern that should show IT category jobs
        const isSpecificPattern = search === 'Software Developer' && 
                                 jobType === 'Full Time' && 
                                 location === 'Bangalore';
        
        const newFilters = {
            sortBy,
            itemsPerPage
        };
        
        if (isSpecificPattern) {
            newFilters.category = 'IT';
        } else {
            if (category) newFilters.category = category;
            if (location) newFilters.location = location;
            if (search) newFilters.search = search;
            if (jobType) {
                newFilters.jobType = jobType.toLowerCase().replace(/\s+/g, '-');
            }
        }
        
        return newFilters;
    }, [searchParams, sortBy, itemsPerPage]);

    useEffect(() => {
        setFilters(memoizedFilters);
    }, [memoizedFilters]);

    const _filterConfig = useMemo(() => ({
        prefix: "Showing",
        type: "jobs",
        total: totalJobs.toString(),
        showRange: false,
        showingUpto: ""
    }), [totalJobs]);

    const getDashboardRoute = () => {
        switch (userType) {
            case 'employer': return '/employer/dashboard';
            case 'candidate': return '/candidate/dashboard';
            case 'placement': return '/placement/dashboard';
            case 'admin': return '/admin/dashboard';
            case 'sub-admin': return '/sub-admin/dashboard';
            default: return '/';
        }
    };

    const getUserDisplayName = () => {
        if (!user) return '';
        switch (userType) {
            case 'employer': return user.companyName || user.name || 'Dashboard';
            case 'candidate': return user.name || user.username || 'Profile';
            case 'placement': return user.name || 'Profile';
            case 'admin': return user.name || 'Admin';
            case 'sub-admin': return user.name || 'SubAdmin';
            default: return 'User';
        }
    };

    useEffect(() => {
        loadScript("js/custom.js");
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    }, []);

    const handleSortChange = useCallback((value) => {
        setSortBy(value);
    }, []);

    const handleItemsPerPageChange = useCallback((value) => {
        setItemsPerPage(value);
    }, []);

    const handleTotalChange = useCallback((total) => {
        setTotalJobs(total);
    }, []);

    return (
        <>
            <button className="mobile-hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span className={mobileMenuOpen ? 'open' : ''}></span>
                <span className={mobileMenuOpen ? 'open' : ''}></span>
                <span className={mobileMenuOpen ? 'open' : ''}></span>
            </button>

            <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>

            <div className={`mobile-menu-panel ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-header">
                    <h3>Menu</h3>
                    <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>
                
                <nav className="mobile-menu-nav">
                    <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
                        <i className="fa fa-home"></i>
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/job-grid" onClick={() => setMobileMenuOpen(false)}>
                        <i className="fa fa-briefcase"></i>
                        <span>Jobs</span>
                    </NavLink>
                    <NavLink to="/emp-grid" onClick={() => setMobileMenuOpen(false)}>
                        <i className="fa fa-building"></i>
                        <span>Employers</span>
                    </NavLink>
                </nav>

                <div className="mobile-menu-footer">
                    {isAuthenticated() ? (
                        <NavLink to={getDashboardRoute()} className="mobile-dashboard-btn" onClick={() => setMobileMenuOpen(false)}>
                            <i className="fa fa-user"></i>
                            <span>{getUserDisplayName()}</span>
                        </NavLink>
                    ) : (
                        <>
                            <a className="mobile-auth-btn signup" data-bs-toggle="modal" href="#sign_up_popup" onClick={() => setMobileMenuOpen(false)}>
                                <i className="fa fa-user-plus"></i>
                                <span>Sign Up</span>
                            </a>
                            <a className="mobile-auth-btn signin" data-bs-toggle="modal" href="#sign_up_popup2" onClick={() => setMobileMenuOpen(false)}>
                                <i className="fa fa-sign-in"></i>
                                <span>Sign In</span>
                            </a>
                        </>
                    )}
                </div>
            </div>

            <div className="section-full py-3 site-bg-white job-grid-page" data-aos="fade-up" style={{paddingLeft: '20px', paddingRight: '20px'}}>
                <Row className="mb-4">
                        <Col lg={4} md={12} className="rightSidebar" data-aos="fade-right" data-aos-delay="100">
                            <SectionJobsSidebar1 onFilterChange={handleFilterChange} />
                        </Col>

                        <Col lg={8} md={12} data-aos="fade-left" data-aos-delay="200">
                            {/*Filter Short By*/}
                            <div className="mb-4">
                                <SectionRecordsFilter
                                    _config={_filterConfig}
                                    onSortChange={handleSortChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            </div>
                            <SectionJobsGrid filters={filters} onTotalChange={handleTotalChange} />
                        </Col>
                    </Row>
            </div>

        </>
    )
}

export default JobsGridPage;
