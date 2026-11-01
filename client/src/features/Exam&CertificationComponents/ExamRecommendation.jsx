import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import '../../styles/Global Styles/service-theme.css';
import "../../styles/Exam styles/ExamRecommendation.css";
import Navbar from "../../components/LandingPageComponents/Navbar";
import { API_BASE_URL, CAREER_API_BASE_URL } from '../../config/api';
import { examRecommendationMockData } from '../../constants/mockData';
import { fetchWithAiTimeout, USE_LIVE_AI } from '../../config/aiRuntime';
import { getSessionAiResult, getSessionProfile, setSessionAiResult, setSessionProfile } from '../../utils/profileSession';

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

  const persistRecommendations = async (result) => {
    setSessionAiResult('examRecommendations', result);
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetchWithAiTimeout(`${API_BASE_URL}/api/users/ai-results/examRecommendations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ result }),
      });
      if (!response.ok) throw new Error(`Unable to save recommendations: ${response.status}`);
    } catch (saveError) {
      console.warn('Unable to save exam recommendations.', saveError);
    }
  };

  // Hydrate the last generated result without asking the LLM for another
  // response. Generation is opt-in through generateRecommendations.
  useEffect(() => {
    let cancelled = false;
    const loadSavedRecommendations = async () => {
      setIsLoading(true);
      const token = sessionStorage.getItem('authToken');
      const cachedRecommendations = getSessionAiResult('examRecommendations');
      if (Array.isArray(cachedRecommendations)) {
        if (!cancelled) {
          setRecommendations(cachedRecommendations);
          setIsLoading(false);
        }
        return;
      }
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const response = await fetchWithAiTimeout(`${API_BASE_URL}/api/users/ai-results/examRecommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const payload = await response.json();
        if (!cancelled && Array.isArray(payload?.result)) {
          setRecommendations(payload.result);
          setSessionAiResult('examRecommendations', payload.result);
        }
      } catch (loadError) {
        console.warn('Unable to load saved exam recommendations.', loadError);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadSavedRecommendations();
    return () => { cancelled = true; };
  }, []);

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!USE_LIVE_AI) {
        setRecommendations(examRecommendationMockData);
        await persistRecommendations(examRecommendationMockData);
        return;
      }

      const token = sessionStorage.getItem('authToken');
      if (!token) throw new Error('Sign in to generate exam recommendations.');
      let profile = getSessionProfile();
      if (!profile) {
        const profileResponse = await fetchWithAiTimeout(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileResponse.ok) throw new Error('Unable to load profile');
        profile = await profileResponse.json();
        setSessionProfile(profile);
      }
      const res = await fetchWithAiTimeout(`${CAREER_API_BASE_URL}/api/v1/recommend-exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          education: {
            highestLevel: profile.education?.highestLevel || null,
            fieldOfStudy: profile.education?.fieldOfStudy || null,
            institution: profile.education?.institution || null,
            graduationYear: profile.education?.graduationYear || null,
          },
          skills: {
            technicalSkills: profile.skills?.technicalSkills || [],
            softSkills: profile.skills?.softSkills || [],
          },
          careerInfo: {
            careerGoals: profile.careerInfo?.careerGoals || [],
            desiredIndustries: profile.careerInfo?.desiredIndustries || [],
          },
          experience: {
            currentRole: profile.experience?.currentRole || null,
            yearsOfExperience: Number(profile.experience?.yearsOfExperience) || 0,
          },
          preferences: { personalityType: profile.preferences?.personalityType || null },
        }),
      });
      if (!res.ok) throw new Error(`Exam recommendation request failed: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.recommendations) || !data.recommendations.length) {
        throw new Error(data.error || 'The service returned no recommendations');
      }

      setRecommendations(data.recommendations);
      await persistRecommendations(data.recommendations);
    } catch (generationError) {
      console.error("Failed to generate recommendations", generationError);
      // A failure must still leave a complete, useful response visible and
      // persist it for the next visit, just like a live response.
      setRecommendations(examRecommendationMockData);
      await persistRecommendations(examRecommendationMockData);
    } finally {
      setIsLoading(false);
    }
  };

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
      <Navbar variant="app" />
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
          <button
            type="button"
            className="generate-ai-button"
            onClick={generateRecommendations}
            disabled={isLoading}
          >
            {isLoading ? 'Preparing recommendations…' : recommendations.length ? 'Regenerate recommendations' : 'Generate recommendations'}
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Analyzing your profile...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : recommendations.length === 0 ? (
          <div className="no-data">
            <p>Your saved certification guidance will appear here.</p>
            <button type="button" className="generate-ai-button" onClick={generateRecommendations}>
              Generate recommendations
            </button>
          </div>
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
