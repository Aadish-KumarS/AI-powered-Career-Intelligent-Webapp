import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateUserProfile from '../../components/UserProfileComponents/CreateUserProfile';
import UserProfileView from '../../components/UserProfileComponents/UserProfileView';
import EditProfile from '../../components/UserProfileComponents/EditUserProfile';

const Profile = () => {
  return (
    <Routes>
      <Route path="/create-user-profile" element={<CreateUserProfile />} />
      <Route path="/user-profile" element={<UserProfileView />} />
      <Route path="/edit-profile" element={<EditProfile />} />
    </Routes>
  );
};

export default Profile;
