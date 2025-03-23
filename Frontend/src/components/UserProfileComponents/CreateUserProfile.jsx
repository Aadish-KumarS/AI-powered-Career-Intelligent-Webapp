import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/UserProfile Styles/CreateProfile.css";
import gsap from "gsap";

import img1 from "../../assets/img1.jpg"
import img2 from "../../assets/img2.jpg"
import img3 from "../../assets/img3.jpg"

export default function CreateProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    profilePicture: "",
  });
  const [error, setError] = useState("");
  const BASE_URL = "http://localhost:5000";
  const token = sessionStorage.getItem('authToken');


  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.bio) {
      setError("All fields are required");
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
        navigate("/profile"); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.",err);
    }
  };

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
  
    gsap.fromTo(".create-btn", 
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
  

  return (
    <div className="view-profile-container">
      <div className="bg-text">Welcome</div>
      <div className="left-form">
        <h2>Create Your Profile</h2>
        <form onSubmit={handleSubmit}>
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
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {profileData.profilePicture && (
            <img src={profileData.profilePicture} alt="Profile Preview" className="profile-preview" />
          )}
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="create-btn">Create Profile</button>
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
