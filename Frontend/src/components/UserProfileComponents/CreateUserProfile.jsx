import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/UserProfile Styles/CreateProfile.css";
import gsap from "gsap";

import img1 from "../../assets/img1.jpg";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.jpg";
import { getUserData, handleCreateUserFileChange, handleStepChange } from "../../utils/helper";
import { handleSubmitCreateProfile } from "../../utils/formHanderls";
import FormStep from "./BasicInfoStep";

export default function CreateProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: "",
    profilePicture: "",
    location: "",
    latitude: null,
    longitude: null,
    education: "",
    interests: [],
    isFirstTime: null,
  });
  const [error, setError] = useState("");
  const BASE_URL = "http://localhost:5000";
  const token = sessionStorage.getItem('authToken');
  const formRef = useRef(null);

  
  useEffect(() => {
    getUserData(BASE_URL,token,setProfileData,profileData)

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


  // Handle final form submission
  const handleSubmit = async (e) => {
    const updatedProfileData = { ...profileData, isFirstTime: false };
    handleSubmitCreateProfile(e, updatedProfileData, setError, BASE_URL, token, formRef, navigate);
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
          <FormStep
            step={step}
            profileData={profileData}
            setProfileData={setProfileData}
            handleFileChange={(e) =>  handleCreateUserFileChange(e,setProfileData,profileData)}
            nextStep={() => handleStepChange(formRef, setStep, step, "next", setError, profileData)}
            prevStep={() => handleStepChange(formRef, setStep, step, "prev")}
            handleSubmit={handleSubmit}
            error={error}
            formRef={formRef}
          />
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