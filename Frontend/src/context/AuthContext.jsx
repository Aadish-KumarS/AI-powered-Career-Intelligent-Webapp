import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  
  const isAuthenticatedFun = () => {
    const tokenFromSessionStorage = sessionStorage.getItem('authToken');
    const tokenFromCookies = document.cookie.split('; ').find(row => row.startsWith('token='));
    return tokenFromSessionStorage || tokenFromCookies;
  };

  useEffect(() => {
    
    setIsAuthenticated(isAuthenticatedFun())
    if (isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    sessionStorage.setItem('authToken', token);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
