import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AppState from '../AppState';

const ProtectedFirstTimeRoute = () => {
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/users/profile");
        setIsFirstTime(response.data.isFirstTime);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsFirstTime(false); 
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <AppState title="Loading your profile" description="We’re checking where to take you next." />;

  return isFirstTime ? <Outlet /> : <Navigate to="/profile/user-profile" replace />;
};

export default ProtectedFirstTimeRoute;
