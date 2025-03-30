import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/Auth styles/Auth.css';
import { useAuthForm } from '../../hooks/useAuthForm';
import { handleSubmitSignup } from '../../utils/formHanderls';
import PasswordFields from '../../components/PasswordComponents/PasswordInput';
axios.defaults.withCredentials = true;

export default function Signup() {
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const { 
    formData, 
    error, 
    handleChange, 
    setError, 
    passwordStrength,
    setLoading,
    loading
  } = useAuthForm({ name: '', email: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    handleSubmitSignup(e, setLoading, formData, setError, validateEmail, setSuccess, navigate)
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

          <PasswordFields 
            formData={formData}
            onChange={handleChange}
            passwordStrength={passwordStrength}
          />

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