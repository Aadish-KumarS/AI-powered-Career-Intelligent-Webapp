import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); 

    if (!email.trim()) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    sessionStorage.setItem('email', JSON.stringify(email)); // Store email in session storage

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('A verification code has been sent to your email.');
        setTimeout(() => {
          navigate('/verify-email', { state: { purpose: 'forgot-password' } });
        }, 2000);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
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
