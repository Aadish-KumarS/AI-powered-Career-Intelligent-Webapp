/* eslint-disable react-refresh/only-export-components -- this module intentionally exports the matching context hook. */
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const refreshAuthentication = useCallback(() => {
    const tokenFromSessionStorage = sessionStorage.getItem('authToken');
    const tokenFromCookies = document.cookie.split('; ').find(row => row.startsWith('token='));
    setIsAuthenticated(Boolean(tokenFromSessionStorage || tokenFromCookies));
  }, []);

  useEffect(() => {
    refreshAuthentication();
    window.addEventListener('storage', refreshAuthentication);
    window.addEventListener('auth-updated', refreshAuthentication);
    return () => {
      window.removeEventListener('storage', refreshAuthentication);
      window.removeEventListener('auth-updated', refreshAuthentication);
    };
  }, [refreshAuthentication]);

  const value = useMemo(() => ({ isAuthenticated, refreshAuthentication }), [isAuthenticated, refreshAuthentication]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
