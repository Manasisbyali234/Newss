import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { empRoute, employer, publicUser } from "../../../globals/route-names";
import { useState, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";

function Header2({ _config }) {

    const [menuActive, setMenuActive] = useState(false);
    const { user, userType, isAuthenticated } = useAuth();

    const handleNavigationClick = useCallback(() => {
        setMenuActive(!menuActive);
    }, [menuActive]);

    const closeMenu = useCallback(() => {
        setMenuActive(false);
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
            <header className={"site-header " + _config.style}>
                <div className="sticky-header main-bar-wraper navbar-expand-lg">
                    <div className="main-bar">
                        <div className="container-fluid">
                            <div className="logo-header">
                                <div className="logo-header-inner logo-header-one">
                                    <NavLink to={publicUser.HOME1}>
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

                            {/* Header Right Section*/}
                            <div className="extra-nav header-2-nav">
                                <div className="extra-cell">
                                    <div className="header-search">
                                        <a href="#search" className="header-search-icon"><i className="feather-search" /></a>
                                    </div>
                                </div>
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
                                        className={"vnav-btn " + _config.nav_button_style}
                                        id="twm-side-navigation"
                                        onClick={handleNavigationClick}
                                    >
                                        <span className="fa fa-bars"></span>
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
                        <a href="#" className="vnav-close" onClick={handleNavigationClick} />
                        <ul className="nav ">
                            <li className="has-child"><a href="#">Home</a>
                                <ul className="sub-menu">
                                    <li><NavLink to={publicUser.HOME1}>Home-1</NavLink></li>
                                    <li><NavLink to={publicUser.HOME2}>Home-2</NavLink></li>
                                    <li><NavLink to={publicUser.HOME3}>Home-3</NavLink></li>
                                    <li><NavLink to={publicUser.HOME4}>Home-4</NavLink></li>
                                    <li><NavLink to={publicUser.HOME5}>Home-5</NavLink></li>
                                    <li><NavLink to={publicUser.HOME6}>Home-6</NavLink></li>
                                    <li><NavLink to={publicUser.HOME7}>Home-7</NavLink></li>
                                    <li><NavLink to={publicUser.HOME8}>Home-8</NavLink></li>
                                    <li><NavLink to={publicUser.HOME9}>Home-9</NavLink></li>
                                    <li><NavLink to={publicUser.HOME10}>Home-10</NavLink></li>
                                    <li><NavLink to={publicUser.HOME11}>Home-11</NavLink></li>
                                    <li><NavLink to={publicUser.HOME12}>Home-12</NavLink></li>
                                    <li><NavLink to={publicUser.HOME13}>Home-13</NavLink></li>
                                    <li><NavLink to={publicUser.HOME14}>Home-14</NavLink></li>
                                    <li><NavLink to={publicUser.HOME15}>Home-15</NavLink></li>
                                    <li><NavLink to={publicUser.HOME16}>Home-16</NavLink></li>
                                    <li><NavLink to={publicUser.HOME17}>Home-17</NavLink></li>
                                    <li><NavLink to={publicUser.HOME18}>Home-18</NavLink></li>
                                </ul>
                            </li>
                            <li className="has-child"><a href="#">Jobs</a>
                                <ul className="sub-menu">
                                    <li><NavLink to={publicUser.jobs.GRID}>Jobs Grid</NavLink></li>
                                    <li><NavLink to={publicUser.jobs.GRID_MAP}>Jobs Grid with Map</NavLink></li>
                                    <li><NavLink to={publicUser.jobs.LIST}>Jobs List</NavLink></li>
                                    <li className="has-child"><a href="#">Job Detail</a>
                                        <ul className="sub-menu">
                                            <li><NavLink to={publicUser.jobs.DETAIL1}>Detail 1</NavLink>
                                            </li><li><NavLink to={publicUser.jobs.DETAIL2}>Detail 2 </NavLink>
                                            </li></ul>
                                    </li>
                                    <li><NavLink to={publicUser.jobs.APPLY}>Apply Jobs</NavLink></li>
                                </ul>
                            </li>
                            <li className="has-child"><a href="#">Employers</a>
                                <ul className="sub-menu">
                                    <li><NavLink to={publicUser.employer.GRID}>Employers Grid</NavLink></li>
                                    <li><NavLink to={publicUser.employer.LIST}>Employers List</NavLink></li>
                                    <li className="has-child"><a href="#">Employers Detail</a>
                                        <ul className="sub-menu">
                                            <li><NavLink to={publicUser.employer.DETAIL1}>Detail 1</NavLink>
                                            </li><li><NavLink to={publicUser.employer.DETAIL2}>Detail 2</NavLink>
                                            </li></ul>
                                    </li>
                                </ul>
                            </li>
                            <li className="has-child"><a href="#">Pages</a>
                                <ul className="sub-menu">
                                    <li><NavLink to={publicUser.pages.ABOUT}>About Us</NavLink></li>
                                    <li><NavLink to={publicUser.pages.PRICING}>Pricing</NavLink></li>
                                    <li><NavLink to={publicUser.pages.ERROR404}>Error-404</NavLink></li>
                                    <li><NavLink to={publicUser.pages.FAQ}>FAQ's</NavLink></li>
                                    <li><NavLink to={publicUser.pages.CONTACT}>Contact Us</NavLink></li>
                                    <li><NavLink to={publicUser.pages.MAINTENANCE}>Under Maintenance</NavLink></li>
                                    <li><NavLink to={publicUser.pages.COMING}>Coming soon</NavLink></li>
                                    <li><NavLink to={publicUser.pages.LOGIN}>Login</NavLink></li>
                                    <li><NavLink to={publicUser.pages.AFTER_LOGIN}>After Login</NavLink></li>
                                    <li><NavLink to={publicUser.pages.ICONS}>Icons</NavLink></li>
                                </ul>
                            </li>
                            <li className="has-child"><a href="#">Candidates</a>
                                <ul className="sub-menu">
                                    <li><NavLink to={publicUser.candidate.GRID}>Candidates Grid</NavLink></li>
                                    <li><NavLink to={publicUser.candidate.LIST}>Candidates List</NavLink></li>
                                    <li className="has-child"><a href="#">Candidate Detail</a>
                                        <ul className="sub-menu">
                                            <li><NavLink to={publicUser.candidate.DETAIL1}>Detail 1</NavLink>
                                            </li><li><NavLink to={publicUser.candidate.DETAIL2}>Detail 2</NavLink>
                                            </li></ul>
                                    </li>
                                </ul>
                            </li>
                            <li className="has-child"><a href="#">Blog</a>
                                <ul className="sub-menu">
                                    <li><NavLink to={publicUser.blog.GRID1}>Blog</NavLink></li>
                                    <li><NavLink to={publicUser.blog.GRID2}>Blog Grid</NavLink></li>
                                    <li><NavLink to={publicUser.blog.GRID3}>Blog Grid-2</NavLink></li>
                                    <li><NavLink to={publicUser.blog.LIST}>Blog List</NavLink></li>
                                    <li><NavLink to={publicUser.blog.DETAIL}>Blog Detail</NavLink></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>

            </header>

        </>
    )
}

export default Header2;
