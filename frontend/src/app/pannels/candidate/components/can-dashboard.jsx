import { useEffect, useState } from "react";
import { MapPin } from 'lucide-react';
import { loadScript } from "../../../../globals/constants";
import SectionCandidateOverview from "../sections/dashboard/section-can-overview";
import CompleteProfileCard from "../sections/dashboard/section-can-profile";
import SectionNotifications from "../sections/dashboard/section-notifications";
import SectionRecommendedJobs from "../sections/dashboard/section-recommended-jobs";
import './can-dashboard.css';

function CanDashboardPage() {
  const [candidate, setCandidate] = useState({ name: 'Loading...', location: 'Bangalore', profilePicture: null });

  useEffect(() => {
    loadScript("js/custom.js");
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      const token = localStorage.getItem('candidateToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/candidate/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setCandidate({
            name: data.profile.candidateId?.name || data.profile.name || 'Candidate',
            location: data.profile.location || 'Bangalore',
            profilePicture: data.profile.profilePicture
          });
        }
      }
    } catch (error) {
      
    }
  };

  return (
    <>
      <div className="twm-right-section-panel site-bg-gray can-dashboard">
        {/* Welcome Card */}
        <div style={{ padding: '2rem 2rem 0 2rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {candidate.profilePicture ? (
                <img 
                  src={candidate.profilePicture} 
                  alt="Profile" 
                  style={{
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '3px solid #ff6b35'
                  }}
                />
              ) : (
                <div style={{
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f8f9fa', 
                  border: '3px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fa fa-user" style={{ color: '#6c757d', fontSize: '24px' }}></i>
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.25rem 0' }}>Welcome, {candidate.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <MapPin size={16} style={{ color: '#f97316' }} />
                  <span style={{ color: '#f97316', fontSize: '0.875rem', fontWeight: '500' }}>{candidate.location}</span>
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>Here&apos;s an overview of your job applications and profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
          <SectionCandidateOverview />

          {/* Profile Completion and Notifications */}
          <div className="row">
            <div className="col-xl-8 col-lg-8 col-md-12 mb-4" style={{ position: 'relative', zIndex: 1 }}>
              <CompleteProfileCard />
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 mb-4" style={{ position: 'relative', zIndex: 2 }}>
              <SectionNotifications />
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="row">
            <div className="col-12 mb-4">
              <SectionRecommendedJobs />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CanDashboardPage;
