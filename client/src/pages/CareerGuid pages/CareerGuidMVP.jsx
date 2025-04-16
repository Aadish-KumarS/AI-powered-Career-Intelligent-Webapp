import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OnboardingForm from '../../features/CareerGuidComponents/OnBoardingForm';

const CareerGuidMVP = () => {
  return (
    <Routes>
      <Route path="/career-guid/stage1" element={<OnboardingForm />} />
    </Routes>
  )
}

export default CareerGuidMVP