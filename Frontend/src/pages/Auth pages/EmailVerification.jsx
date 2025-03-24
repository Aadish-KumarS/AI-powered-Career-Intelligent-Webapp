import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Auth.css';

export default function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const handleChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (verificationCode.length !== 6) {
      setError('Invalid verification code');
      return;
    }
  
    // const email = JSON.parse(sessionStorage.getItem('email'));

    // if (!email) {
    //   setError('Email not found');
    //   return;
    // }
  
    try {
      const response = await axios.post('http://localhost:5000/otp/verify-otp', {
        otp: verificationCode,
      });
  
      if (response.data.success) {
        if(location.state.purpose == 'forgot-password'){
          alert('Email verified successfully!');
          navigate('/reset-password')
        } else{
          alert('Email verified successfully!');
          navigate('/login');
        }
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Error during OTP verification:', err.response ? err.response.data : err);
      setError('An error occurred. Please try again later.');
    }
  };
  
  

  const resendOTP = async () => {
    const email = JSON.parse(sessionStorage.getItem('email'));

    if (!email) {
      alert('No email found');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/otp/request-otp', { email });
  
      if (response.data.success) {
        alert('OTP sent to your email.');
      } else {
        alert('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      alert('Error sending OTP. Please try again later.');
      console.error(err);
    }
  };
  

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Email Verification</h2>
        <p className="auth-text">Enter the 6-digit code sent to your email.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Code"
            value={verificationCode}
            onChange={handleChange}
            required
            maxLength={6}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="authForm-btn verify-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive a code? <span className="resend-code" onClick={resendOTP}>Resend Code</span>
        </p>
      </div>
    </div>
  );
}
