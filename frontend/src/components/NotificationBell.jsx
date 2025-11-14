import { useEffect, useState, useRef } from 'react';
import './NotificationBell.css';

const NotificationBell = ({ userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (unreadCount > 0) {
      setAnimateBell(true);
      setAnimateBadge(true);
      const t = setTimeout(() => {
        setAnimateBell(false);
        setAnimateBadge(false);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [unreadCount]);

  useEffect(() => {
    if (userRole) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem(`${userRole}Token`);
      if (!token) {
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/notifications/${userRole}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem(`${userRole}Token`);
      if (!token) return;
      
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      // Silent error handling
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem(`${userRole}Token`);
      if (!token) return;
      
      await fetch(`http://localhost:5000/api/notifications/${userRole}/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      // Silent error handling
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div 
        onClick={() => userRole && setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          cursor: userRole ? 'pointer' : 'default',
          padding: '8px',
          borderRadius: '50%',
          transition: 'background-color 0.2s',
          backgroundColor: unreadCount > 0 ? '#e3f2fd' : 'transparent'
        }}
      >
        <i className={`fa fa-bell ${animateBell ? 'bell-wiggle' : ''}`} style={{ fontSize: '18px' }}></i>
        {userRole && unreadCount > 0 && (
          <span className={`notif-badge ${animateBadge ? 'badge-pop' : ''}`} style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#ff4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      {userRole && isOpen && (
        <div className="notification-dropdown" style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? '60px' : '100%',
          right: isMobile ? '10px' : '0',
          width: isMobile ? 'calc(100vw - 20px)' : '300px',
          maxWidth: isMobile ? '360px' : '300px',
          background: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 999999,
          left: isMobile ? '10px' : 'auto',
          transform: 'none',
          marginTop: '0',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}>
            <h4 style={{ margin: 0, fontSize: '16px', flexShrink: 0, lineHeight: '24px' }}>Notifications</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="mark-all-read-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    padding: '0',
                    lineHeight: '24px',
                    height: '24px'
                  }}
                >
                  Mark all as read
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="notification-close-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '0',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  lineHeight: '1',
                  width: '24px',
                  height: '24px'
                }}
                title="Close notifications"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="notification-dropdown-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                  className="notification-item"
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: !notification.isRead ? '#e3f2fd' : 'white',
                    borderLeft: !notification.isRead ? '3px solid #007bff' : 'none'
                  }}
                >
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
                    {notification.title}
                  </h5>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666', whiteSpace: 'pre-line' }}>
                    {notification.message.length > 150 ? notification.message.substring(0, 150) + '...' : notification.message}
                  </p>
                  <small style={{ color: '#999', fontSize: '11px' }}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
