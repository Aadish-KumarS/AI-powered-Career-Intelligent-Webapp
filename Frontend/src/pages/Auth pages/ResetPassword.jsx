import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../styles/Auth styles/Auth.css';
import { useAuthForm } from '../../hooks/useAuthForm';
import { handleSubmitResetPassword } from '../../utils/formHanderls';


export default function ResetPassword() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  

  const { 
    formData, 
    passwordStrength, 
    handleChange, 
    setError: setFormError, 
    setPasswordVisible: setFormPasswordVisible 
  } = useAuthForm({ password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    handleSubmitResetPassword(e,setError,setSuccess,formData,navigate)
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
