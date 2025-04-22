import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OnboardingForm from '../../features/CareerGuidComponents/OnBoardingForm';
import CareerRecommendation from '../../features/CareerGuidComponents/CareerRecommendation';
import Roadmap from '../../features/roadmap-generator/Roadmap'
import {LoggedInAccessRoute} from '../../components/ProtectedRoute';
import CareerAnalysis from '../../features/CareerAnalysisComponents/CareerAnalysis';
import LearningPath from '../../features/LearningPathComponents/LearningPath'
import ExamRecommendation from '../../features/Exam&CertificationComponents/ExamRecommendation'

const CareerGuidMVP = () => {
  return (
    <Routes>
      <Route path="/career-guid/onboarding" element={<LoggedInAccessRoute><OnboardingForm /></LoggedInAccessRoute>} />
      <Route path="/career-guid/career-recommendation" element={<LoggedInAccessRoute><CareerRecommendation /></LoggedInAccessRoute>} />
      <Route path="/career-guid/career-analysis" element={<LoggedInAccessRoute><CareerAnalysis /></LoggedInAccessRoute>} />
      <Route path="/generate-roadmap" element={<LoggedInAccessRoute><Roadmap /></LoggedInAccessRoute>} />
      <Route path="/learning-path" element={<LoggedInAccessRoute><LearningPath /></LoggedInAccessRoute>} />
      <Route path="/exam-certification" element={<LoggedInAccessRoute><ExamRecommendation /></LoggedInAccessRoute>} />
    </Routes>
  )
}

export default CareerGuidMVP