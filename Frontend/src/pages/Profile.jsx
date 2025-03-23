import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateUserProfile from '../components/UserProfileComponents/CreateUserProfile';
import UserProfileView from '../components/UserProfileComponents/UserProfileView';

const Profile = () => {
  return (
    <Routes>
      {/* Define your route path for CreateUserProfile */}
      <Route path="/create-user-profile" element={<CreateUserProfile />} />
      <Route path="/user-profile" element={<UserProfileView />} />
    </Routes>
  );
};

export default Profile;
