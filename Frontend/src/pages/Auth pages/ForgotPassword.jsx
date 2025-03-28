import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleSubmitForgotPassword } from '../../utils/formHanderls';

axios.defaults.withCredentials = true;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    handleSubmitForgotPassword(e,setError,setSuccess,setLoading,email,navigate)
  };

  return (
    <div className="auth-container">
      <button className="back-btn" onClick={() => window.history.back()}>
        Back
      </button>
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password?</h2>
        <p className="auth-subtitle">
          Enter your registered email to receive a reset code.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}
          <button
            type="submit"
            className="authForm-btn send-resend-btn"
            disabled={loading} 
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
