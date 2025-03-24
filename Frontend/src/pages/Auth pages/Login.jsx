import {Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa'; 
import axios from 'axios';
import { useAuthForm } from '../../hooks/useAuthForm'; 
import '../../styles/Auth.css';

export default function Login() {
  const { 
    formData, 
    passwordVisible, 
    error, 
    loading, 
    handleChange, 
    togglePasswordVisibility, 
    setError, 
    setLoading 
  } = useAuthForm({ email: '', password: '' });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 

    if (!formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData, { withCredentials: true });

      if (response.data) {
        sessionStorage.setItem('authToken', response.data.token); 
        navigate('/profile/create-user-profile');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Invalid email or password',err);
    } finally {
      setLoading(false); 
    }
  };

  const handleGoogleLogin = () =>{
    window.location.href = "http://localhost:5000/api/auth/google";
  }

  return (
    <div className="auth-container">
      <button className='back-btn' onClick={() => window.history.back()}>Back</button>
      <div className="auth-card">
        <h2 className="auth-title">Log in to Your Account</h2>
        
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="password-container">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="eye-icon" onClick={togglePasswordVisibility}>
              {passwordVisible ? <FaEyeSlash /> : <FaEye />} 
            </span>
          </div>
          
          <button type="submit" className="login-btn authForm-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <button className="btn-google authForm-btn" onClick={handleGoogleLogin}>
            <FaGoogle /> Continue with Google
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p className="auth-footer">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}
