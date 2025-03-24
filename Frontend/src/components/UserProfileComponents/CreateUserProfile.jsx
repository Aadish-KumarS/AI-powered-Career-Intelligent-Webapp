/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/UserProfile Styles/CreateProfile.css";
import gsap from "gsap";

import img1 from "../../assets/img1.jpg";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.jpg";
import InterestSelection from "./InterestSelection";

export default function CreateProfile() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    profilePicture: "",
    location: "",
    latitude: null,
    longitude: null,
    education: "",
    interests: [],
  });
  const [error, setError] = useState("");
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const BASE_URL = "http://localhost:5000";
  const token = sessionStorage.getItem('authToken');
  const formRef = useRef(null);


  // Handle input changes for text fields
  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Handle file upload for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle interest selection (multiple interests can be selected)
  const handleInterestChange = (e) => {
    const interest = e.target.value;
    if (e.target.checked) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, interest],
      });
    } else {
      setProfileData({
        ...profileData,
        interests: profileData.interests.filter((item) => item !== interest),
      });
    }
  };

  const [scriptLoaded, setScriptLoaded] = useState(false);
  // Load Google Maps API script asynchronously
  useEffect(() => {
    if (step === 2 && !scriptLoaded) {
      const googleMapScript = document.createElement("script");
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      googleMapScript.async = true;
      googleMapScript.defer = true;

      // When the script is loaded, set the flag and initialize the map
      googleMapScript.onload = () => {
        setScriptLoaded(true); // Mark that the script has loaded
      };

      window.document.body.appendChild(googleMapScript);

      return () => {
        window.document.body.removeChild(googleMapScript);
      };
    }
  }, [step, scriptLoaded]);

  // Initialize Google Maps when script is loaded and step is 2
  useEffect(() => {
    if (step === 2 && scriptLoaded && !map && window.google) {
      const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
      });

      const newMarker = new window.google.maps.Marker({
        position: defaultLocation,
        map: newMap,
        draggable: true,
      });

      newMap.addListener("click", (event) => {
        newMarker.setPosition(event.latLng);
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setProfileData({
          ...profileData,
          latitude: lat,
          longitude: lng,
        });

        // Get address from coordinates (reverse geocoding)
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: event.latLng }, (results, status) => {
          if (status === "OK" && results[0]) {
            setProfileData({
              ...profileData,
              location: results[0].formatted_address,
              latitude: lat,
              longitude: lng,
            });
          }
        });
      });

      setMap(newMap);
      setMarker(newMarker);
    }
  }, [step, scriptLoaded, map, profileData]);



  // Initial animations
  useEffect(() => {
    gsap.fromTo(".left-form", 
      {
        opacity: 0, 
        x: -100 
      }, 
      {
        opacity: 1, 
        x: 0, 
        ease: "power2.out", 
        duration: 1.5, 
        delay: 0.3
      });
  
    gsap.fromTo(".right-content", 
      {
        opacity: 0, 
        x: 100
      }, 
      {
        opacity: 1, 
        x: 0, 
        ease: "power2.out", 
        duration: 1.5, 
        delay: 0.5
      });
  
    gsap.fromTo(".card", 
      {
        opacity: 0, 
        y: 100
      }, 
      {
        opacity: 1, 
        y: 0, 
        stagger: 0.2, 
        ease: "bounce.out", 
        duration: 1, 
        delay: 1
      });
  
    gsap.fromTo(".create-btn, .next-btn", 
      {
        scale: 0.8, 
        opacity: 0
      }, 
      {
        scale: 1, 
        opacity: 1, 
        ease: "power2.out", 
        duration: 1, 
        delay: 1.2
      });
  }, []);

  // Animation for step transitions
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          ease: "power3.out",
          duration: 0.8
        }
      );
    }
  }, [step]);

  // Handle step navigation
  const nextStep = () => {
    // Validate first step
    if (step === 1 && !profileData.name && !profileData.bio) {
      setError("Name and bio are required");
      return;
    }
    
    setError("");
    
    // Animate out current form
    gsap.to(formRef.current, {
      opacity: 0,
      y: -30,
      ease: "power3.in",
      duration: 0.5,
      onComplete: () => {
        setStep(step + 1);
      }
    });
  };

  const prevStep = () => {
    // Animate out current form
    gsap.to(formRef.current, {
      opacity: 0,
      y: 30,
      ease: "power3.in",
      duration: 0.5,
      onComplete: () => {
        setStep(step - 1);
      }
    });
  };

  // Handle final form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.bio) {
      setError("Name and bio are required");
      return;
    }
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/users/create-profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();

      if (response.ok) {
        // Animate success
        gsap.to(formRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(formRef.current, {
              scale: 0,
              opacity: 0,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => navigate("/profile/user-profile")
            });
          }
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    }
  };

  // Render different form steps
  const renderFormStep = () => {
    switch(step) {
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
            <textarea
              name="bio"
              placeholder="Short Bio"
              value={profileData.bio}
              onChange={handleChange}
              required
            ></textarea>
            <div className="file-upload">
              <label>Profile Picture (Optional)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
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
              <label>Select Your Location</label>
              <div id="map" ref={mapRef} style={{ height: "200px", width: "100%", marginBottom: "15px" }}></div>
              <input
                type="text"
                name="location"
                placeholder="Your Location"
                value={profileData.location}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className="education-container">
              <label>Education</label>
              <input
                type="text"
                name="education"
                placeholder="Your Education Background"
                value={profileData.education}
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
          // <div className="form-step" ref={formRef}>
          //   <h3>Your Interests</h3>
          //   <div className="interests-container">
          //     <label>Select your interests</label>
          //     <div className="interests-grid">
          //       {["Technology", "Art", "Music", "Sports", "Travel", "Food", 
          //         "Photography", "Fashion", "Science", "Literature", "Movies", "Health"].map((interest) => (
          //         <div className="interest-item" key={interest}>
          //           <input
          //             type="checkbox"
          //             id={interest}
          //             value={interest}
          //             onChange={handleInterestChange}
          //             checked={profileData.interests.includes(interest)}
          //           />
          //           <label htmlFor={interest}>{interest}</label>
          //         </div>
          //       ))}
          //     </div>
          //   </div>
          //   {error && <p className="error-text">{error}</p>}
          //   <div className="buttons-container">
          //     <button type="button" className="create-profile-back-btn" onClick={prevStep}>
          //       <i className="fas fa-arrow-left"></i> Back
          //     </button>
          //     <button type="submit" className="create-btn" onClick={handleSubmit}>
          //       Create Profile
          //     </button>
          //   </div>
          // </div>
          <InterestSelection profileData setProfileData prevStep handleSubmit  />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="create-profile-container">
      <div className="bg-text">Welcome</div>
      <div className="left-form">
        <h2>Create Your Profile</h2>
        <div className="progress-indicator">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="indicator-line"></div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="indicator-line"></div>
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
        <form>
          {renderFormStep()}
        </form>
      </div>

      <div className="right-content">
        <div className="welcome-text">
          <h2>Welcome to Our Platform!</h2>
          <p>
            Build a profile that lets you connect with industry experts and access personalized career insights.
          </p>
        </div>

        <div className="cards-container">
          <div className="card">
            <img src={img1} alt="MVP 1" />
            <h3>Personalized Guidance</h3>
            <p>Tailored career advice to match your unique skills and aspirations.</p>
          </div>
          <div className="card">
            <img src={img2} alt="MVP 2" />
            <h3>Industry Insights</h3>
            <p>Keep up with the latest trends and future projections in your industry.</p>
          </div>
          <div className="card">
            <img src={img3} alt="MVP 3" />
            <h3>Networking Opportunities</h3>
            <p>Connect with professionals who can mentor, guide, and inspire you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}