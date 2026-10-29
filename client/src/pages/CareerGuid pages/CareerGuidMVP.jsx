import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoggedInAccessRoute } from '../../components/ProtectedRoute';
import AppState from '../../components/AppState';

const OnboardingForm = lazy(() => import('../../features/CareerGuidComponents/OnBoardingForm'));
const CareerRecommendation = lazy(() => import('../../features/CareerGuidComponents/CareerRecommendation'));
const CareerAnalysis = lazy(() => import('../../features/CareerAnalysisComponents/CareerAnalysis'));
const Roadmap = lazy(() => import('../../features/roadmap-generator/Roadmap'));
const LearningPath = lazy(() => import('../../features/LearningPathComponents/LearningPath'));
const ExamRecommendation = lazy(() => import('../../features/Exam&CertificationComponents/ExamRecommendation'));

const CareerGuidMVP = () => (
  <Suspense fallback={<AppState title="Preparing your tool" description="We’re loading the workspace you selected." />}>
    <Routes>
      <Route index element={<Navigate to="career-guid/onboarding" replace />} />
      <Route path="career-guid/onboarding" element={<LoggedInAccessRoute><OnboardingForm /></LoggedInAccessRoute>} />
      <Route path="career-guid/career-recommendation" element={<LoggedInAccessRoute><CareerRecommendation /></LoggedInAccessRoute>} />
      <Route path="career-guid/career-analysis" element={<LoggedInAccessRoute><CareerAnalysis /></LoggedInAccessRoute>} />
      <Route path="generate-roadmap" element={<LoggedInAccessRoute><Roadmap /></LoggedInAccessRoute>} />
      <Route path="learning-path" element={<LoggedInAccessRoute><LearningPath /></LoggedInAccessRoute>} />
      <Route path="exam-certification" element={<LoggedInAccessRoute><ExamRecommendation /></LoggedInAccessRoute>} />
      <Route path="*" element={<Navigate to="career-guid/onboarding" replace />} />
    </Routes>
  </Suspense>
);

export default CareerGuidMVP;
