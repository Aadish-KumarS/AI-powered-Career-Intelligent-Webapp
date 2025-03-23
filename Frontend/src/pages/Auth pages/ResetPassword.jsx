import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../styles/Auth.css';
import { useAuthForm } from '../../hooks/useAuthForm';

export default function ResetPassword() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  
  const email = JSON.parse(sessionStorage.getItem('email'));

  const { 
    formData, 
    passwordStrength, 
    handleChange, 
    setError: setFormError, 
    setPasswordVisible: setFormPasswordVisible 
  } = useAuthForm({ password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter a new password for your account.</p>
        <form onSubmit={handleSubmit}>

          <div className="password-container">
            <input 
              type={passwordVisible ? 'text' : 'password'} 
              name="password" 
              placeholder="New Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
            <span className="eye-icon" onClick={() => setPasswordVisible(!passwordVisible)}>
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-container">
            <input 
              type={confirmPasswordVisible ? 'text' : 'password'} 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />
            <span className="eye-icon" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-strength-bar-container">
            <progress
              className="password-strength-bar"
              value={passwordStrength}
              max="100"
            />
          </div>
          <p className="password-strength-text">
            {passwordStrength >= 80 ? 'Strong' : passwordStrength >= 50 ? 'Medium' : 'Weak'}
          </p>

          {error && formData.password !== formData.confirmPassword && (
            <p className="error-text">Passwords do not match</p>
          )}

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <button type="submit" className="authForm-btn reset-pass-btn">Reset Password</button>
        </form>
      </div>
    </div>
  );
}
