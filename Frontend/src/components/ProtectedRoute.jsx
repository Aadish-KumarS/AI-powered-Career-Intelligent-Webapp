import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useEffect } from 'react';

const ProtectedAuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuthContext();  
  const navigate = useNavigate();

  useEffect(() => {
    
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]); 

  if (isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedAuthRoute;
