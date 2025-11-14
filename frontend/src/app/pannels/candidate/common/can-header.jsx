// CANDIDATE DASHBOARD HEADER

import React, { useState, useEffect } from "react";
import JobZImage from "../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { canRoute, candidate } from "../../../../globals/route-names";
import { api } from "../../../../utils/api";
import NotificationBell from "../../../../components/NotificationBell";

function CanHeaderSection(props) {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchProfile();
        
        // Listen for profile updates
        const handleProfileUpdate = () => {
            fetchProfile();
        };
        
        window.addEventListener('profileUpdated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.getCandidateProfile();
            if (response.success && response.profile) {
                setProfileData(response.profile);
            }
        } catch (error) {
            
        }
    };
    return (
        <>
            <header id="header-admin-wrap" className="header-admin-fixed">
                {/* Header Start */}
                <div id="header-admin" className={props.sidebarActive ? "" : "active"}>
                    <div className="container">
                        {/* Left Side Content */}
                        <div className="header-left">
                            <div className="nav-btn-wrap">
                                <a className="nav-btn-admin" id="sidebarCollapse" onClick={props.onClick}>
                                    <span className="fa fa-angle-left" />
                                </a>
                            </div>
                        </div>
                        {/* Left Side Content End */}

                        {/* Right Side Content */}
                        <div className="header-right">
                            <ul className="header-widget-wrap">
                                
                                {/*Notification*/}
                                <li className="header-widget dashboard-noti-dropdown">
                                    <NotificationBell userRole="candidate" />
                                </li>
                                {/*Account*/}
                                
                                <li className="header-widget">
                                    <div className="dashboard-user-section">
                                        <div className="listing-user">
                                            <div className="">
                                                <span>
                                                    {profileData?.profilePicture ? (
                                                        <img 
                                                            src={profileData.profilePicture} 
                                                            alt="Profile" 
                                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <JobZImage src="images/user-avtar/pic4.jpg" alt="" />
                                                    )}
                                                </span>
                                            </div>
                                            </div>
                                        </div>
                                    {/* </div> */}
                                </li>
                            </ul>
                        </div>
                        {/* Right Side Content End */}
                    </div>
                </div>
                {/* Header End */}
            </header>

        </>
    )
}

export default CanHeaderSection;
