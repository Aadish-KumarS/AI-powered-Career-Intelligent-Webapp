import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import '../../styles/Career analysis styles/SkillGapResult.css';

const SkillGapResult = ({ analysisData }) => {
  // Refs for GSAP animations
  const componentRef = useRef(null);
  const strengthsRef = useRef(null);
  const skillLevelsRef = useRef(null);
  const transferableSkillsRef = useRef(null);
  const skillGapsRef = useRef(null);
  const learningPathRef = useRef(null);
  const insightsRef = useRef(null);
  const careerRef = useRef(null);
  const networkingRef = useRef(null);
  const portfolioRef = useRef(null);

  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    strengths: false,
    skillLevels: false,
    transferableSkills: false,
    skillGaps: {},
    learningPath: {},
    insights: false,
    career: false,
    networking: false,
    portfolio: false
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!analysisData) return;
    
    setIsLoading(false);
    
    // Initialize expanded sections for dynamic roles and learning paths
    const updatedExpandedSections = { ...expandedSections };
    console.log(analysisData);
    console.log();
    console.log();
    console.log();
    console.log(analysisData.result);
    console.log();
    console.log();
    console.log();
    console.log();
    console.log(analysisData.result.skill_assessment);
    console.log();
    console.log();
    console.log();
    console.log();
    console.log(analysisData.result.skill_assessment.skill_gaps);
    console.log();
    console.log();
    console.log();
    console.log();

    
    // Add skill gaps sections for each desired role
    Object.keys(analysisData.result.skill_assessment.skill_gaps).forEach(roleKey => {
      updatedExpandedSections.skillGaps[roleKey] = false;
    });
    
    // Add learning path sections
    Object.keys(analysisData.result.learning_path).forEach(path => {
      updatedExpandedSections.learningPath[path] = false;
    });
    
    setExpandedSections(updatedExpandedSections);
  }, [analysisData]);

  useEffect(() => {
    if (isLoading || !analysisData) return;

    // Main animation for component entrance
    gsap.fromTo(
      componentRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Staggered animations for sections
    const sections = [
      strengthsRef.current,
      skillLevelsRef.current,
      transferableSkillsRef.current,
      skillGapsRef.current,
      learningPathRef.current,
      insightsRef.current,
      careerRef.current,
      networkingRef.current,
      portfolioRef.current
    ];

    gsap.fromTo(
      sections,
      { opacity: 0, x: -30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.5, 
        stagger: 0.1, 
        ease: "power2.out",
        delay: 0.3
      }
    );
  }, [isLoading, analysisData]);

  const toggleSection = (section, subsection = null) => {
    if (subsection) {
      setExpandedSections(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: !prev[section][subsection]
        }
      }));
    } else {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  if (isLoading) {
    return <div className="skill-gap-loading">Loading your skill assessment results...</div>;
  }

  if (!analysisData) {
    return <div className="skill-gap-loading">Unable to display skill assessment. Please try again.</div>;
  }

  const { result } = analysisData;
  const { 
    skill_assessment, 
    missing_skills, 
    learning_path, 
    industry_insights, 
    career_trajectory, 
    networking_recommendations, 
    portfolio_recommendations 
  } = result;

  return (
    <div className="skill-gap-container" ref={componentRef}>
      <h1 className="skill-gap-title">Your Skill Assessment Results</h1>
      
      {/* Current Strengths Section */}
      <div className="skill-gap-section" ref={strengthsRef}>
        <div 
          className="section-header" 
          onClick={() => toggleSection('strengths')}
        >
          <h2>Current Strengths</h2>
          <span className={`expand-icon ${expandedSections.strengths ? 'expanded' : ''}`}>+</span>
        </div>
        
        {expandedSections.strengths && (
          <div className="section-content strengths-content">
            <ul className="skills-list">
              {skill_assessment.current_strengths.map((strength, index) => (
                <li key={index} className="strength-item">
                  <span className="strength-badge">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Current Skill Levels Section */}
      <div className="skill-gap-section" ref={skillLevelsRef}>
        <div 
          className="section-header" 
          onClick={() => toggleSection('skillLevels')}
        >
          <h2>Current Skill Levels</h2>
          <span className={`expand-icon ${expandedSections.skillLevels ? 'expanded' : ''}`}>+</span>
        </div>
        
        {expandedSections.skillLevels && (
          <div className="section-content">
            {Object.entries(skill_assessment.current_skill_levels).map(([skill, description], index) => {
              // Extract level from description (assuming format "(Level) Description")
              const levelMatch = description.match(/^\((.*?)\)/);
              const level = levelMatch ? levelMatch[1] : "Intermediate";
              const cleanDescription = description.replace(/^\(.*?\)\s*/, '');
              
              return (
                <div key={index} className="skill-level-item">
                  <div className="skill-header">
                    <h3>{skill}</h3>
                    <span className={`level-badge ${level.toLowerCase()}`}>{level}</span>
                  </div>
                  <p className="skill-description">{cleanDescription}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transferable Skills Section */}
      <div className="skill-gap-section" ref={transferableSkillsRef}>
        <div 
          className="section-header" 
          onClick={() => toggleSection('transferableSkills')}
        >
          <h2>Transferable Skills</h2>
          <span className={`expand-icon ${expandedSections.transferableSkills ? 'expanded' : ''}`}>+</span>
        </div>
        
        {expandedSections.transferableSkills && (
          <div className="section-content">
            <ul className="transferable-skills-list">
              {skill_assessment.transferable_skills.map((skill, index) => (
                <li key={index} className="transferable-skill-item">{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Skill Gaps Section */}
      <div className="skill-gap-section skill-gaps-container" ref={skillGapsRef}>
        <div className="section-header">
          <h2>Skill Gaps</h2>
        </div>
        
        {/* Render each role's skill gaps */}
        {Object.entries(skill_assessment.skill_gaps).map(([roleKey, roleData], index) => {
          const role = roleKey.replace(/_/g, ' ');
          return (
            <div key={index} className="role-gap-container">
              <div 
                className="role-header" 
                onClick={() => toggleSection('skillGaps', roleKey)}
              >
                <h3>{role}</h3>
                <span className={`priority-badge ${roleData.priority_level.toLowerCase()}`}>
                  Priority: {roleData.priority_level}
                </span>
                <span className={`expand-icon ${expandedSections.skillGaps[roleKey] ? 'expanded' : ''}`}>+</span>
              </div>
              
              {expandedSections.skillGaps[roleKey] && (
                <div className="role-content">
                  <div className="skills-column">
                    <h4>Essential Technical Skills</h4>
                    <ul>
                      {roleData.essential_technical_skills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="skills-column">
                    <h4>Essential Soft Skills</h4>
                    <ul>
                      {roleData.essential_soft_skills.map((skill, idx) => (
                        <li key={idx}>
                          {skill.skill} <span className="importance">(Importance: {skill.importance_rating})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="skills-column">
                    <h4>Recommended Tools</h4>
                    <ul className="tools-list">
                      {roleData.recommended_tools.map((tool, idx) => (
                        <li key={idx} className="tool-item">{tool}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="skills-column">
                    <h4>Nice to Have</h4>
                    <ul>
                      {roleData.nice_to_have.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Learning Path Section */}
      <div className="skill-gap-section" ref={learningPathRef}>
        <div className="section-header">
          <h2>Learning Path</h2>
        </div>
        
        {/* Render each learning path */}
        {Object.entries(learning_path).map(([pathKey, pathData], index) => {
          const pathName = pathKey.replace(/_/g, ' ');
          return (
            <div key={index} className="learning-path-container">
              <div 
                className="path-header" 
                onClick={() => toggleSection('learningPath', pathKey)}
              >
                <h3>{pathName}</h3>
                <span className={`expand-icon ${expandedSections.learningPath[pathKey] ? 'expanded' : ''}`}>+</span>
              </div>
              
              {expandedSections.learningPath[pathKey] && (
                <div className="path-content">
                  <div className="resource-column">
                    <h4>Beginner Resources</h4>
                    <ul>
                      {pathData.beginner_resources.map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="resource-column">
                    <h4>Intermediate Resources</h4>
                    <ul>
                      {pathData.intermediate_resources.map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="resource-column">
                    <h4>Advanced Resources</h4>
                    <ul>
                      {pathData.advanced_resources.map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="resource-column">
                    <h4>Practice Projects</h4>
                    <ul>
                      {pathData.practice_projects.map((project, idx) => (
                        <li key={idx}>{project}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="resource-column">
                    <h4>Certifications</h4>
                    <ul>
                      {pathData.certifications.map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Industry Insights Section */}
      <div className="skill-gap-section" ref={insightsRef}>
        <div 
          className="section-header" 
          onClick={() => toggleSection('insights')}
        >
          <h2>Industry Insights</h2>
          <span className={`expand-icon ${expandedSections.insights ? 'expanded' : ''}`}>+</span>
        </div>
        
        {expandedSections.insights && (
          <div className="section-content">
            <div className="insights-container">
              <div className="insight-column">
                <h3>Market Trends</h3>
                <ul>
                  {industry_insights.market_trends.map((trend, index) => (
                    <li key={index}>{trend}</li>
                  ))}
                </ul>
              </div>
              
              <div className="insight-column">
                <h3>Regional Factors</h3>
                <ul>
                  {industry_insights.regional_factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
              
              <div className="insight-column">
                <h3>Salary Expectations</h3>
                <ul className="salary-list">
                  {industry_insights.salary_expectations.map((salary, index) => (
                    <li key={index} className="salary-item">{salary}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Career Trajectory Section */}
      <div className="skill-gap-section" ref={careerRef}>
        <div 
          className="section-header" 
          onClick={() => toggleSection('career')}
        >
          <h2>Career Trajectory</h2>
          <span className={`expand-icon ${expandedSections.career ? 'expanded' : ''}`}>+</span>
        </div>
        
        {expandedSections.career && (
          <div className="section-content">
            <div className="trajectory-container">
              <div className="goal-column">
                <h3>Short Term Goals</h3>
                <ul className="goal-list">
                  {career_trajectory.short_term_goals.map((goal, index) => (
                    <li key={index} className="short-term">{goal}</li>
                  ))}
                </ul>
              </div>
              
              <div className="goal-column">
                <h3>Medium Term Goals</h3>
                <ul className="goal-list">
                  {career_trajectory.medium_term_goals.map((goal, index) => (
                    <li key={index} className="medium-term">{goal}</li>
                  ))}
                </ul>
              </div>
              
              <div className="goal-column">
                <h3>Long Term Goals</h3>
                <ul className="goal-list">
                  {career_trajectory.long_term_goals.map((goal, index) => (
                    <li key={index} className="long-term">{goal}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="timeline">
              <h3>Estimated Timeline</h3>
              <p>{career_trajectory.estimated_timeline}</p>
            </div>
          </div>
        )}
      </div>

      {/* Networking Recommendations Section */}
      <div className="skill-gap-section" ref={networkingRef}>
        <div 
          className="section-header" 
          onClick={() => toggleSection('networking')}
        >
          <h2>Networking Recommendations</h2>
          <span className={`expand-icon ${expandedSections.networking ? 'expanded' : ''}`}>+</span>
        </div>
        
        {expandedSections.networking && (
          <div className="section-content">
            <ul className="networking-list">
              {networking_recommendations.map((recommendation, index) => (
                <li key={index} className="networking-item">{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Portfolio Recommendations Section */}
      <div className="skill-gap-section" ref={portfolioRef}>
        <div 
          className="section-header" 
          onClick={() => toggleSection('portfolio')}
        >
          <h2>Portfolio Recommendations</h2>
          <span className={`expand-icon ${expandedSections.portfolio ? 'expanded' : ''}`}>+</span>
        </div>
        
        {expandedSections.portfolio && (
          <div className="section-content">
            <ul className="portfolio-list">
              {portfolio_recommendations.map((recommendation, index) => (
                <li key={index} className="portfolio-item">{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapResult;