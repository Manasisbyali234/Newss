import React, { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      setLoading(false);
      return;
    }

    try {
      const endpoints = [
        'http://localhost:5000/api/candidate/password/send-otp',
        'http://localhost:5000/api/employer/password/send-otp',
        'http://localhost:5000/api/placement/password/send-otp'
      ];
      
      let otpSentSuccess = false;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setSuccess(`OTP sent to ${email} successfully!`);
          setOtpSent(true);
          otpSentSuccess = true;
          break;
        }
      }
      
      if (!otpSentSuccess) {
        setError('This email is not registered. Please use a registered email address.');
      }
    } catch (error) {
      setError('Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const endpoints = [
        'http://localhost:5000/api/candidate/password/verify-otp',
        'http://localhost:5000/api/employer/password/verify-otp',
        'http://localhost:5000/api/placement/password/verify-otp'
      ];
      
      let resetSuccess = false;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setSuccess('Password reset successful! Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
          resetSuccess = true;
          break;
        }
      }
      
      if (!resetSuccess) {
        setError('Invalid or expired OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4" style={{ maxWidth: '500px' }}>
      <h2 className="mb-2">Forgot Password</h2>
      <p className="text-muted mb-4">Enter your email address and we will send you an OTP to reset your password.</p>
      
      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
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
          <button type="submit" className="w-100" disabled={loading} style={{
            backgroundColor: '#FFF3E5',
            color: '#FF7A00',
            border: '1px solid #FF7A00',
            padding: '10px 20px',
            borderRadius: '5px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
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
          <button type="submit" className="w-100" disabled={loading} style={{
            backgroundColor: '#FFF3E5',
            color: '#FF7A00',
            border: '1px solid #FF7A00',
            padding: '10px 20px',
            borderRadius: '5px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
