import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthRoute, LoggedInAccessRoute } from './components/ProtectedRoute';
import AppState from './components/AppState';

const LandingPage = lazy(() => import('./pages/Public pages/Landing'));
const Signup = lazy(() => import('./pages/Auth pages/Signup'));
const Login = lazy(() => import('./pages/Auth pages/Login'));
const EmailVerification = lazy(() => import('./pages/Auth pages/EmailVerification'));
const ForgotPassword = lazy(() => import('./pages/Auth pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/User profile pages/Profile'));
const CareerGuidMVP = lazy(() => import('./pages/CareerGuid pages/CareerGuidMVP'));

function App() {
  return (
    <>
    <Suspense fallback={<AppState title="Opening your workspace" description="Just a moment while we prepare this view." />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/verify-email" element={<AuthRoute><EmailVerification /></AuthRoute>} />
      <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
      <Route path="/reset-password" element={<AuthRoute><ResetPassword /></AuthRoute>} />

      <Route path="/dashboard" element={<LoggedInAccessRoute><Dashboard /></LoggedInAccessRoute>} />
      <Route path="/profile/*" element={<LoggedInAccessRoute><Profile /></LoggedInAccessRoute>} />
      <Route path="/services/*" element={<CareerGuidMVP />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
    <ToastContainer position="bottom-right" autoClose={4500} closeOnClick pauseOnFocusLoss />
    </>
  );
}

export default App;
