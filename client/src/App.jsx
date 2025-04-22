import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Public pages/Landing';

import Signup from './pages/Auth pages/Signup';
import Login from './pages/Auth pages/Login';
import EmailVerification from './pages/Auth pages/EmailVerification';
import ForgotPassword from './pages/Auth pages/ForgotPassword';
import ResetPassword from './pages/Auth pages/ResetPassword';

import  { AuthRoute } from './components/ProtectedRoute'; 

import Dashboard from './pages/Dashboard'; 
import Profile from './pages/User profile pages/Profile'; 
import CareerGuidMVP from './pages/CareerGuid pages/CareerGuidMVP';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/verify-email" element={<AuthRoute><EmailVerification /></AuthRoute>} />
      <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
      <Route path="/reset-password" element={<AuthRoute><ResetPassword /></AuthRoute>} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile/*" element={<Profile />} />
      <Route path="/services/*" element={<CareerGuidMVP />} />

    </Routes>
  );
}

export default App;
