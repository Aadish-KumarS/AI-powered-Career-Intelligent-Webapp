import { Navigate,useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getIsFirstTime } from "../utils/helper";

export const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const token = sessionStorage.getItem("authToken");
  
  if (isAuthenticated && token) {
    return <Navigate to="/profile/user-profile" />;
  }
  return children;
};


export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();
  const token = sessionStorage.getItem("authToken");
  const BASE_URL = "http://localhost:5000";
  
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirstTime = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }
      
      try {
        const status = await getIsFirstTime(token, BASE_URL);
        setIsFirstTime(status);
      } catch (error) {
        console.error("Error checking first time status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkFirstTime();
  }, [isAuthenticated, token]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (isFirstTime === true && location.pathname !== "/profile/create-user-profile") {
    return <Navigate to="/profile/create-user-profile" />;
  }
  if (isFirstTime === false && location.pathname === "/profile/create-user-profile") {
    return <Navigate to="/profile/user-profile" />;
  }

  return children;
};

export const LoggedInAccessRoute = ({ children }) => {
  const token = sessionStorage.getItem("authToken");
  
  if ( !token) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;