import React, { useState } from 'react';
import '../../styles/Career analysis styles/CareerPath.css';
import AppState from '../../components/AppState';

const asArray = (value) => Array.isArray(value) ? value : value ? [value] : [];
const asRecord = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const CareerPath = ({ careerPathResults }) => {
  const [activeSection, setActiveSection] = useState('short');
  const [activeSkillTab, setActiveSkillTab] = useState('technical');
  const [expandedItem, setExpandedItem] = useState(null);
  const handleItemClick = (itemKey) => {
    setExpandedItem((currentItem) => currentItem === itemKey ? null : itemKey);
  };
  
  if (!careerPathResults) return <AppState title="Mapping your possible path" description="We’re shaping the next stages of your career." />;

  const { result = {} } = careerPathResults;
  const {
    career_pathway: careerPathway,
    skill_development_roadmap: skillDevelopmentRoadmap,
    potential_challenges: potentialChallenges,
    career_milestones: careerMilestones,
  } = result;

  // The skill-gap endpoint returns career_trajectory, not the structure this view renders.
  // Only the suggest-career-path endpoint returns the fields required by CareerPath.
  if (!careerPathway || !skillDevelopmentRoadmap) {
    return (
      <AppState type="error" title="Career path unavailable" description="Generate a career-path recommendation to view this tab." />
    );
  }

  const career_pathway = asRecord(careerPathway);
  const rawSkillRoadmap = asRecord(skillDevelopmentRoadmap);
  const skill_development_roadmap = {
    technical_skills: asArray(rawSkillRoadmap.technical_skills),
    soft_skills: asArray(rawSkillRoadmap.soft_skills),
    domain_knowledge: asArray(rawSkillRoadmap.domain_knowledge),
  };
  const potential_challenges = asArray(potentialChallenges);
  const career_milestones = asArray(careerMilestones);
  
  const renderTimelineItem = (item, index, type, timeframeKey = 'timeframe') => {
    const itemKey = `${type}-${index}`;
    const isExpanded = expandedItem === itemKey;
    
    return (
      <div key={itemKey} className={`timeline-item ${isExpanded ? 'expanded' : ''}`}>
        <button
          type="button"
          className="timeline-item-header"
          onClick={() => handleItemClick(itemKey)}
          aria-expanded={isExpanded}
        >
          <div className="timeline-dot"></div>
          <span className="timeline-item-title">{item[timeframeKey]}</span>
          <div className="expand-icon">{isExpanded ? '−' : '+'}</div>
        </button>
        {isExpanded && <div className="timeline-item-content">
          {type === 'short' && (
            <>
              <div className="focus-areas">
                <h4>Focus Areas:</h4>
                <ul>
                  {asArray(item.focus_areas).map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
              {item.actionable_steps?.length > 0 && (
                <div className="action-steps">
                  <h4>Action Steps:</h4>
                  <ul>
                    {asArray(item.actionable_steps).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.project_recommendations?.length > 0 && (
                <div className="projects">
                  <h4>Recommended Projects:</h4>
                  <ul>
                    {asArray(item.project_recommendations).map((project, i) => (
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
                    {asArray(item.potential_roles).map((role, i) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.key_responsibilities?.length > 0 && (
                <div className="responsibilities">
                  <h4>Key Responsibilities:</h4>
                  <ul>
                    {asArray(item.key_responsibilities).map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.advancement_strategies?.length > 0 && (
                <div className="strategies">
                  <h4>Advancement Strategies:</h4>
                  <ul>
                    {asArray(item.advancement_strategies).map((strategy, i) => (
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
                    {asArray(item.career_positioning).map((pos, i) => (
                      <li key={i}>{pos}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.industry_positioning?.length > 0 && (
                <div className="industry-positioning">
                  <h4>Industry Positioning:</h4>
                  <ul>
                    {asArray(item.industry_positioning).map((pos, i) => (
                      <li key={i}>{pos}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.senior_role_opportunities?.length > 0 && (
                <div className="senior-roles">
                  <h4>Senior Role Opportunities:</h4>
                  <ul>
                    {asArray(item.senior_role_opportunities).map((role, i) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>}
      </div>
    );
  };
  
  const renderSkillsSection = () => {
    return (
      <div className="skills-development-section">
        <h2>Skills Development</h2>
        
        <div className="skill-tabs">
          <button 
            type="button"
            className={`skill-tab ${activeSkillTab === 'technical' ? 'active' : ''}`}
            onClick={() => setActiveSkillTab('technical')}
          >
            Technical Skills
          </button>
          <button 
            type="button"
            className={`skill-tab ${activeSkillTab === 'soft' ? 'active' : ''}`}
            onClick={() => setActiveSkillTab('soft')}
          >
            Soft Skills
          </button>
          <button 
            type="button"
            className={`skill-tab ${activeSkillTab === 'domain' ? 'active' : ''}`}
            onClick={() => setActiveSkillTab('domain')}
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
                      {asArray(skill.learning_resources).map((resource, i) => (
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
                      {asArray(skill.practice_venues).map((venue, i) => (
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
                      {asArray(domain.key_concepts).map((concept, i) => (
                        <li key={i}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="industry-applications">
                    <h4>Industry Applications:</h4>
                    <ul>
                      {asArray(domain.industry_applications).map((app, i) => (
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
                  {asArray(challenge.mitigation_strategies).map((strategy, i) => (
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
                    {asArray(milestone.prerequisites).map((prereq, i) => (
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
            type="button"
            className={`timeline-nav-btn ${activeSection === 'short' ? 'active' : ''}`}
            onClick={() => setActiveSection('short')}
            aria-pressed={activeSection === 'short'}
          >
            Short-term
          </button>
          <button 
            type="button"
            className={`timeline-nav-btn ${activeSection === 'mid' ? 'active' : ''}`}
            onClick={() => setActiveSection('mid')}
            aria-pressed={activeSection === 'mid'}
          >
            Mid-term
          </button>
          <button 
            type="button"
            className={`timeline-nav-btn ${activeSection === 'long' ? 'active' : ''}`}
            onClick={() => setActiveSection('long')}
            aria-pressed={activeSection === 'long'}
          >
            Long-term
          </button>
        </div>
      </div>
      
      <div className="timeline-container">
        <div className={`timeline-section ${activeSection === 'short' ? 'active' : ''}`}>
          <h2>Short-term Goals (0-12 months)</h2>
          {asArray(career_pathway.short_term_goals).map((goal, index) => renderTimelineItem(asRecord(goal), index, 'short'))}
        </div>
        
        <div className={`timeline-section ${activeSection === 'mid' ? 'active' : ''}`}>
          <h2>Mid-term Goals (1-3 years)</h2>
          {asArray(career_pathway.mid_term_goals).map((goal, index) => renderTimelineItem(asRecord(goal), index, 'mid'))}
        </div>
        
        <div className={`timeline-section ${activeSection === 'long' ? 'active' : ''}`}>
          <h2>Long-term Goals (3+ years)</h2>
          {asArray(career_pathway.long_term_goals).map((goal, index) => renderTimelineItem(asRecord(goal), index, 'long'))}
        </div>
      </div>
      
      {renderSkillsSection()}
      {renderChallengesSection()}
      {renderMilestonesSection()}
    </div>
  );
};

export default CareerPath;
