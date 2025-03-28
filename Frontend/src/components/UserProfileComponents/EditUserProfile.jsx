import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../styles/UserProfile Styles/EditProfile.css'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchIPBasedLocation, fetchUserProfile, getGeoLocation } from '../../utils/apiCalls';
import { handleInputChange, handleInterestToggle, handlePasswordChange } from '../../utils/helper';
import MapComponent from './MapComponent';
import { CiSearch } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";



gsap.registerPlugin(ScrollTrigger);

export default function EditProfile() {
  const [userData, setUserData] = useState({
    name: '',
    location: '',
    latitude: 23.6345,
    longitude: 102.5528,
    education: '',
    interests: []
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [locationAccessStatus, setLocationAccessStatus] = useState('pending');
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  const profileSectionRef = useRef(null);
  const passwordSectionRef = useRef(null);

  const availableInterests = [
    'Technology', 'Science', 'Art', 'Music', 
    'Sports', 'Literature', 'Traveling'
  ];


  // Get user's device location
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      getGeoLocation(setUserData,setLocationAccessStatus,setError)
    } else {
      fetchIPBasedLocation(setUserData, setError, setLocationAccessStatus)
    }
  };

  // Initial data fetch and location setup
  useEffect(() => {
    // First, try to load from session storage
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

    // Fetch user profile from API
    fetchUserProfile (setUserData,setError) 

    // GSAP Animations
    const profileSection = profileSectionRef.current;
    const passwordSection = passwordSectionRef.current;

    gsap.fromTo(profileSection, 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: profileSection,
          start: 'top 80%'
        }
      }
    );

    gsap.fromTo(passwordSection, 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: passwordSection,
          start: 'top 80%'
        }
      }
    );
  }, []);


  // Map initialization effect
  useEffect(() => {
    // Remove existing map if it exists
    if (map) {
      map.remove();
    }

    // Always create map if latitude and longitude are available
    if (userData.latitude && userData.longitude && mapRef.current) {
      const newMap = L.map(mapRef.current).setView(
        [userData.latitude, userData.longitude], 
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(newMap);

      L.marker([userData.latitude, userData.longitude])
        .addTo(newMap)
        .bindPopup(userData.location || 'Current Location')
        .openPopup();

      setMap(newMap);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [userData.latitude, userData.longitude]);

  // Handle location search using OpenStreetMap Nominatim API
  const handleLocationSearch = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationSearch}`
      );
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to search locations',err);
    }
  };

  const selectLocation = (location) => {
    setUserData({
      ...userData,
      location: location.display_name,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon)
    });
    setLocationSearch('');
    setSearchResults([]);
  };


  // Update profile
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.put(
        'http://localhost:5000/api/users/update-profile', 
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update session storage
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
      setSuccessMessage('Profile updated successfully');
      setError('');
    } catch (err) {
      setError('Failed to update profile',err);
      setSuccessMessage('');
    }
  };

  // Update password
  const updatePassword = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.put(
        'http://localhost:5000/api/users/update-password', 
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessMessage('Password updated successfully');
      setError('');
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Failed to update password');
      setSuccessMessage('');
    }
  };

  // Delete account
  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      try {
        const token = sessionStorage.getItem('authToken');
        await axios.delete('http://localhost:5000/api/users/delete-account', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Clear all stored data and redirect
        sessionStorage.clear();
        window.location.href = '/login';
      } catch (err) {
        setError('Failed to delete account');
      }
    }
  };

  return (
    <div className="edit-profile-container">
      {/* Profile Section */}
      <section ref={profileSectionRef} className="profile-section">
        <h2> <span> <FaEdit /> </span> Edit User Profile</h2>
        <form onSubmit={updateProfile}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange(setUserData)}
              required
            />
          </div>

          {/* Location Search and Map Container */}
          <div className="form-group location-search">
            <label>Location</label>
            <div className="search-container">
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Search location"
              />
              <button 
                type="button" 
                onClick={handleLocationSearch}
                className="search-btn"
              >
                Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((location, index) => (
                  <div 
                    key={index} 
                    onClick={() => selectLocation(location)}
                    className="search-result-item"
                  >
                    {location.display_name}
                  </div>
                ))}
              </div>
            )}

            {/* Always visible map container */}
            <MapComponent userData={userData} locationAccessStatus={locationAccessStatus} />

            {userData.location && (
              <p className="selected-location">
                Selected: {userData.location}
              </p>
            )}
          </div>

          {/* Education Input */}
          <div className="form-group">
            <label>Education</label>
            <input
              type="text"
              name="education"
              value={userData.education}
              onChange={handleInputChange}
            />
          </div>

          {/* Interests Selection */}
          <div className="form-group interests-group">
            <label>Interests</label>
            <div className="interests-grid">
              {availableInterests.map(interest => (
                <div 
                  key={interest} 
                  className={`interest-item ${
                    userData.interests?.includes(interest) ? 'selected' : ''
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button type="submit" className="update-btn primaray-btn">
            Update Profile
          </button>
        </form>
      </section>

      {/* Password Section */}
      <section ref={passwordSectionRef} className="password-section">
        <h2>Change Password</h2>
        <form onSubmit={updatePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange(setPasswordData)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange(setPasswordData)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange(setPasswordData)}
              required
            />
          </div>

          <button type="submit" className="change-password-btn">
            Change Password
          </button>
        </form>

        {/* Delete Account Section */}
        <div className="delete-account-section">
          <h3>Delete Account</h3>
          <p>Warning: This action cannot be undone</p>
          <button 
            onClick={deleteAccount} 
            className="delete-account-btn"
          >
            Delete My Account
          </button>
        </div>
      </section>
    </div>
  );
}