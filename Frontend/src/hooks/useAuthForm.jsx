import { useState } from 'react';

export const useAuthForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); 


  const checkPasswordStrength = (password) => {
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
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      const strength = checkPasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
  };

  
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  return {
    formData,
    passwordVisible,
    error,
    loading,
    setError,
    setLoading,
    handleChange,
    togglePasswordVisibility,
    passwordStrength,
    setPasswordStrength,
    setPasswordVisible
  };
};
