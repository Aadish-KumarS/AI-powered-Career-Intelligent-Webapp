import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordFields = ({ 
  formData, 
  onChange, 
  passwordStrength 
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showMismatchError = formData.confirmPassword && !passwordsMatch;

  return (
    <>
      <div className="password-container">
        <input
          type={passwordVisible ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={onChange}
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
          onChange={onChange}
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

      {showMismatchError && (
        <p className="error-text">Passwords do not match</p>
      )}
    </>
  );
};

export default PasswordFields;