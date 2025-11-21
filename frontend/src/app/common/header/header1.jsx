
import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";
import { useState, useCallback, memo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../header-responsive.css";

const Header1 = memo(function Header1({ _config }) {

    const [menuActive, setMenuActive] = useState(false);
    const { user, userType, isAuthenticated } = useAuth();

    const closeMenu = useCallback(() => {
        setMenuActive(false);
    }, []);

    const toggleMenu = useCallback(() => {
        setMenuActive(prev => {
            const newState = !prev;
            // Prevent body scroll when menu is open
            if (newState) {
                document.body.classList.add('mobile-menu-open');
            } else {
                document.body.classList.remove('mobile-menu-open');
            }
            return newState;
        });
    }, []);

    const getDashboardRoute = () => {
        switch (userType) {
            case 'employer':
                return '/employer/dashboard';
            case 'candidate':
                return '/candidate/dashboard';
            case 'placement':
                return '/placement/dashboard';
            case 'admin':
                return '/admin/dashboard';
            case 'sub-admin':
                return '/sub-admin/dashboard';
            default:
                return '/';
        }
    };

    const getUserDisplayName = () => {
        if (!user) return '';
        
        switch (userType) {
            case 'employer':
                return user.companyName || user.name || 'Dashboard';
            case 'candidate':
                return user.name || user.username || 'Profile';
            case 'placement':
                return user.name || 'Profile';
            case 'admin':
                return user.name || 'Admin';
            case 'sub-admin':
                return user.name || 'SubAdmin';
            default:
                return 'User';
        }
    };

    return (
        <>
            <header className={"site-header " + _config.style + " " + (menuActive ? "active" : "") + (isAuthenticated() ? " authenticated-user" : "") }>
                <div className="sticky-header main-bar-wraper navbar-expand-lg">
                    <div className="main-bar">
                        <div className="container-fluid clearfix">
                            <div className="logo-header">
                                <div className="logo-header-inner logo-header-one">
                                    <NavLink to={publicUser.INITIAL}>
                                        {
                                            _config.withBlackLogo
                                                ?
                                                <JobZImage src="images/logo-12.png" alt="" />
                                                :
                                                (
                                                    _config.withWhiteLogo
                                                        ?
                                                        <JobZImage src="images/logo-white.png" alt="" />
                                                        :
                                                        (
                                                            _config.withLightLogo ?
                                                                <>
                                                                    <JobZImage id="skin_header_logo_light" src="images/logo-light-3.png" alt="" className="default-scroll-show" />
                                                                    <JobZImage id="skin_header_logo" src="images/logo-dark.png" alt="" className="on-scroll-show" />
                                                                </> :
                                                                <JobZImage id="skin_header_logo" src="images/logo-dark.png" alt="" />
                                                        )
                                                )
                                        }
                                    </NavLink>
                                </div>
                            </div>
                            {/* MAIN Nav */}
                            <div className="nav-animation header-nav navbar-collapse d-flex justify-content-center" style={{display: 'flex !important'}}>
                                <ul className="nav navbar-nav" style={{display: 'flex', listStyle: 'none', gap: '1rem', padding: '0 20px'}}>
                                    <li className="nav-item">
                                        <NavLink
                                            to="/"
                                            className={({ isActive }) => 
                                                isActive ? "nav-link-custom active" : "nav-link-custom"
                                            }
                                            onClick={closeMenu}
                                        >
                                            Home
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to="/job-grid"
                                            className={({ isActive }) => 
                                                isActive ? "nav-link-custom active" : "nav-link-custom"
                                            }
                                            onClick={closeMenu}
                                        >
                                            Jobs
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to="/emp-grid"
                                            className={({ isActive }) => 
                                                isActive ? "nav-link-custom active" : "nav-link-custom"
                                            }
                                            onClick={closeMenu}
                                        >
                                            Employers
                                        </NavLink>
                                    </li>


                                </ul>

                                {/* Mobile Auth Section */}
                                <div className="mobile-auth-section">
                                    {isAuthenticated() ? (
                                        <NavLink 
                                            className="btn btn-outline-primary" 
                                            to={getDashboardRoute()}
                                            onClick={closeMenu}
                                        >
                                            <i className="feather-user" /> {getUserDisplayName()}
                                        </NavLink>
                                    ) : (
                                        <>
                                            <a className="btn btn-outline-primary" data-bs-toggle="modal" href="#sign_up_popup" role="button" onClick={closeMenu}>
                                                <i className="feather-log-in" /> Sign Up
                                            </a>
                                            <a className="btn btn-primary" data-bs-toggle="modal" href="#sign_up_popup2" role="button" onClick={closeMenu}>
                                                <i className="feather-log-in" /> Sign In
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Header Right Section*/}
                            <div className="extra-nav header-2-nav">
                                <div className="extra-cell">
                                    {isAuthenticated() ? (
                                        <div className="employer-nav-menu">
                                            <div className="dashboard-link">
                                                <NavLink
                                                    className="btn btn-outline-primary"
                                                    to={getDashboardRoute()}
                                                >
                                                    <i className="feather-user" /> {getUserDisplayName()}
                                                </NavLink>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="header-nav-btn-section">
                                            <div className="twm-nav-btn-left">
                                                <a className="twm-nav-sign-up" data-bs-toggle="modal" href="#sign_up_popup" role="button">
                                                    <i className="feather-log-in" /> Sign Up
                                                </a>
                                            </div>
                                            <div className="twm-nav-btn-right">
                                                <a className="twm-nav-post-a-job" data-bs-toggle="modal" href="#sign_up_popup2" role="button">
                                                    <i className="feather-log-in" /> Sign In
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="extra-cell">
                                    <a href="#"
                                        className={"vnav-btn " + _config.nav_button_style + (menuActive ? ' active' : '')}
                                        id="twm-side-navigation"
                                        onClick={toggleMenu}
                                        aria-label="Toggle menu"
                                        style={{color: '#333333', zIndex: 9999}}
                                    >
                                        <span className="fa fa-bars" style={{color: '#333333', fontSize: '18px'}}></span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* SITE Search */}
                    <div id="search">
                        <span className="close" />
                        <form role="search" id="searchform" action="/search" method="get" className="radius-xl">
                            <input className="form-control" name="q" type="search" placeholder="Type to search" />
                            <span className="input-group-append">
                                <button type="button" className="search-btn">
                                    <i className="fa fa-paper-plane" />
                                </button>
                            </span>
                        </form>
                    </div>
                </div>

                <div className={"twm-side-navigation-menu " + (menuActive ? 'active' : '')}>
                    <div className="nav-sidebar-wrap  scrollbar-macosx">
                        <a href="#" className="vnav-close" onClick={toggleMenu} />
                        <ul className="nav ">
                            <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Home</NavLink></li>
                            <li><NavLink to="/job-grid" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Jobs</NavLink></li>
                            <li><NavLink to="/emp-grid" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Employers</NavLink></li>

                        </ul>

                        {/* Auth buttons for mobile menu */}
                        {!isAuthenticated() && (
                            <div className="header-nav-btn-section">
                                <div className="twm-nav-btn-left">
                                    <a className="twm-nav-sign-up" data-bs-toggle="modal" href="#sign_up_popup" role="button" onClick={closeMenu}>
                                        <i className="feather-log-in" /> Sign Up
                                    </a>
                                </div>
                                <div className="twm-nav-btn-right">
                                    <a className="twm-nav-post-a-job" data-bs-toggle="modal" href="#sign_up_popup2" role="button" onClick={closeMenu}>
                                        <i className="feather-log-in" /> Sign In
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

        </>
    )
});

export default Header1;
