import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedAuthRoute from './components/ProtectedRoute';  // Ensure correct import
import Dashboard from './pages/Dashboard'; 
import Profile from './pages/Profile'; 

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
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
