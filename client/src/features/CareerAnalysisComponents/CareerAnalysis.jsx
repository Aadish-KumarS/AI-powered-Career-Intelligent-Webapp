import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { careerPathResultMoackData, jobMarketResultMoackData, skillGapResultMoackData } from '../../constants/mockData';
import SkillGapResult from './SkillGapResult';
import JobMarketInsights from './JobMarketInsights';
import CareerPath from './CareerPath';
import '../../styles/Career analysis styles/CareerAnalysis.css';
import Navbar from '../../components/LandingPageComponents/Navbar'

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
  
    // Define the request data based on user profile
    const requestData = transformUserDataToRequest(userProfile);
    //const requestData = {
    //   "current_skills": [
    //     { "name": "Python", "level": "Intermediate" },
    //     { "name": "Machine Learning", "level": "Advanced" },
    //     { "name": "SQL", "level": "Intermediate" },
    //     { "name": "DevOps", "level": "Beginner" },
    //     { "name": "UI/UX Design", "level": "Intermediate" },
    //     { "name": "Communication", "level": "Advanced" }
    //   ],
    //   "education": {
    //     "highest_level": "Bachelor's",
    //     "field_of_study": "Computer Science",
    //     "institution": "Stanford University",
    //     "graduation_year": "2021"
    //   },
    //   "desired_roles": [
    //     "AI Engineer",
    //     "Data Scientist"
    //   ],
    //   "location": {
    //     "city": "San Francisco",
    //     "latitude": 37.7749,
    //     "longitude": -122.4194
    //   },
    //   "career_interests": [
    //     "Artificial Intelligence",
    //     "Machine Learning",
    //     "Data Engineering"
    //   ],
    //   "experience": {
    //     "current_role": "Data Analyst",
    //     "years_of_experience": "3",
    //     "past_roles": [
    //       "Junior Data Analyst",
    //       "Intern - Business Intelligence"
    //     ]
    //   },
    //   "career_info": {
    //     "career_stage": "Early Career",
    //     "career_goals": [
    //       "Lead an AI team",
    //       "Contribute to open-source ML tools"
    //     ],
    //     "desired_industries": [
    //       "Tech",
    //       "Healthcare AI"
    //     ],
    //     "desired_roles": [
    //       "Machine Learning Engineer"
    //     ]
    //   },
    //   "preferences": {
    //     "personality_type": "INTP",
    //     "work_environment": "Remote",
    //     "work_style": [
    //       "Independent",
    //       "Flexible"
    //     ]
    //   }
    // };
  
    try {
      // Create an array of promises for all API calls
      const apiCalls = [
        // API call for Job Market Insights
        fetch('http://localhost:8001/generator/career/job-market-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': `req-${Date.now()}`
          },
          body: JSON.stringify(requestData)
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Job market insights failed: ${response.status}`);
          }
          return response.json();
        })
      ];
  
      // apiCalls.push(
      //   // API call 1: Skill Gap Analysis
      //   fetch('http://localhost:8001/generator/career/analyze-skill-gap', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'X-Request-ID': `req-${Date.now()}`
      //     },
      //     body: JSON.stringify(requestData)
      //   }).then(response => {
      //     if (!response.ok) {
      //       throw new Error(`Skill gap analysis failed: ${response.status}`);
      //     }
      //     return response.json();
      //   })
      // );
      
      apiCalls.push(
        // API call 2: Career Path Suggestions
        fetch('http://localhost:8001/generator/career/suggest-career-path', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': `req-${Date.now()}`
          },
          body: JSON.stringify(requestData)
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Career path suggestion failed: ${response.status}`);
          }
          return response.json();
        })
      );
  
      // Wait for all API calls to complete
      const results = await Promise.all(apiCalls);
      const jobMarketData = results[0];
      // const skillGapData = results[0]; 
      const careerPathData = results[1];
      //  // Uncomment when using all three APIs
  
      // Fix: Check if the result is already an object, or if it's a string that needs parsing
      
      setJobMarketResults(typeof jobMarketData.result === 'string' ? JSON.parse(jobMarketData.result) : jobMarketData);
      // setSkillGapResults(typeof skillGapData.result === 'string' ? JSON.parse(skillGapData.result) : skillGapData);
      setCareerPathResults(typeof careerPathData.result === 'string' ? JSON.parse(careerPathData.result) : careerPathData);
      
      setSkillGapResults(skillGapResultMoackData);
      // setJobMarketResults(jobMarketResultMoackData);
      // setCareerPathResults(careerPathResultMoackData);

      // setAnalysisComplete(true);
      
      
    } catch (err) {
      console.error('Error analyzing career data:', err);
      setError(`Error analyzing career data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const transformUserDataToRequest = (backendData) => {
    const {
      education,
      careerInfo,
      location,
      latitude,
      longitude,
      interests,
      experience,
      skills,
      preferences
    } = backendData;
    console.log(education,
      careerInfo,
      location,
      latitude,
      longitude,
      interests,
      experience,
      skills,
      preferences);
    

    // Helper function to convert skill name + level
    const combineSkills = () => {
      const { technicalSkills = [], softSkills = [] } = skills || {};
      return [...technicalSkills, ...softSkills].map((skill) => ({
        name: skill.name || skill, // fallback in case it's just a string
        level: skill.level || 'Intermediate'
      }));
    };

    const requestData = {
      current_skills: combineSkills(),

      education: {
        highest_level: education?.highestLevel || '',
        field_of_study: education?.fieldOfStudy || '',
        institution: education?.institution || '',
        graduation_year: education?.graduationYear || ''
      },

      desired_roles: careerInfo?.desiredRoles?.length
        ? careerInfo.desiredRoles
        : ['Software Engineer'], // fallback role

      location: {
        city: backendData.location || '',
        latitude: latitude || 0,
        longitude: longitude || 0
      },

      career_interests: interests || [],

      experience: {
        current_role: experience?.currentRole || '',
        years_of_experience: experience?.yearsOfExperience || '0',
        past_roles: experience?.pastRoles || []
      },

      career_info: {
        career_stage: careerInfo?.careerStage || '',
        career_goals: careerInfo?.careerGoals || [],
        desired_industries: careerInfo?.desiredIndustries || [],
        desired_roles: careerInfo?.desiredRoles || []
      },

      preferences: {
        personality_type: preferences?.personalityType || '',
        work_environment: preferences?.workEnvironment || '',
        work_style: preferences?.workStyle || []
      }
    };

    return requestData;
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
        return skillGapResults && <SkillGapResult analysisData={skillGapResults}  userData={userProfile}/>;
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
      <Navbar />
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