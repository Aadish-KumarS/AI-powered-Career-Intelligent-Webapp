import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/Auth styles/Auth.css';
import { useAuthForm } from '../../hooks/useAuthForm';
import { handleSubmitSignup } from '../../utils/formHanderls';
axios.defaults.withCredentials = true;

export default function Signup() {
  const [success, setSuccess] = useState('');
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const { 
    formData, 
    passwordVisible, 
    error, 
    handleChange, 
    setError, 
    passwordStrength,
    setPasswordVisible,
    setLoading,
    loading
  } = useAuthForm({  name: '', email: '', password: '', confirmPassword: ''  });

  const handleSubmit = async (e) => {
    handleSubmitSignup(e,setLoading,formData,setError,validateEmail,setSuccess,navigate)
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleGoogleAuth = () => {
    window.open(`${BASE_URL}/api/auth/google`, "_self");
  };

  return (
    <div className="auth-container">
      <div>
      </div>
      <button className='back-btn' onClick={() => window.history.back()}>Back</button>
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          {error && formData.email && !validateEmail(formData.email) && (
            <p className="error-text">Invalid email format</p>
          )}

          <div className="password-container">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Password"
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
            <span
              className="eye-icon"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
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

          <button type="submit" className="signup-btn authForm-btn">
            {loading ? 'Signing Up ...' : 'Sign Up '}
          </button>
          <button className="btn-google authForm-btn" onClick={handleGoogleAuth}>
            <FaGoogle /> Sign up with Google
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
