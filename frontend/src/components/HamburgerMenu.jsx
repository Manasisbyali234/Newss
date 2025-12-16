import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onToggle, onClose }) => {
  const { isAuthenticated } = useAuth();

  // Manage body scroll when menu is open (especially important for iPhone)
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('hamburger-open');
      // Prevent background scrolling on iPhone
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('hamburger-open');
      // Restore scrolling
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('hamburger-open');
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <button 
        className={`hamburger-btn ${isOpen ? 'active' : ''}`} 
        onClick={onToggle}
        style={isOpen ? { display: 'none' } : {}}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && <div className="hamburger-overlay show" onClick={onClose}></div>}

      <nav 
        className={`hamburger-menu ${isOpen ? 'open' : ''}`}
        style={isOpen ? {
          display: 'flex',
          visibility: 'visible',
          opacity: 1,
          transform: 'translateX(0)',
          position: 'fixed',
          top: 0,
          right: 0,
          width: '280px',
          height: '100vh',
          background: '#fff',
          zIndex: 2147483647,
          flexDirection: 'column'
        } : {}}
      >
        <div 
          className="hamburger-header"
          style={isOpen ? { display: 'flex', visibility: 'visible', opacity: 1 } : {}}
        >
          <img 
            src="/assets/images/logo-dark.png" 
            alt="Logo" 
            className="hamburger-logo"
            style={{ height: '32px !important', width: 'auto !important', maxWidth: '150px !important', objectFit: 'contain !important', maxHeight: '32px !important' }}
          />
          <button 
            className="close-btn" 
            onClick={onClose}
            style={isOpen ? { display: 'flex', visibility: 'visible', opacity: 1 } : {}}
          >✕</button>
        </div>

        <div 
          className="hamburger-content"
          style={isOpen ? { display: 'flex', visibility: 'visible', opacity: 1, flex: 1, flexDirection: 'column' } : {}}
        >
          <ul 
            className="menu-list"
            style={isOpen ? { display: 'block', visibility: 'visible', opacity: 1, listStyle: 'none', padding: 0, margin: 0 } : {}}
          >
            <li style={isOpen ? { display: 'block', visibility: 'visible', opacity: 1, margin: 0 } : {}}>
              <NavLink 
                to="/" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
                style={isOpen ? { 
                  display: 'block', 
                  visibility: 'visible', 
                  opacity: 1, 
                  padding: '16px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  minHeight: '44px',
                  boxSizing: 'border-box'
                } : {}}
              >
                Home
              </NavLink>
            </li>
            <li style={isOpen ? { display: 'block', visibility: 'visible', opacity: 1, margin: 0 } : {}}>
              <NavLink 
                to="/job-grid" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
                style={isOpen ? { 
                  display: 'block', 
                  visibility: 'visible', 
                  opacity: 1, 
                  padding: '16px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  minHeight: '44px',
                  boxSizing: 'border-box'
                } : {}}
              >
                Jobs
              </NavLink>
            </li>
            <li style={isOpen ? { display: 'block', visibility: 'visible', opacity: 1, margin: 0 } : {}}>
              <NavLink 
                to="/emp-grid" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
                style={isOpen ? { 
                  display: 'block', 
                  visibility: 'visible', 
                  opacity: 1, 
                  padding: '16px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  minHeight: '44px',
                  boxSizing: 'border-box'
                } : {}}
              >
                Employers
              </NavLink>
            </li>
          </ul>
        </div>

        {!isAuthenticated() && (
          <div 
            className="auth-section" 
            style={{ 
              display: 'block !important', 
              visibility: 'visible !important', 
              opacity: '1 !important',
              padding: '20px',
              background: '#f8f9fa',
              borderTop: '1px solid #e0e0e0'
            }}
          >
            <button 
              className="auth-btn sign-up" 
              data-bs-toggle="modal" 
              data-bs-target="#sign_up_popup" 
              onClick={onClose}
              style={{ 
                display: 'block !important', 
                visibility: 'visible !important', 
                opacity: '1 !important', 
                width: '100%', 
                marginBottom: '10px',
                padding: '12px 20px',
                border: '1px solid #FF7A00',
                background: 'transparent',
                color: '#FF7A00',
                borderRadius: '8px',
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              Sign Up
            </button>
            <button 
              className="auth-btn sign-in" 
              data-bs-toggle="modal" 
              data-bs-target="#sign_up_popup2" 
              onClick={onClose}
              style={{ 
                display: 'block !important', 
                visibility: 'visible !important', 
                opacity: '1 !important', 
                width: '100%',
                padding: '12px 20px',
                border: '1px solid #FF7A00',
                background: 'transparent',
                color: '#FF7A00',
                borderRadius: '8px',
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              Sign In
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default HamburgerMenu;
