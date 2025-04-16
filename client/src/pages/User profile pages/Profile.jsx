import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateUserProfile from '../../components/UserProfileComponents/CreateUserProfile';
import UserProfileView from '../../components/UserProfileComponents/UserProfileView';
import EditProfile from '../../components/UserProfileComponents/EditUserProfile';
import ProtectedRoute from '../../components/ProtectedRoute';

const Profile = () => {
  return (
    <Routes>
        <Route path="/create-user-profile" element={ <ProtectedRoute> <CreateUserProfile /></ProtectedRoute>} />
      <Route path="/user-profile" element={<UserProfileView />} />
      <Route path="/edit-profile" element={<EditProfile />} />
    </Routes>
  );
};

export default Profile;
