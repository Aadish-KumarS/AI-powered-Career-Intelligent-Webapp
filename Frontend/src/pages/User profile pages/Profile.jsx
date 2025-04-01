import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateUserProfile from '../../components/UserProfileComponents/CreateUserProfile';
import UserProfileView from '../../components/UserProfileComponents/UserProfileView';
import EditProfile from '../../components/UserProfileComponents/EditUserProfile';
import ProtectedFirstTimeRoute from '../../components/ProtectedRoutes/ProtectedFirstTimeRoute';

const Profile = () => {
  return (
    <Routes>
      <Route element={<ProtectedFirstTimeRoute />}>
          <Route path="/create-user-profile" element={<CreateUserProfile />} />
        </Route>
      <Route path="/user-profile" element={<UserProfileView />} />
      <Route path="/edit-profile" element={<EditProfile />} />
    </Routes>
  );
};

export default Profile;
