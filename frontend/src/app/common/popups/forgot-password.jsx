import React, { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email.includes('@')) {
      setMessage('Please enter a valid email.');
      setLoading(false);
      return;
    }

    try {
      const endpoints = [
        'http://localhost:5000/api/candidate/password/send-otp',
        'http://localhost:5000/api/employer/password/send-otp',
        'http://localhost:5000/api/admin/password/send-otp',
        'http://localhost:5000/api/placement/password/send-otp'
      ];
      
      let success = false;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setMessage('OTP sent to your email successfully!');
          setOtpSent(true);
          success = true;
          break;
        }
      }
      
      if (!success) {
        setMessage('Email not registered');
      }
    } catch (error) {
      setMessage('Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const endpoints = [
        'http://localhost:5000/api/candidate/password/verify-otp',
        'http://localhost:5000/api/employer/password/verify-otp',
        'http://localhost:5000/api/admin/password/verify-otp',
        'http://localhost:5000/api/placement/password/verify-otp'
      ];
      
      let success = false;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setMessage('Password reset successful! Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          success = true;
          break;
        }
      }
      
      if (!success) {
        setMessage('Invalid or expired OTP');
      }
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4">Forgot Password</h2>
      
      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn twm-bg-orange w-100" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <label className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn twm-bg-orange w-100">
            Reset Password
          </button>
        </form>
      )}

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}

export default ForgotPassword;
