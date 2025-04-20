import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Public pages/Landing';

import Signup from './pages/Auth pages/Signup';
import Login from './pages/Auth pages/Login';
import EmailVerification from './pages/Auth pages/EmailVerification';
import ForgotPassword from './pages/Auth pages/ForgotPassword';
import ResetPassword from './pages/Auth pages/ResetPassword';

import  { AuthRoute, LoggedInAccessRoute } from './components/ProtectedRoute'; 

import Dashboard from './pages/Dashboard'; 
import Profile from './pages/User profile pages/Profile'; 
import Roadmap from './features/roadmap-generator/Roadmap';
import CareerGuidMVP from './pages/CareerGuid pages/CareerGuidMVP';
import LearningPath from './features/LearningPathComponents/LearningPath';

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

      <Route path="/services/generate-roadmap" element={<LoggedInAccessRoute><Roadmap /></LoggedInAccessRoute>} />

      <Route path="/services/learning-path" element={<LoggedInAccessRoute><LearningPath /></LoggedInAccessRoute>} />
    </Routes>
  );
}

export default App;
