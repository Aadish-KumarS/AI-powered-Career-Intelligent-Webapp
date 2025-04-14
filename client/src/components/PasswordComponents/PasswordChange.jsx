import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordChangeFields = ({
  passwordData,
  setPasswordData,
  loading
}) => {
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const calculatePasswordStrength = (password) => {
    let strength = 0;

    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d@$!%*?&]{8,}$/;
    const mediumRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    const weakRegex = /^(?=.*\d)[A-Za-z\d@$!%*?&]{4,}$/;

    if (strongRegex.test(password)) {
      strength = 100;
    } else if (mediumRegex.test(password)) {
      strength = 60;
    } else if (weakRegex.test(password)) {
      strength = 30;
    } else {
      strength = 10;
    }

    return strength;
  };

  const passwordsMatch = () => {
    return passwordData.newPassword === passwordData.confirmPassword;
  };

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);
  const showMismatchError = passwordData.confirmPassword && !passwordsMatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="password-change-fields">
      <div className="form-group">
        <label>Current Password</label>
        <div className="password-container">
          <input
            type={currentPasswordVisible ? 'text' : 'password'}
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <span 
            className="eye-icon" 
            onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
          >
            {currentPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>New Password</label>
        <div className="password-container">
          <input
            type={newPasswordVisible ? 'text' : 'password'}
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <span 
            className="eye-icon" 
            onClick={() => setNewPasswordVisible(!newPasswordVisible)}
          >
            {newPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Confirm New Password</label>
        <div className="password-container">
          <input
            type={confirmPasswordVisible ? 'text' : 'password'}
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <span 
            className="eye-icon" 
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {passwordData.newPassword && (
          <>
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
          </>
        )}
        {showMismatchError && (
          <p className="error-text">Passwords do not match</p>
        )}
      </div>
    </div>
  );
};

export default PasswordChangeFields;