import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OnboardingForm from '../../features/CareerGuidComponents/OnBoardingForm';
import CareerRecommendation from '../../features/CareerGuidComponents/CareerRecommendation';
import {LoggedInAccessRoute} from '../../components/ProtectedRoute';
import CareerAnalysis from '../../features/CareerAnalysisComponents/CareerAnalysis';

const CareerGuidMVP = () => {
  return (
    <Routes>
      <Route path="/career-guid/onboarding" element={<LoggedInAccessRoute><OnboardingForm /></LoggedInAccessRoute>} />
      <Route path="/career-guid/career-recommendation" element={<LoggedInAccessRoute><CareerRecommendation /></LoggedInAccessRoute>} />
      <Route path="/career-guid/career-analysis" element={<LoggedInAccessRoute><CareerAnalysis /></LoggedInAccessRoute>} />
    </Routes>
  )
}

export default CareerGuidMVP