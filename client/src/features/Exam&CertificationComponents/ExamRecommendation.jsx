import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import "../../styles/Exam styles/ExamRecommendation.css";

const ExamRecommendation = () => {
  // State management
  const [recommendations, setRecommendations] = useState([]);
  const [customData, setCustomData] = useState({
    exam_name: "",
    why_recommended: "",
    ideal_timeline: "",
  });
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [activeSection, setActiveSection] = useState("ai");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for GSAP animations
  const aiSectionRef = useRef(null);
  const customSectionRef = useRef(null);
  const savedSectionRef = useRef(null);
  const cardsRef = useRef([]);

  // Load saved recommendations from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedExamRecommendations")) || [];
    setSavedRecommendations(saved);
  }, []);

  // Fetch backend recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // const res = await fetch("http://localhost:8000/api/v1/exams/recommend-exams", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     education: {
        //       highestLevel: "Bachelor's",
        //       fieldOfStudy: "Computer Science",
        //       institution: "Example University",
        //       graduationYear: 2024,
        //     },
        //     skills: {
        //       technicalSkills: [{ name: "Python" }, { name: "JavaScript" }],
        //       softSkills: [{ name: "Problem Solving" }],
        //     },
        //     careerInfo: {
        //       careerGoals: ["Backend Developer"],
        //       desiredIndustries: ["Tech", "Software"],
        //     },
        //     experience: {
        //       currentRole: "Student",
        //       yearsOfExperience: 0,
        //     },
        //     preferences: {
        //       personalityType: "INTJ",
        //     },
        //   }),
        // });

        // const data = await res.json();
        // if (data.recommendations) {
        //   setRecommendations(data.recommendations);
        // }
        setRecommendations([
          {
              "exam_name": "Joint Entrance Examination (JEE Main)",
              "why_recommended": "This exam is essential for admission to top engineering colleges in India and will be beneficial for pursuing a B.Tech in a field aligned with technology.",
              "ideal_timeline": "2024"
          },
          {
              "exam_name": "SAT Subject Test - Mathematics Level 2",
              "why_recommended": "Demonstrating strong mathematical skills is important for a career in engineering and technology.",
              "ideal_timeline": "2023"
          },
          {
              "exam_name": "Microsoft Technology Associate (MTA) Certification",
              "why_recommended": "Validates basic programming skills, which are crucial for a career in technology.",
              "ideal_timeline": "2023"
          },
          {
              "exam_name": "National Talent Search Examination (NTSE)",
              "why_recommended": "A prestigious scholarship exam that can showcase analytical thinking and problem-solving abilities.",
              "ideal_timeline": "2022"
          }
      ]);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
        setError("Failed to load recommendations. Please try again later.");
        setIsLoading(false);
        
      }
    };

    fetchRecommendations();
  }, []);

  // GSAP animations
  useEffect(() => {
    // Animate section transitions
    const animateSection = (section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    };

    if (activeSection === "ai" && aiSectionRef.current) {
      animateSection(aiSectionRef.current);
    } else if (activeSection === "custom" && customSectionRef.current) {
      animateSection(customSectionRef.current);
    } else if (activeSection === "saved" && savedSectionRef.current) {
      animateSection(savedSectionRef.current);
    }
  }, [activeSection]);

  // Animate cards when recommendations load
  useEffect(() => {
    if (recommendations.length > 0 && !isLoading) {
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.4, 
              delay: index * 0.1, 
              ease: "power1.out" 
            }
          );
        }
      });
    }
  }, [recommendations, isLoading, activeSection]);

  // Handle save to localStorage
  const handleSave = (recommendation) => {
    // Check if recommendation already exists
    const exists = savedRecommendations.some(
      (rec) => rec.exam_name === recommendation.exam_name
    );
    
    if (!exists) {
      const current = [...savedRecommendations];
      const updated = [...current, recommendation];
      localStorage.setItem("savedExamRecommendations", JSON.stringify(updated));
      setSavedRecommendations(updated);
      
      // Animate the saved notification
      const savedNotification = document.createElement("div");
      savedNotification.className = "saved-notification";
      savedNotification.textContent = "Recommendation saved!";
      document.body.appendChild(savedNotification);
      
      gsap.fromTo(
        savedNotification,
        { opacity: 0, y: -20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3,
          onComplete: () => {
            gsap.to(savedNotification, {
              opacity: 0,
              y: -20,
              delay: 1.5,
              duration: 0.3,
              onComplete: () => {
                savedNotification.remove();
              }
            });
          }
        }
      );
    } else {
      // Notify already saved
      const existsNotification = document.createElement("div");
      existsNotification.className = "exists-notification";
      existsNotification.textContent = "Already in your saved list";
      document.body.appendChild(existsNotification);
      
      gsap.fromTo(
        existsNotification,
        { opacity: 0, y: -20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3,
          onComplete: () => {
            gsap.to(existsNotification, {
              opacity: 0,
              y: -20,
              delay: 1.5,
              duration: 0.3,
              onComplete: () => {
                existsNotification.remove();
              }
            });
          }
        }
      );
    }
  };

  // Handle removing a saved recommendation
  const handleRemove = (index) => {
    const updated = [...savedRecommendations];
    updated.splice(index, 1);
    localStorage.setItem("savedExamRecommendations", JSON.stringify(updated));
    setSavedRecommendations(updated);
  };

  // Handle custom form input
  const handleInputChange = (e) => {
    setCustomData({
      ...customData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle custom form submit
  const handleAddCustomRecommendation = (e) => {
    e.preventDefault();
    if (
      customData.exam_name &&
      customData.why_recommended &&
      customData.ideal_timeline
    ) {
      const newRecommendation = { ...customData };
      
      // Add to recommendations
      setRecommendations(prev => [...prev, newRecommendation]);
      
      // Also save it directly
      const updated = [...savedRecommendations, newRecommendation];
      localStorage.setItem("savedExamRecommendations", JSON.stringify(updated));
      setSavedRecommendations(updated);
      
      // Reset form
      setCustomData({
        exam_name: "",
        why_recommended: "",
        ideal_timeline: "",
      });
      
      // Show success message
      const successMsg = document.createElement("div");
      successMsg.className = "success-notification";
      successMsg.textContent = "Custom recommendation added";
      document.body.appendChild(successMsg);
      
      gsap.fromTo(
        successMsg,
        { opacity: 0, y: -20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3,
          onComplete: () => {
            gsap.to(successMsg, {
              opacity: 0,
              y: -20,
              delay: 1.5,
              duration: 0.3,
              onComplete: () => {
                successMsg.remove();
              }
            });
          }
        }
      );
    }
  };

  return (
    <div className="exam-recommendation-container">
      <h1 className="main-title">Career Exam Pathway</h1>
      
      {/* Nav tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeSection === "ai" ? "active" : ""}`}
          onClick={() => setActiveSection("ai")}
        >
          AI Recommendations
        </button>
        <button 
          className={`nav-tab ${activeSection === "custom" ? "active" : ""}`}
          onClick={() => setActiveSection("custom")}
        >
          Add Custom
        </button>
        <button 
          className={`nav-tab ${activeSection === "saved" ? "active" : ""}`}
          onClick={() => setActiveSection("saved")}
        >
          Saved ({savedRecommendations.length})
        </button>
      </div>

      {/* Section 1: AI-Generated Recommendations */}
      <div 
        ref={aiSectionRef}
        className={`section ${activeSection === "ai" ? "active" : "hidden"}`}
      >
        <div className="section-header">
          <h2>AI-Generated Recommendations</h2>
          <p className="section-description">
            Based on your profile and career goals, these certifications may advance your career path.
          </p>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Analyzing your profile...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : recommendations.length === 0 ? (
          <p className="no-data">No recommendations available.</p>
        ) : (
          <div className="cards-grid">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className="recommendation-card"
                ref={el => cardsRef.current[index] = el}
              >
                <div className="card-content">
                  <h3>{rec.exam_name}</h3>
                  <div className="card-details">
                    <p className="card-description">{rec.why_recommended}</p>
                    <div className="card-timeline">
                      <span className="timeline-icon"></span>
                      <span className="timeline-text">{rec.ideal_timeline}</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => handleSave(rec)}
                    className="save-button"
                  >
                    <span className="button-icon">+</span>
                    <span className="button-text">Save</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Custom Form */}
      <div 
        ref={customSectionRef}
        className={`section ${activeSection === "custom" ? "active" : "hidden"}`}
      >
        <div className="section-header">
          <h2>Add Custom Recommendation</h2>
          <p className="section-description">
            Create your own exam recommendation based on personal research or mentor advice.
          </p>
        </div>
        
        <form
          onSubmit={handleAddCustomRecommendation}
          className="custom-form"
        >
          <div className="form-group">
            <label htmlFor="exam_name">Exam/Certification Name</label>
            <input
              type="text"
              id="exam_name"
              name="exam_name"
              value={customData.exam_name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="why_recommended">Why It's Valuable</label>
            <textarea
              id="why_recommended"
              name="why_recommended"
              value={customData.why_recommended}
              onChange={handleInputChange}
              className="form-input form-textarea"
              placeholder="Describe why this certification would be valuable for your career..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ideal_timeline">Ideal Timeline</label>
            <input
              type="text"
              id="ideal_timeline"
              name="ideal_timeline"
              value={customData.ideal_timeline}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Within 6 months, After 2 years of experience..."
              required
            />
          </div>
          
          <button
            type="submit"
            className="submit-button"
          >
            Add Recommendation
          </button>
        </form>
      </div>

      {/* Section 3: Saved Recommendations */}
      <div 
        ref={savedSectionRef}
        className={`section ${activeSection === "saved" ? "active" : "hidden"}`}
      >
        <div className="section-header">
          <h2>Saved Recommendations</h2>
          <p className="section-description">
            Track your certification goals and progress over time.
          </p>
        </div>
        
        {savedRecommendations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <p>No saved recommendations yet</p>
            <button 
              className="empty-action-button"
              onClick={() => setActiveSection("ai")}
            >
              Browse AI Recommendations
            </button>
          </div>
        ) : (
          <div className="saved-grid">
            {savedRecommendations.map((rec, index) => (
              <div 
                key={index} 
                className="saved-card"
              >
                <div className="card-content">
                  <h3>{rec.exam_name}</h3>
                  <div className="card-details">
                    <p className="card-description">{rec.why_recommended}</p>
                    <div className="card-timeline">
                      <span className="timeline-icon"></span>
                      <span className="timeline-text">{rec.ideal_timeline}</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => handleRemove(index)}
                    className="delete-button"
                  >
                    <span className="delete-icon">×</span>
                    <span className="button-text">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamRecommendation;