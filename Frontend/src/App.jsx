import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Public pages/Landing';

import Signup from './pages/Auth pages/Signup';
import Login from './pages/Auth pages/Login';
import EmailVerification from './pages/Auth pages/EmailVerification';
import ForgotPassword from './pages/Auth pages/ForgotPassword';
import ResetPassword from './pages/Auth pages/ResetPassword';

import ProtectedAuthRoute from './components/ProtectedRoute';  // Ensure correct import

import Dashboard from './pages/Dashboard'; 
import Profile from './pages/User profile pages/Profile'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/signup" element={<ProtectedAuthRoute><Signup /></ProtectedAuthRoute>} />
      <Route path="/login" element={<ProtectedAuthRoute><Login /></ProtectedAuthRoute>} />
      <Route path="/verify-email" element={<ProtectedAuthRoute><EmailVerification /></ProtectedAuthRoute>} />
      <Route path="/forgot-password" element={<ProtectedAuthRoute><ForgotPassword /></ProtectedAuthRoute>} />
      <Route path="/reset-password" element={<ProtectedAuthRoute><ResetPassword /></ProtectedAuthRoute>} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile/*" element={<Profile />} />
    </Routes>
  );
}

export default App;
