import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

  // const login = (token) => {
  //   sessionStorage.setItem('authToken', token);
  //   setIsAuthenticated(true);
  //   navigate('/dashboard');
  // };

  return (
    <AuthContext.Provider value={{ isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  );
}
