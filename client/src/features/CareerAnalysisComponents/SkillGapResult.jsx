import React, { useEffect, useRef, useState } from 'react';

const SkillGapResult = ({ analysisData }) => {
  // Refs for animations
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
    skillGaps: false,
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
    
    // Initialize expanded sections for learning paths
    const updatedExpandedSections = { ...expandedSections };
    
    if (analysisData.learning_path) {
      Object.keys(analysisData.learning_path).forEach(path => {
        updatedExpandedSections.learningPath[path] = false;
      });
    }
    
    setExpandedSections(updatedExpandedSections);
  }, [analysisData]);

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
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your skill assessment results...</div>;
  }

  if (!analysisData) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Unable to display skill assessment. Please try again.</div>;
  }

  const { 
    skill_assessment, 
    missing_skills, 
    learning_path, 
    industry_insights, 
    career_trajectory, 
    networking_recommendations, 
    portfolio_recommendations 
  } = analysisData;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }} ref={componentRef}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Your Skill Assessment Results</h1>
      
      {/* Current Strengths Section */}
      {skill_assessment?.current_strengths && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={strengthsRef}>
          <div 
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
            onClick={() => toggleSection('strengths')}
          >
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Current Strengths</h2>
            <span style={{ fontSize: '20px', transform: expandedSections.strengths ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
          </div>
          
          {expandedSections.strengths && (
            <div style={{ padding: '15px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {skill_assessment.current_strengths.map((strength, index) => (
                  <span key={index} style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    padding: '5px 10px', 
                    borderRadius: '20px', 
                    fontSize: '14px' 
                  }}>
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Skill Levels Section */}
      {skill_assessment?.current_skill_levels && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={skillLevelsRef}>
          <div 
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
            onClick={() => toggleSection('skillLevels')}
          >
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Current Skill Levels</h2>
            <span style={{ fontSize: '20px', transform: expandedSections.skillLevels ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
          </div>
          
          {expandedSections.skillLevels && (
            <div style={{ padding: '15px' }}>
              {skill_assessment.current_skill_levels.map((skillObj, index) => 
                Object.entries(skillObj).map(([skill, description]) => (
                  <div key={`${index}-${skill}`} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <h3 style={{ margin: 0, color: '#2c3e50' }}>{skill}</h3>
                      <span style={{ backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        Intermediate
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#666' }}>{description}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Transferable Skills Section */}
      {skill_assessment?.transferable_skills && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={transferableSkillsRef}>
          <div 
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
            onClick={() => toggleSection('transferableSkills')}
          >
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Transferable Skills</h2>
            <span style={{ fontSize: '20px', transform: expandedSections.transferableSkills ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
          </div>
          
          {expandedSections.transferableSkills && (
            <div style={{ padding: '15px' }}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {skill_assessment.transferable_skills.map((skill, index) => (
                  <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Skill Gaps Section */}
      {missing_skills && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={skillGapsRef}>
          <div 
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
            onClick={() => toggleSection('skillGaps')}
          >
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Skill Gaps</h2>
            <span style={{ fontSize: '20px', transform: expandedSections.skillGaps ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
          </div>
          
          {expandedSections.skillGaps && (
            <div style={{ padding: '15px' }}>
              {missing_skills.map((roleData, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>{roleData.role}</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <div>
                      <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>Essential Technical Skills</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {roleData.essential_technical_skills.map((skill, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>Essential Soft Skills</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {roleData.essential_soft_skills.map((skillObj, idx) => 
                          Object.entries(skillObj).map(([skill, importance]) => (
                            <li key={`${idx}-${skill}`} style={{ marginBottom: '4px' }}>
                              {skill} <span style={{ color: '#666', fontSize: '12px' }}>({importance} importance)</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>Recommended Tools</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {roleData.recommended_tools.map((tool, idx) => (
                          <span key={idx} style={{ 
                            backgroundColor: '#17a2b8', 
                            color: 'white', 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px' 
                          }}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>Nice to Have</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {roleData.nice_to_have.map((skill, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Learning Path Section */}
      {learning_path && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={learningPathRef}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa' }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Learning Path</h2>
          </div>
          
          {Object.entries(learning_path).map(([pathKey, pathData], index) => {
            const pathName = pathKey.replace(/_/g, ' ').toUpperCase();
            return (
              <div key={index} style={{ borderTop: '1px solid #eee' }}>
                <div 
                  style={{ 
                    padding: '15px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    backgroundColor: '#fafafa'
                  }}
                  onClick={() => toggleSection('learningPath', pathKey)}
                >
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>{pathName}</h3>
                  <span style={{ fontSize: '20px', transform: expandedSections.learningPath[pathKey] ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
                </div>
                
                {expandedSections.learningPath[pathKey] && (
                  <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                      <h4 style={{ color: '#28a745', marginBottom: '8px' }}>Beginner Resources</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {pathData.beginner_resources.map((resource, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 style={{ color: '#ffc107', marginBottom: '8px' }}>Intermediate Resources</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {pathData.intermediate_resources.map((resource, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 style={{ color: '#dc3545', marginBottom: '8px' }}>Advanced Resources</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {pathData.advanced_resources.map((resource, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 style={{ color: '#17a2b8', marginBottom: '8px' }}>Practice Projects</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {pathData.practice_projects.map((project, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{project}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 style={{ color: '#6f42c1', marginBottom: '8px' }}>Certifications</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {pathData.certifications.map((cert, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Industry Insights Section */}
      {industry_insights && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={insightsRef}>
          <div 
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
            onClick={() => toggleSection('insights')}
          >
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Industry Insights</h2>
            <span style={{ fontSize: '20px', transform: expandedSections.insights ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
          </div>
          
          {expandedSections.insights && (
            <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <h3 style={{ color: '#007bff', marginBottom: '10px' }}>Market Trends</h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {industry_insights.market_trends.map((trend, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>{trend}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Regional Factors</h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {industry_insights.regional_factors.map((factor, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>{factor}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 style={{ color: '#ffc107', marginBottom: '10px' }}>Salary Expectations</h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {industry_insights.salary_expectations.map((salary, index) => (
                    <li key={index} style={{ marginBottom: '8px', fontWeight: 'bold' }}>{salary}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Career Trajectory Section */}
      {career_trajectory && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={careerRef}>
          <div 
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
            onClick={() => toggleSection('career')}
          >
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Career Trajectory</h2>
            <span style={{ fontSize: '20px', transform: expandedSections.career ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
          </div>
          
          {expandedSections.career && (
            <div style={{ padding: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Short Term Goals</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {career_trajectory.short_term_goals.map((goal, index) => (
                      <li key={index} style={{ marginBottom: '8px', padding: '5px', backgroundColor: '#d4edda', borderRadius: '3px' }}>{goal}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 style={{ color: '#ffc107', marginBottom: '10px' }}>Medium Term Goals</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {career_trajectory.medium_term_goals.map((goal, index) => (
                      <li key={index} style={{ marginBottom: '8px', padding: '5px', backgroundColor: '#fff3cd', borderRadius: '3px' }}>{goal}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Long Term Goals</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {career_trajectory.long_term_goals.map((goal, index) => (
                      <li key={index} style={{ marginBottom: '8px', padding: '5px', backgroundColor: '#f8d7da', borderRadius: '3px' }}>{goal}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '8px' }}>Estimated Timeline</h3>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{career_trajectory.estimated_timeline}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Networking Recommendations Section */}
      {networking_recommendations && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={networkingRef}>
          <div 
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
            onClick={() => toggleSection('networking')}
          >
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Networking Recommendations</h2>
            <span style={{ fontSize: '20px', transform: expandedSections.networking ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
          </div>
          
          {expandedSections.networking && (
            <div style={{ padding: '15px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {networking_recommendations.map((recommendation, index) => (
                  <li key={index} style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Recommendations Section */}
      {portfolio_recommendations && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }} ref={portfolioRef}>
          <div 
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
            onClick={() => toggleSection('portfolio')}
          >
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Portfolio Recommendations</h2>
            <span style={{ fontSize: '20px', transform: expandedSections.portfolio ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>+</span>
          </div>
          
          {expandedSections.portfolio && (
            <div style={{ padding: '15px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {portfolio_recommendations.map((recommendation, index) => (
                  <li key={index} style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f3e5f5', borderRadius: '5px' }}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillGapResult;