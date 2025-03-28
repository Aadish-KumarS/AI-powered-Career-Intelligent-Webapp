import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getIsFirstTime } from "../utils/helper";

const ProtectedAuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuthContext();  
  const navigate = useNavigate();
  const location = useLocation();  
  const BASE_URL = "http://localhost:5000";
  const token = sessionStorage.getItem("authToken");
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return; 
    }

    getIsFirstTime(token, navigate, BASE_URL, (status) => {
      setIsFirstTime(status);
      setLoading(false);
    });

  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isFirstTime === true) {
        navigate("/profile/create-user-profile");
      } else if (isFirstTime === false) {
        navigate(`/profile/user-profile`);
      }
    }
  }, [isFirstTime, isAuthenticated, loading, navigate]);

  if (loading) return null;

  const authRoutes = ["/signup", "/login", "/verify-email", "/forgot-password", "/reset-password"];
  if (!isAuthenticated && authRoutes.includes(location.pathname)) {
    return children;
  }

  return null;
};

export default ProtectedAuthRoute;
