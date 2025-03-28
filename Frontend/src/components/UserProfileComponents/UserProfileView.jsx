import { useState, useEffect } from "react";
import "../../styles/UserProfile Styles/UserProfile.css"
import { useNavigate } from 'react-router-dom';
import Navbar from '../LandingPageComponents/Navbar'
import { getUserDetail } from "../../utils/helper";
import gsap from "gsap";
import bgGif from '../../assets/gif/bg-gif.gif'

export default function Profile() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");
  const BASE_URL = "http://localhost:5000";
  const token = sessionStorage.getItem('authToken');
  const navigate = useNavigate();

  
  // const userData = {
  //   name: "John Doe",
  //   title: "Software Engineer | AI Enthusiast",
  //   bio: "Passionate software engineer with 5+ years of experience in building web applications and AI solutions. Currently focused on machine learning applications and career advancement technologies.",
  //   location: "San Francisco, CA",
  //   education: "MS Computer Science, Stanford",
  //   email: "john.doe@example.com",
  //   profileImage: "/path/to/profile-pic.jpg",
  //   skills: ["Python", "React", "Machine Learning"]
  // };
  

  const [userData, setUserData] = useState({
    name: "",
    title: "",
    location: "",
    education: "",
    email: "",
    profileImage: "",
    skills: []
  });
  

  const features = [
    {
      text: "AI-powered career roadmap generation",
      icon: "trending-icon"
    },
    {
      text: "Find nearest exam centers",
      icon: "location-icon"
    },
    {
      text: "Track exam notices & dates",
      icon: "notification-icon"
    },
    {
      text: "Personalized career suggestions",
      icon: "user-icon"
    },
    {
      text: "Industry insights & trends",
      icon: "insights-icon"
    },
  ];

  // Progress tracking data
  const progressData = [
    { course: "Advanced AI Techniques", progress: 75 },
    { course: "Machine Learning Fundamentals", progress: 90 },
    { course: "Data Structures & Algorithms", progress: 60 },
  ];

  // Upcoming events
  const upcomingEvents = [
    { title: "Technical Interview", date: "March 25, 2025", type: "interview" },
    { title: "AWS Certification Exam", date: "April 2, 2025", type: "exam" },
    { title: "AI Conference", date: "April 15, 2025", type: "conference" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    //get data
    getUserDetail(token,navigate,BASE_URL,setUserData);

    //Animation
    gsap.fromTo(
      ".profile-header",
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );

    gsap.fromTo(
      ".tab-button",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out" }
    );

    gsap.fromTo(
      ".content-card",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, stagger: 0.3, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="view-profile-container">
      <Navbar />
      <div className="profile-header">
        <div className="profile-setting">
          <div className="profile-image-container">
            {
              userData.profileImage != '' ?
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="profile-image" 
                />
              : <div className="profile-image center"> <p className="user-initial">{userData.name.charAt(0)}</p>  </div>
            }
            </div>
        </div>

        <div className="profile-header-content">
          <div className="profile-info">
            <h1 className="profile-name">Welcome! <br /> {userData.name}</h1>
            <p className="profile-title">{userData.title}</p>
            <div className="skill-tags">
              {userData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
            <div className="profile-actions">
              <button className="primary-button edit-btn">Edit Profile</button>
            </div>
          </div>
        </div>

        <div className="bg-gif">
          <img src={bgGif} alt="" />
        </div>
      </div>

      <div className="main-content">
        <div className="navigation-tabs center">
          <div className="tabs-container">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`tab-button ${activeTab === "profile" ? "active-tab" : ""}`}
            >
              <span className="tab-icon user-icon"></span> Profile
            </button>
            <button 
              onClick={() => setActiveTab("progress")}
              className={`tab-button ${activeTab === "progress" ? "active-tab" : ""}`}
            >
              <span className="tab-icon progress-icon"></span> Progress
            </button>
            <button 
              onClick={() => setActiveTab("calendar")}
              className={`tab-button ${activeTab === "calendar" ? "active-tab" : ""}`}
            >
              <span className="tab-icon calendar-icon"></span> Calendar
            </button>
          </div>
        </div>
        
        <div className="main-column">
          {activeTab === "profile" && (
            <div className="content-card">
              <h2 className="section-title">Personal Info</h2>
              <div className="profile-details">
                <div className="detail-item">
                  <h3 className="detail-label">Location</h3>
                  <p className="detail-value">{userData.location}</p>
                </div>
                <div className="detail-item">
                  <h3 className="detail-label">Education</h3>
                  <p className="detail-value">{userData.education}</p>
                </div>
                <div className="detail-item">
                  <h3 className="detail-label">Email</h3>
                  <p className="detail-value">{userData.email}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "progress" && (
            <div className="content-card">
              <h2 className="section-title">Learning Progress</h2>
              <div className="progress-list">
                {progressData.map((item, index) => (
                  <div key={index} className="progress-item">
                    <div className="progress-header">
                      <span className="progress-title">{item.course}</span>
                      <span className="progress-percentage">{item.progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="content-card">
              <h2 className="section-title">Upcoming Events</h2>
              <div className="events-list">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className={`event-item event-${event.type}`}>
                    <div className="event-content">
                      <div>
                        <h3 className="event-title">{event.title}</h3>
                        <p className="event-date">{event.date}</p>
                      </div>
                      <span className={`event-type-badge ${event.type}-badge`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-column">
          <div className="content-card">
            <h2 className="section-title">Features</h2>
            <div className="feature-card fade-in-out">
              <div className="feature-content">
                <span className={`feature-icon ${features[currentFeature].icon}`}></span>
                <p className="feature-text">{features[currentFeature].text}</p>
              </div>
              <div className="feature-indicators">
                {features.map((_, index) => (
                  <div 
                    key={index} 
                    className={`feature-indicator ${index === currentFeature ? 'active-indicator' : ''}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}