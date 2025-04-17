import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OnboardingForm from '../../features/CareerGuidComponents/OnBoardingForm';
import CareerRecommendation from '../../features/CareerGuidComponents/CareerRecommendation';

const CareerGuidMVP = () => {
  return (
    <Routes>
      <Route path="/career-guid/stage1" element={<OnboardingForm />} />
      <Route path="/career-guid/career-recommendation" element={<CareerRecommendation />} />
    </Routes>
  )
}

export default CareerGuidMVP