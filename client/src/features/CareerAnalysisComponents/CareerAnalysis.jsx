import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  skillGapResultMoackData,
  careerPathResultMoackData,
  jobMarketResultMoackData
} from '../../constants/mockData';
import { careerProfileMockData } from '../../constants/mockData';
import SkillGapResult from './SkillGapResult';
import JobMarketInsights from './JobMarketInsights';
import CareerPath from './CareerPath';
import '../../styles/Global Styles/service-theme.css';
import '../../styles/Career analysis styles/CareerAnalysis.css';
import { FiActivity, FiArrowUpRight, FiBarChart2, FiCompass, FiMap } from 'react-icons/fi';
import analysisIllustration from '../../assets/svg/ai.svg';
import Navbar from '../../components/LandingPageComponents/Navbar'
import { API_BASE_URL, CAREER_API_BASE_URL } from '../../config/api';

const CareerAnalysis = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [skillGapResults, setSkillGapResults] = useState(null);
  const [careerPathResults, setCareerPathResults] = useState(null);
  const [jobMarketResults, setJobMarketResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabErrors, setTabErrors] = useState({});
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
          `${API_BASE_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        setUserProfile(response.data);
      } catch (err) {
        console.error('Error fetching the data', err);
        setUserProfile(careerProfileMockData);
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
  setTabErrors({});
  setSkillGapResults(null);
  setCareerPathResults(null);
  setJobMarketResults(null);

  const requestData = transformUserDataToRequest(userProfile);

  try {
    const requestOptions = {
      headers: { 'X-Request-ID': `req-${Date.now()}` }
    };

    const endpoints = [
      ['skillGap', '/generator/career/analyze-skill-gap'],
      ['careerPath', '/generator/career/suggest-career-path'],
      ['jobMarket', '/generator/career/job-market-insights']
    ];

    // Run one analysis at a time. The three analyses share the same LLM
    // provider and parallel requests can exhaust a provider's rate limit.
    const settled = [];
    for (const [, path] of endpoints) {
      try {
        const value = await axios.post(
          `${CAREER_API_BASE_URL}${path}`,
          requestData,
          requestOptions
        );
        settled.push({ status: 'fulfilled', value });
      } catch (reason) {
        settled.push({ status: 'rejected', reason });
      }
    }

    const nextErrors = {};
    const fallbacks = {
      skillGap: skillGapResultMoackData,
      careerPath: careerPathResultMoackData,
      jobMarket: jobMarketResultMoackData
    };

    const normalizeResponse = (response) => ({
      ...response.data,
      result: typeof response.data?.result === 'string'
        ? JSON.parse(response.data.result)
        : response.data?.result
    });

    settled.forEach((outcome, index) => {
      const [key] = endpoints[index];

      if (outcome.status === 'rejected') {
        nextErrors[key] = 'Live analysis is temporarily unavailable. Showing a sample result.';
        if (key === 'skillGap') setSkillGapResults(fallbacks[key]);
        if (key === 'careerPath') setCareerPathResults(fallbacks[key]);
        if (key === 'jobMarket') setJobMarketResults(fallbacks[key]);
        return;
      }

      try {
        const data = normalizeResponse(outcome.value);

        if (!data.result) {
          nextErrors[key] = 'The analysis response was empty. Showing a sample result.';
          if (key === 'skillGap') setSkillGapResults(fallbacks[key]);
          if (key === 'careerPath') setCareerPathResults(fallbacks[key]);
          if (key === 'jobMarket') setJobMarketResults(fallbacks[key]);
          return;
        }

        if (key === 'skillGap') setSkillGapResults(data);
        if (key === 'careerPath') setCareerPathResults(data);
        if (key === 'jobMarket') setJobMarketResults(data);
      } catch {
        nextErrors[key] = 'The analysis response could not be read. Showing a sample result.';
        if (key === 'skillGap') setSkillGapResults(fallbacks[key]);
        if (key === 'careerPath') setCareerPathResults(fallbacks[key]);
        if (key === 'jobMarket') setJobMarketResults(fallbacks[key]);
      }
    });

    setTabErrors(nextErrors);

    if (Object.keys(nextErrors).length === endpoints.length) {
      setError('Career analysis could not be generated. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const transformUserDataToRequest = (backendData) => {
    const {
      education,
      careerInfo,
      latitude,
      longitude,
      interests,
      experience,
      skills,
      preferences
    } = backendData;
    // Helper function to convert skill name + level
    const combineSkills = () => {
      const { selectedSkills = [], technicalSkills = [], softSkills = [] } = skills || {};
      const uniqueSkills = new Map();
      [...selectedSkills, ...technicalSkills, ...softSkills].forEach((skill) => {
        const name = typeof skill === 'string' ? skill : skill?.name;
        if (name?.trim()) {
          uniqueSkills.set(name.trim().toLowerCase(), {
            name: name.trim(),
            level: typeof skill === 'object' && skill.level ? skill.level : 'Intermediate'
          });
        }
      });
      return [...uniqueSkills.values()];
    };

    const requestData = {
      current_skills: combineSkills(),

      education: {
        highest_level: education?.highestLevel || '',
        field_of_study: education?.fieldOfStudy || '',
        institution: education?.institution || '',
        graduation_year: education?.graduationYear || ''
      },

      desired_roles: careerInfo?.desiredRoles || [],

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
            src={analysisIllustration}
            alt="Career Analysis" 
            className="empty-state-image" 
          />
          <h3>Your Career Analysis</h3>
          <p>Get personalized insights about your skills, potential career paths, and current job market trends.</p>
        </div>
      );
    }

    const withServiceNotice = (notice, content) => (
      <>
        {notice && <p className="career-service-notice" role="status">{notice}</p>}
        {content}
      </>
    );

    switch(activeTab) {
      case 'skillGap':
        return withServiceNotice(
          tabErrors.skillGap,
          skillGapResults && <SkillGapResult analysisData={skillGapResults} userData={userProfile}/>
        );
      case 'careerPath':
        return withServiceNotice(
          tabErrors.careerPath,
          careerPathResults && <CareerPath careerPathResults={careerPathResults} />
        );
      case 'jobMarket':
        return withServiceNotice(
          tabErrors.jobMarket,
          jobMarketResults && <JobMarketInsights jobMarketInsights={jobMarketResults} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="career-analysis-container">
      <Navbar variant="app" />
      <main className="analysis-workspace">
        <section className="career-analysis-header">
          <div className="analysis-intro">
            <p className="workspace-eyebrow">AI career analysis</p>
            <h1>See the moves that will matter next.</h1>
            <p>Bring your skills, ambitions, and the market into one clear picture—then turn insight into a considered next step.</p>
            <button
              className={`analyze-btn ${loading ? 'loading' : ''}`}
              onClick={analyzeCareer}
              disabled={loading || !userProfile}
            >
              <FiActivity aria-hidden="true" />
              {loading ? 'Reading your profile…' : 'Analyze my career'}
              {!loading && <FiArrowUpRight aria-hidden="true" />}
            </button>
          </div>
          <aside className="analysis-promise" aria-label="What the analysis includes">
            <span className="analysis-promise-number">03</span>
            <div>
              <strong>One profile. Three useful lenses.</strong>
              <ul>
                <li><FiCompass aria-hidden="true" /> Skill gap</li>
                <li><FiMap aria-hidden="true" /> Career direction</li>
                <li><FiBarChart2 aria-hidden="true" /> Market signal</li>
              </ul>
            </div>
          </aside>
        </section>

        {error && <div className="error-message" role="alert">{error}</div>}

        {(skillGapResults || careerPathResults || jobMarketResults) ? (
          <section className="career-analysis-content">
            <div className="analysis-results-heading">
              <p className="workspace-eyebrow">Your report</p>
              <h2>Explore the evidence.</h2>
            </div>
            <div className="career-analysis-tabs" role="tablist" aria-label="Career analysis results">
            <button 
              className={`tab-button ${activeTab === 'skillGap' ? 'active' : ''}`}
              onClick={() => setActiveTab('skillGap')}
              role="tab"
              aria-selected={activeTab === 'skillGap'}
            >
              <FiCompass className="tab-icon" aria-hidden="true" />
              Skill Gap
            </button>
            <button 
              className={`tab-button ${activeTab === 'careerPath' ? 'active' : ''}`}
              onClick={() => setActiveTab('careerPath')}
              role="tab"
              aria-selected={activeTab === 'careerPath'}
            >
              <FiMap className="tab-icon" aria-hidden="true" />
              Career Path
            </button>
            <button 
              className={`tab-button ${activeTab === 'jobMarket' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobMarket')}
              role="tab"
              aria-selected={activeTab === 'jobMarket'}
            >
              <FiBarChart2 className="tab-icon" aria-hidden="true" />
              Job Market
            </button>
            </div>
          
            <div className="career-analysis-panel">
              {renderTabContent()}
            </div>
          </section>
        ) : (
          <section className="career-analysis-content analysis-content--empty">
            {renderTabContent()}
          </section>
        )}
      </main>
    </div>
  );
};

export default CareerAnalysis;
