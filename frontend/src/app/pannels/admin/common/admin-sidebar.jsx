
import JobZImage from "../../../common/jobz-img";
import { NavLink, useLocation } from "react-router-dom";
import { loadScript, setMenuActive } from "../../../../globals/constants";
import { admin, adminRoute, publicUser } from "../../../../globals/route-names";
import { useEffect, useState } from "react";
import "./admin-sidebar.css";

function AdminSidebarSection({ sidebarActive, isMobile }) {
    const currentpath = useLocation().pathname;
    const [userPermissions, setUserPermissions] = useState([]);
    const [isSubAdmin, setIsSubAdmin] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    useEffect(() => {
        loadScript("js/custom.js");
        loadScript("js/admin-sidebar.js");
        
        // Check if user is sub-admin and get permissions
        const adminData = localStorage.getItem('adminData');
        const subAdminData = localStorage.getItem('subAdminData');
        
        if (subAdminData) {
            const subAdmin = JSON.parse(subAdminData);
            setUserPermissions(subAdmin.permissions || []);
            setIsSubAdmin(true);
        } else if (adminData) {
            // Regular admin has all permissions
            setUserPermissions(['employers', 'placement_officers', 'registered_candidates']);
            setIsSubAdmin(false);
        }

        // Auto-open menus if current path matches submenu items
        const isEmployerPath = [
            adminRoute(admin.CAN_MANAGE),
            adminRoute(admin.CAN_APPROVE), 
            adminRoute(admin.CAN_REJECT)
        ].includes(currentpath);
        
        const isPlacementPath = [
            adminRoute(admin.PLACEMENT_MANAGE),
            adminRoute(admin.PLACEMENT_APPROVE),
            adminRoute(admin.PLACEMENT_REJECT)
        ].includes(currentpath);

        setOpenMenus({
            employers: isEmployerPath,
            placement: isPlacementPath
        });
    }, [currentpath])

    const hasPermission = (permission) => {
        return !isSubAdmin || userPermissions.includes(permission);
    };

    const sidebarClasses = [
        sidebarActive ? "active" : "",
        !isMobile && !sidebarActive ? "collapsed" : ""
    ].filter(Boolean).join(" ");

    const mobileStyles = isMobile ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "280px",
        transform: sidebarActive ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
        boxShadow: sidebarActive ? "0 4px 24px rgba(0,0,0,0.25)" : "none",
        zIndex: 10000,
        background: "#ffffff",
        height: "100vh",
        overflowY: "auto"
    } : {};

    return (
        <>
            <nav id="sidebar-admin-wraper" className={sidebarClasses} style={mobileStyles}>
                <div className="page-logo">
                    <NavLink to={publicUser.INITIAL}><JobZImage id="skin_page_logo" src="images/logo-dark.png" alt="" /></NavLink>
                </div>

                <div className="admin-nav scrollbar-macosx">
                    <ul>
                        <li
                            className={setMenuActive(currentpath, adminRoute(admin.DASHBOARD))}>
                            <NavLink to={adminRoute(admin.DASHBOARD)}><i className="fa fa-home" /><span className="admin-nav-text">Dashboard</span></NavLink>
                        </li>

                        {hasPermission('employers') && (
                            <li>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    setOpenMenus(prev => ({...prev, employers: !prev.employers}));
                                }}>
                                    <i className="fa fa-user-tie" />
                                    <span className="admin-nav-text">Employers</span>
                                </a>
                                <ul className={`sub-menu ${openMenus.employers ? 'open' : ''}`}>
                                    <li className={currentpath === adminRoute(admin.CAN_MANAGE) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.CAN_MANAGE)} id="allList">
                                            <span className="admin-nav-text">All Submissions</span>
                                        </NavLink>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.CAN_APPROVE) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.CAN_APPROVE)} id="approvedList">
                                            <span className="admin-nav-text">Approved</span>
                                        </NavLink>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.CAN_REJECT) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.CAN_REJECT)} id="rejectedList">
                                            <span className="admin-nav-text">Rejected</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        )}

                        {hasPermission('registered_candidates') && (
                            <li className={setMenuActive(currentpath, adminRoute(admin.REGISTERED_CANDIDATES))}>
                                <NavLink to={adminRoute(admin.REGISTERED_CANDIDATES)}>
                                    <i className="fa fa-users" />
                                    <span className="admin-nav-text">Registered Candidates</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('placement_officers') && (
                            <li>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    setOpenMenus(prev => ({...prev, placement: !prev.placement}));
                                }}>
                                    <i className="fa fa-graduation-cap" />
                                    <span className="admin-nav-text">Placement Officers</span>
                                </a>
                                <ul className={`sub-menu ${openMenus.placement ? 'open' : ''}`}>
                                    <li className={currentpath === adminRoute(admin.PLACEMENT_MANAGE) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.PLACEMENT_MANAGE)}>
                                            <span className="admin-nav-text">All Submissions</span>
                                        </NavLink>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.PLACEMENT_APPROVE) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.PLACEMENT_APPROVE)}>
                                            <span className="admin-nav-text">Approved</span>
                                        </NavLink>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.PLACEMENT_REJECT) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.PLACEMENT_REJECT)}>
                                            <span className="admin-nav-text">Rejected</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        )}

                        <li className={setMenuActive(currentpath, adminRoute(admin.SUPPORT_TICKETS))}>
                            <NavLink to={adminRoute(admin.SUPPORT_TICKETS)}>
                                <i className="fa fa-headset" />
                                <span className="admin-nav-text">Support Tickets</span>
                            </NavLink>
                        </li>

                        {!isSubAdmin && (
                            <li className={setMenuActive(currentpath, adminRoute(admin.SUB_ADMIN))}>
                                <NavLink to={adminRoute(admin.SUB_ADMIN)}>
                                    <i className="fa fa-user-shield" />
                                    <span className="admin-nav-text">Sub Admin</span>
                                </NavLink>
                            </li>
                        )}
    
                        <li>
                            <a href="#" data-bs-toggle="modal" data-bs-target="#logout-dash-profile">
                                <i className="fa fa-share-square" />
                                <span className="admin-nav-text">Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    )
}

export default AdminSidebarSection;
