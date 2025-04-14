import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/Auth styles/Auth.css';
import { handleSubmitEmailVerification } from '../../utils/formHanderls';
import { resendOTP } from '../../utils/helper';

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
    handleSubmitEmailVerification(e,verificationCode,setError,navigate,location)
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
