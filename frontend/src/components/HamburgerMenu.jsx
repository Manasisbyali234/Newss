import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onToggle, onClose }) => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <button className={`hamburger-btn ${isOpen ? 'active' : ''}`} onClick={onToggle}>
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && <div className="hamburger-overlay" onClick={onClose}></div>}

      <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="hamburger-header">
          <img src="/assets/images/logo-dark.png" alt="Logo" className="hamburger-logo" />
        </div>

        <div className="hamburger-content">
          <ul className="menu-list">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/job-grid" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
              >
                Jobs
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/emp-grid" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
              >
                Employers
              </NavLink>
            </li>
          </ul>

          {!isAuthenticated() && (
            <div className="auth-section">
              <button 
                className="auth-btn sign-up" 
                data-bs-toggle="modal" 
                data-bs-target="#sign_up_popup" 
                onClick={onClose}
              >
                Sign Up
              </button>
              <button 
                className="auth-btn sign-in" 
                data-bs-toggle="modal" 
                data-bs-target="#sign_up_popup2" 
                onClick={onClose}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default HamburgerMenu;