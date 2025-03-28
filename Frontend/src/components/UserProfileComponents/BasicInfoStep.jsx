import React, { useRef, useState } from "react";
import InterestSelection from "./InterestSelection";
import MapComponent from './MapComponent'

const FormStep = ({ step, profileData, handleChange, handleFileChange, nextStep, prevStep, handleSubmit, error, formRef }) => {

  const [locationAccessStatus, setLocationAccessStatus] = useState('pending');
  const [userLocationData, setUserLocationData] = useState({
      location: '',
      latitude: 23.6345,
      longitude: 102.5528,
    });
  

  switch (step) {
    case 1:
      return (
        <div className="form-step" ref={formRef}>
          <h3>Basic Information</h3>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={profileData.name}
            onChange={handleChange}
            required
          />
          <div className="file-upload">
            <label>Profile Picture (Optional)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="education-container">
            <label>Education</label>
            <input
              type="text"
              name="education"
              placeholder="Your Education Background"
              value={profileData.education}
              onChange={handleChange}
              required={true}
            />
          </div>
          {profileData.profilePicture && (
            <img src={profileData.profilePicture} alt="Profile Preview" className="profile-preview" />
          )}
          {error && <p className="error-text">{error}</p>}
          <button type="button" className="next-btn" onClick={nextStep}>
            Next <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      );

    case 2:
      return (
        <div className="form-step" ref={formRef}>
          <h3>Location & Education</h3>
          <div className="location-container">
            <MapComponent userData={userLocationData} locationAccessStatus={locationAccessStatus} />
          </div>
          <div className="search-location-container">
            <label>Search location</label>
            <input
              type="text"
              placeholder="Search Location..."
              value={profileData.location}
              onChange={handleChange}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="buttons-container">
            <button type="button" className="create-profile-back-btn" onClick={prevStep}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <button type="button" className="next-btn" onClick={nextStep}>
              Next <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      );

    case 3:
      return (
        <InterestSelection
          profileData={profileData}
          setProfileData={handleChange}
          prevStep={prevStep}
          handleSubmit={handleSubmit}
        />
      );

    default:
      return null;
  }
};

export default FormStep;