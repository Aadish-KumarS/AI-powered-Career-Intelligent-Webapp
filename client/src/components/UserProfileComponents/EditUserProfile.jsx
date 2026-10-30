import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getUserData, handleInputChange, fetchIPBasedLocation, getGeoLocation, addInterest, removeInterest, updatePassword, deleteAccount, updateProfile, handleCreateUserFileChange, fetchSuggestions, handleInterestInputChange } from '../../utils/helper';
import MapComponent from './MapComponent';
import { FaSave, FaKey, FaTrash, FaInfoCircle } from "react-icons/fa";
import PasswordChangeFields from '../PasswordComponents/PasswordChange'; 
import '../../styles/Global Styles/profile-theme.css';
import '../../styles/UserProfile Styles/EditProfile.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import AppDialog from '../AppDialog';
import Navbar from '../LandingPageComponents/Navbar';

export default function EditProfile() {
  const [userData, setUserData] = useState({
    name: '',
    location: '',
    latitude: 23.6345,
    longitude: 102.5528,
    education: {
      highestLevel: "",
      institution: "",
      graduationYear: "",
      fieldOfStudy: ""
    },
    interests: [],
    profilePicture: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [, setLocationAccessStatus] = useState('pending');
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  

  // Section refs for scrolling
  const nameRef = useRef(null);
  const locationRef = useRef(null);
  const educationRef = useRef(null);
  const interestsRef = useRef(null);
  const passwordRef = useRef(null);
  const deleteAccountRef = useRef(null);
  const dropdownRef = useRef(null);
  const pictureRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      getGeoLocation(setUserData, setLocationAccessStatus, setError)
    } else {
      fetchIPBasedLocation(setUserData, setError, setLocationAccessStatus)
    }
  };

  // Scroll to section function
  const scrollToSection = (ref) => {
    window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const handleFetchSuggestions = useCallback(
    (query) => fetchSuggestions(query, setSuggestions, setLoading, setError),
    []
  );

  // Initial data fetch and location setup
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      if (!parsedUserData.latitude || !parsedUserData.longitude) {
        getUserLocation();
      }
    } else {
      getUserLocation();
    }

    const token = sessionStorage.getItem('authToken');
    getUserData(API_BASE_URL, token, setUserData);

  }, []);


  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setLoading(true);
    updatePassword(
      e, 
      passwordData, 
      setError, 
      setSuccessMessage, 
      setPasswordData,
      setLoading
    );
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    const deleted = await deleteAccount(setError, true);
    setLoading(false);
    setShowDeleteDialog(false);
    if (deleted) navigate('/login', { replace: true });
  };

  return (
    <div className="profile-editor-container">
      <Navbar variant="app" />
      <div className="profile-editor-workspace">
        <header className="profile-editor-header">
          <div>
            <p className="editor-eyebrow">Career profile</p>
            <h1>Keep your profile useful.</h1>
            <p>These details make every recommendation, analysis, and roadmap more relevant to you.</p>
          </div>
          <button type="button" className='back-btn' onClick={() => navigate('/profile/user-profile')}>Back to profile</button>
        </header>

        <div className="content-wrapper">
        <aside className="side-menu">

          <div className="menu-section">
            <h3><FaInfoCircle /> Personal Info</h3>
            <ul>
              <li><button type="button" className="menu-link" onClick={() => { setActiveSection('personalInfo'); scrollToSection(nameRef); }}>Full Name</button></li>
              <li><button type="button" className="menu-link" onClick={() => { setActiveSection('personalInfo'); scrollToSection(locationRef); }}>Location</button></li>
              <li><button type="button" className="menu-link" onClick={() => { setActiveSection('personalInfo'); scrollToSection(educationRef); }}>Education</button></li>
              <li><button type="button" className="menu-link" onClick={() => { setActiveSection('personalInfo'); scrollToSection(pictureRef); }}>Profile Picture</button></li>
              <li><button type="button" className="menu-link" onClick={() => { setActiveSection('personalInfo'); scrollToSection(interestsRef); }}>Interests</button></li>
            </ul>
          </div>
          
          <div className="menu-section">
            <h3><FaKey /> Security</h3>
            <ul>
              <li><button type="button" className="menu-link" onClick={() => { setActiveSection('security'); scrollToSection(passwordRef); }}>Change Password</button></li>
              <li><button type="button" className="menu-link" onClick={() => { setActiveSection('security'); scrollToSection(deleteAccountRef); }}>Delete Account</button></li>
            </ul>
          </div>
        </aside>

        <main className="main-content">
          {activeSection === 'personalInfo' && (
            <form className="personal-info-form">
              <div className="form-section" ref={nameRef}>
                <h2>Full Name</h2>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange(setUserData)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="form-section" ref={locationRef}>
                <h2>Location</h2>
                <div className="form-group location-search">
                  <MapComponent userData={userData} setUserData={setUserData} />
                </div>
              </div>

              <div className="form-section" ref={educationRef}>
                <h2>Education</h2>
                <div className="form-group">
                  <input
                    type="text"
                    name="education.fieldOfStudy"
                    value={userData.education.fieldOfStudy}
                    onChange={handleInputChange(setUserData)}
                    placeholder="Enter your education details"
                  />
                </div>
              </div>

              <div className="form-section" ref={pictureRef}>
              <div className="file-upload">
                <h2>Profile Picture</h2>
                <div className="form-group">
                  <input type="file" accept="image/*" onChange={(e) => handleCreateUserFileChange(e,setUserData,userData)} />
                </div>
                {userData.profilePicture && (
                  <img src={userData.profilePicture} alt="Profile Preview" className="profile-preview" />
                )}
              </div>
              </div>

              <div className="form-section" ref={interestsRef}>
                <h2>Interests</h2>
                <div className="interest-input-wrapper" ref={dropdownRef}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInterestInputChange(e, setInputValue, handleFetchSuggestions)}
                    placeholder="Add more skills/interests..."
                    className="interest-input"
                  />

                  {inputValue && suggestions.length > 0 && (
                    <ul className="interests-dropdown">
                      {suggestions.slice(0, 10).map((suggestion, index) => (
                        <li 
                          key={index} 
                          onClick={(e) => addInterest(e.target.textContent, userData, setUserData, setInputValue, setSuggestions)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}

                  {loading && <p className="loading-text">Finding suggestions...</p>}
                  {error && <p className="error-text">{error}</p>}
                </div>

                <div className="selected-interests">
                  <h3>Selected Interests</h3>
                  <div className="selected-interests-items">
                    {userData.interests.map(interest => (
                      <span 
                        key={interest} 
                        className="selected-interest-tag"
                      >
                        {interest} <span className='deleted-interest-tag' onClick={() => removeInterest(interest, setUserData)}>✕</span> 
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  type="button"
                  className="save-changes-btn center" 
                  onClick={(e) => updateProfile(e, userData, setError, setSuccessMessage,setLoading,navigate)}
                >
                    {loading ? (
                      <>
                        <span className="spinner"></span> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> Save Changes
                      </>
                    )}
                </button>
              </div>
            </form>
          )}

          {activeSection === 'security' && (
            <div className="security-content">
              <div className="form-section" ref={passwordRef}>
                <h2>Change Password</h2>
                <form 
                  onSubmit={handlePasswordUpdate} 
                  className="password-form"
                >
                  <PasswordChangeFields 
                    passwordData={passwordData}
                    setPasswordData={setPasswordData}
                    loading={loading}
                  />
                  
                  <button type="submit" className="change-password-btn" disabled={loading}>
                    {loading ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>

              <div className="form-section delete-account-section" ref={deleteAccountRef}>
                <h2 className='delete-title'>Delete Account</h2>
                <div className="warning-box">
                  <p>Warning: This action cannot be undone. All your data will be permanently deleted.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="delete-account-btn center"
                  disabled={loading}
                >
                  <FaTrash /> Delete My Account
                </button>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
        </main>
      </div>
      </div>
      <AppDialog
        open={showDeleteDialog}
        title="Delete your account?"
        description="This permanently removes your profile and saved data. This action cannot be undone."
        confirmLabel="Delete account"
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        busy={loading}
        tone="danger"
      />
    </div>
  );
}
