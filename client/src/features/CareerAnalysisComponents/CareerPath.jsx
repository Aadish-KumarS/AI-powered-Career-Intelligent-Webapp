import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import '../../styles/Career analysis styles/CareerPath.css';

const CareerPath = ({ careerPathResults }) => {
  const [activeSection, setActiveSection] = useState('short');
  const [expandedItem, setExpandedItem] = useState(null);
  const sectionRefs = {
    short: useRef(null),
    mid: useRef(null),
    long: useRef(null)
  };
  
  useEffect(() => {
    if (!careerPathResults) return;
    
    // Initial animations
    gsap.fromTo(
      '.career-path-container',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
    
    // Animate in timeline dots
    gsap.fromTo(
      '.timeline-dot',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, stagger: 0.2, ease: 'back.out(1.7)' }
    );
  }, [careerPathResults]);
  
  useEffect(() => {
    // Animate section change
    Object.keys(sectionRefs).forEach(key => {
      const element = sectionRefs[key].current;
      if (!element) return;
      
      if (key === activeSection) {
        gsap.fromTo(
          element,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }
        );
      } else {
        gsap.to(element, { opacity: 0, x: -20, duration: 0.3 });
      }
    });
  }, [activeSection]);
  
  const handleItemClick = (itemKey) => {
    if (expandedItem === itemKey) {
      // Close the expanded item
      setExpandedItem(null);
      gsap.to(`.item-content-${itemKey}`, { 
        height: 0, 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power2.out' 
      });
    } else {
      // Close previous expanded item if exists
      if (expandedItem) {
        gsap.to(`.item-content-${expandedItem}`, { 
          height: 0, 
          opacity: 0, 
          duration: 0.3, 
          ease: 'power2.out' 
        });
      }
      
      // Expand new item
      setExpandedItem(itemKey);
      gsap.fromTo(
        `.item-content-${itemKey}`,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  };
  
  if (!careerPathResults) return <div className="career-path-loading">Loading career path data...</div>;
  
  // console.log(careerPathResults);
  const {result} = careerPathResults
  const { career_pathway, skill_development_roadmap, potential_challenges, career_milestones } = result;
  
  const renderTimelineItem = (item, index, type, timeframeKey = 'timeframe') => {
    const itemKey = `${type}-${index}`;
    const isExpanded = expandedItem === itemKey;
    
    return (
      <div key={itemKey} className={`timeline-item ${isExpanded ? 'expanded' : ''}`}>
        <div className="timeline-item-header" onClick={() => handleItemClick(itemKey)}>
          <div className="timeline-dot"></div>
          <h3>{item[timeframeKey]}</h3>
          <div className="expand-icon">{isExpanded ? '−' : '+'}</div>
        </div>
        <div className={`timeline-item-content item-content-${itemKey}`}>
          {type === 'short' && (
            <>
              <div className="focus-areas">
                <h4>Focus Areas:</h4>
                <ul>
                  {item.focus_areas.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
              {item.actionable_steps?.length > 0 && (
                <div className="action-steps">
                  <h4>Action Steps:</h4>
                  <ul>
                    {item.actionable_steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.project_recommendations?.length > 0 && (
                <div className="projects">
                  <h4>Recommended Projects:</h4>
                  <ul>
                    {item.project_recommendations.map((project, i) => (
                      <li key={i}>{project}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          
          {type === 'mid' && (
            <>
              {item.potential_roles?.length > 0 && (
                <div className="potential-roles">
                  <h4>Potential Roles:</h4>
                  <ul>
                    {item.potential_roles.map((role, i) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.key_responsibilities?.length > 0 && (
                <div className="responsibilities">
                  <h4>Key Responsibilities:</h4>
                  <ul>
                    {item.key_responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.advancement_strategies?.length > 0 && (
                <div className="strategies">
                  <h4>Advancement Strategies:</h4>
                  <ul>
                    {item.advancement_strategies.map((strategy, i) => (
                      <li key={i}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          
          {type === 'long' && (
            <>
              {item.career_positioning?.length > 0 && (
                <div className="career-positioning">
                  <h4>Career Positioning:</h4>
                  <ul>
                    {item.career_positioning.map((pos, i) => (
                      <li key={i}>{pos}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.industry_positioning?.length > 0 && (
                <div className="industry-positioning">
                  <h4>Industry Positioning:</h4>
                  <ul>
                    {item.industry_positioning.map((pos, i) => (
                      <li key={i}>{pos}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.senior_role_opportunities?.length > 0 && (
                <div className="senior-roles">
                  <h4>Senior Role Opportunities:</h4>
                  <ul>
                    {item.senior_role_opportunities.map((role, i) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };
  
  const renderSkillsSection = () => {
    const [activeSkillTab, setActiveSkillTab] = useState('technical');
    
    const handleTabClick = (tab) => {
      setActiveSkillTab(tab);
      
      // Animate tab change
      gsap.fromTo(
        '.skill-content-active',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    };
    
    return (
      <div className="skills-development-section">
        <h2>Skills Development</h2>
        
        <div className="skill-tabs">
          <button 
            className={`skill-tab ${activeSkillTab === 'technical' ? 'active' : ''}`}
            onClick={() => handleTabClick('technical')}
          >
            Technical Skills
          </button>
          <button 
            className={`skill-tab ${activeSkillTab === 'soft' ? 'active' : ''}`}
            onClick={() => handleTabClick('soft')}
          >
            Soft Skills
          </button>
          <button 
            className={`skill-tab ${activeSkillTab === 'domain' ? 'active' : ''}`}
            onClick={() => handleTabClick('domain')}
          >
            Domain Knowledge
          </button>
        </div>
        
        <div className="skill-content skill-content-active">
          {activeSkillTab === 'technical' && (
            <div className="technical-skills">
              {skill_development_roadmap.technical_skills.map((skill, index) => (
                <div key={index} className="skill-card">
                  <h3>{skill.skill}</h3>
                  <div className="skill-level">
                    <span className="current-level">Current: {skill.current_level}</span>
                    <div className="level-progress">
                      <div 
                        className="level-bar"
                        style={{ 
                          width: skill.current_level === 'Beginner' ? '25%' : 
                                 skill.current_level === 'Intermediate' ? '50%' : 
                                 skill.current_level === 'Advanced' ? '75%' : '90%' 
                        }}
                      ></div>
                    </div>
                    <span className="target-level">Target: {skill.target_level}</span>
                  </div>
                  <div className="skill-resources">
                    <h4>Resources:</h4>
                    <ul>
                      {skill.learning_resources.map((resource, i) => (
                        <li key={i}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeSkillTab === 'soft' && (
            <div className="soft-skills">
              {skill_development_roadmap.soft_skills.map((skill, index) => (
                <div key={index} className="skill-card">
                  <h3>{skill.skill}</h3>
                  <div className="skill-importance">Importance: {skill.importance}</div>
                  <p>{skill.development_approach}</p>
                  <div className="practice-venues">
                    <h4>Practice Venues:</h4>
                    <ul>
                      {skill.practice_venues.map((venue, i) => (
                        <li key={i}>{venue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeSkillTab === 'domain' && (
            <div className="domain-knowledge">
              {skill_development_roadmap.domain_knowledge.map((domain, index) => (
                <div key={index} className="skill-card">
                  <h3>{domain.area}</h3>
                  <p>{domain.acquisition_strategy}</p>
                  <div className="key-concepts">
                    <h4>Key Concepts:</h4>
                    <ul>
                      {domain.key_concepts.map((concept, i) => (
                        <li key={i}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="industry-applications">
                    <h4>Industry Applications:</h4>
                    <ul>
                      {domain.industry_applications.map((app, i) => (
                        <li key={i}>{app}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderChallengesSection = () => {
    return (
      <div className="challenges-section">
        <h2>Potential Challenges</h2>
        <div className="challenges-grid">
          {potential_challenges.map((challenge, index) => (
            <div key={index} className="challenge-card">
              <h3>{challenge.challenge}</h3>
              <div className="challenge-meta">
                <span className="likelihood">Likelihood: {challenge.likelihood}</span>
              </div>
              <p className="challenge-impact">{challenge.impact}</p>
              <div className="mitigation-strategies">
                <h4>Mitigation Strategies:</h4>
                <ul>
                  {challenge.mitigation_strategies.map((strategy, i) => (
                    <li key={i}>{strategy}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderMilestonesSection = () => {
    return (
      <div className="milestones-section">
        <h2>Career Milestones</h2>
        <div className="milestones-timeline">
          {career_milestones.map((milestone, index) => (
            <div key={index} className="milestone-card">
              <div className="milestone-dot"></div>
              <div className="milestone-content">
                <h3>{milestone.milestone}</h3>
                <div className="milestone-timeframe">Target: {milestone.target_timeframe}</div>
                <p className="milestone-significance">{milestone.significance}</p>
                <div className="milestone-prerequisites">
                  <h4>Prerequisites:</h4>
                  <ul>
                    {milestone.prerequisites.map((prereq, i) => (
                      <li key={i}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="career-path-container">
      <div className="career-path-header">
        <h1>Your Career Pathway</h1>
        <div className="timeline-navigation">
          <button 
            className={`timeline-nav-btn ${activeSection === 'short' ? 'active' : ''}`}
            onClick={() => setActiveSection('short')}
          >
            Short-term
          </button>
          <button 
            className={`timeline-nav-btn ${activeSection === 'mid' ? 'active' : ''}`}
            onClick={() => setActiveSection('mid')}
          >
            Mid-term
          </button>
          <button 
            className={`timeline-nav-btn ${activeSection === 'long' ? 'active' : ''}`}
            onClick={() => setActiveSection('long')}
          >
            Long-term
          </button>
        </div>
      </div>
      
      <div className="timeline-container">
        <div ref={sectionRefs.short} className={`timeline-section ${activeSection === 'short' ? 'active' : ''}`}>
          <h2>Short-term Goals (0-12 months)</h2>
         { console.log(career_pathway)}
          
          {career_pathway.short_term_goals.map((goal, index) => renderTimelineItem(goal, index, 'short'))}
        </div>
        
        <div ref={sectionRefs.mid} className={`timeline-section ${activeSection === 'mid' ? 'active' : ''}`}>
          <h2>Mid-term Goals (1-3 years)</h2>
          {career_pathway.mid_term_goals.map((goal, index) => renderTimelineItem(goal, index, 'mid'))}
        </div>
        
        <div ref={sectionRefs.long} className={`timeline-section ${activeSection === 'long' ? 'active' : ''}`}>
          <h2>Long-term Goals (3+ years)</h2>
          {career_pathway.long_term_goals.map((goal, index) => renderTimelineItem(goal, index, 'long'))}
        </div>
      </div>
      
      {renderSkillsSection()}
      {renderChallengesSection()}
      {renderMilestonesSection()}
    </div>
  );
};

export default CareerPath;