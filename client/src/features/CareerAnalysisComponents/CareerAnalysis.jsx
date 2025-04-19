import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { careerPathResultMoackData, jobMarketResultMoackData, skillGapResultMoackData } from '../../constants/mockData';
import SkillGapResult from './SkillGapResult';
import JobMarketInsights from './JobMarketInsights';
import CareerPath from './CareerPath';
import '../../styles/Career analysis styles/CareerAnalysis.css';

const CareerAnalysis = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [skillGapResults, setSkillGapResults] = useState(null);
  const [careerPathResults, setCareerPathResults] = useState(null);
  const [jobMarketResults, setJobMarketResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('skillGap');

  // Fetch the user's profile (already stored in the backend)
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token is missing.');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          'http://localhost:5000/api/users/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserProfile(response.data);
      } catch (err) {
        console.error('Error fetching the data', err);
        setError('Failed to fetch user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle the career analysis process
  const analyzeCareer = async () => {
    if (!userProfile) return;
  
    setLoading(true);
    setError(null);
    try {
      const requestData = {
        "current_skills": [
          { "name": "Python", "level": "Intermediate" },
          { "name": "Machine Learning", "level": "Advanced" },
          { "name": "SQL", "level": "Intermediate" },
          { "name": "DevOps", "level": "Beginner" },
          { "name": "UI/UX Design", "level": "Intermediate" },
          { "name": "Communication", "level": "Advanced" }
        ],
        "education": {
          "highest_level": "Bachelor's",
          "field_of_study": "Computer Science",
          "institution": "Stanford University",
          "graduation_year": "2021"
        },
        "desired_roles": [
          "AI Engineer",
          "Data Scientist"
        ],
        "location": {
          "city": "San Francisco",
          "latitude": 37.7749,
          "longitude": -122.4194
        },
        "career_interests": [
          "Artificial Intelligence",
          "Machine Learning",
          "Data Engineering"
        ],
        "experience": {
          "current_role": "Data Analyst",
          "years_of_experience": "3",
          "past_roles": [
            "Junior Data Analyst",
            "Intern - Business Intelligence"
          ]
        },
        "career_info": {
          "career_stage": "Early Career",
          "career_goals": [
            "Lead an AI team",
            "Contribute to open-source ML tools"
          ],
          "desired_industries": [
            "Tech",
            "Healthcare AI"
          ],
          "desired_roles": [
            "Machine Learning Engineer"
          ]
        },
        "preferences": {
          "personality_type": "INTP",
          "work_environment": "Remote",
          "work_style": [
            "Independent",
            "Flexible"
          ]
        }
      }
      
      // Store the results from all the API calls
      setSkillGapResults(skillGapResultMoackData);
      setCareerPathResults(careerPathResultMoackData);
      setJobMarketResults(jobMarketResultMoackData);
  
    } catch (err) {
      console.error('Error analyzing career data', err);
      setError('Error analyzing career data');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="career-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing your career data...</p>
        </div>
      );
    }

    if (!skillGapResults && !careerPathResults && !jobMarketResults) {
      return (
        <div className="career-empty-state">
          <img 
            src="/assets/career-analysis.svg" 
            alt="Career Analysis" 
            className="empty-state-image" 
          />
          <h3>Your Career Analysis</h3>
          <p>Get personalized insights about your skills, potential career paths, and current job market trends.</p>
        </div>
      );
    }

    switch(activeTab) {
      case 'skillGap':
        return skillGapResults && <SkillGapResult analysisData={skillGapResults} />;
      case 'careerPath':
        return careerPathResults && <CareerPath careerPathResults={careerPathResults} />;
      case 'jobMarket':
        return jobMarketResults && <JobMarketInsights jobMarketInsights={jobMarketResults} />;
      default:
        return null;
    }
  };

  return (
    <div className="career-analysis-container">
      <div className="career-analysis-header">
        <h1>Career Insights</h1>
        <p>Discover opportunities to grow your career based on your profile, skills, and the job market</p>
        
        <button 
          className={`analyze-btn ${loading ? 'loading' : ''}`} 
          onClick={analyzeCareer} 
          disabled={loading || !userProfile}
        >
          {loading ? 'Analyzing...' : 'Analyze My Career'}
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {(skillGapResults || careerPathResults || jobMarketResults) && (
        <div className="career-analysis-content">
          <div className="career-analysis-tabs">
            <button 
              className={`tab-button ${activeTab === 'skillGap' ? 'active' : ''}`}
              onClick={() => setActiveTab('skillGap')}
            >
              <span className="tab-icon">⚡</span>
              Skill Gap
            </button>
            <button 
              className={`tab-button ${activeTab === 'careerPath' ? 'active' : ''}`}
              onClick={() => setActiveTab('careerPath')}
            >
              <span className="tab-icon">🛤️</span>
              Career Path
            </button>
            <button 
              className={`tab-button ${activeTab === 'jobMarket' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobMarket')}
            >
              <span className="tab-icon">📊</span>
              Job Market
            </button>
          </div>
          
          <div className="career-analysis-panel">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerAnalysis;