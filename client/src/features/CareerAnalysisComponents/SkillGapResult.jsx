import { useEffect, useState } from 'react';
import '../../styles/Career analysis styles/SkillGapResult.css';
import AppState from '../../components/AppState';

const asArray = (value) => Array.isArray(value) ? value : [];
const asRecord = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const SkillGapResult = ({ analysisData }) => {
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    skillGaps: {},
    learningPath: {},
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!analysisData) return;
    
    const result = asRecord(analysisData?.result);
    const assessment = asRecord(result.skill_assessment);
    const skillGaps = Object.keys(asRecord(assessment.skill_gaps)).reduce((sections, roleKey, index) => {
      // Surface one concrete next step immediately; further role detail stays
      // available without making the report feel like a wall of open panels.
      sections[roleKey] = index === 0;
      return sections;
    }, {});
    const learningPath = Object.keys(asRecord(result.learning_path)).reduce((sections, pathKey) => {
      // Learning resources are part of the reading flow, so they are visible
      // immediately. Users can still collapse an individual resource group.
      sections[pathKey] = true;
      return sections;
    }, {});

    setExpandedSections({
      skillGaps,
      learningPath,
    });
    setIsLoading(false);
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
    }
  };

  if (isLoading) {
    return <AppState title="Reading your skill assessment" description="We’re organizing strengths, gaps, and next steps." />;
  }

  if (!analysisData) {
    return <AppState type="error" title="Skill assessment unavailable" description="Please run the analysis again to see this view." />;
  }

  const result = asRecord(analysisData.result);
  const rawAssessment = asRecord(result.skill_assessment);
  const skill_assessment = {
    current_strengths: asArray(rawAssessment.current_strengths),
    current_skill_levels: asRecord(rawAssessment.current_skill_levels),
    transferable_skills: asArray(rawAssessment.transferable_skills),
    skill_gaps: asRecord(rawAssessment.skill_gaps),
  };
  const learning_path = asRecord(result.learning_path);
  const rawIndustryInsights = asRecord(result.industry_insights);
  const industry_insights = {
    market_trends: asArray(rawIndustryInsights.market_trends),
    regional_factors: asArray(rawIndustryInsights.regional_factors),
    salary_expectations: asArray(rawIndustryInsights.salary_expectations),
  };
  const rawCareerTrajectory = asRecord(result.career_trajectory);
  const career_trajectory = {
    short_term_goals: asArray(rawCareerTrajectory.short_term_goals),
    medium_term_goals: asArray(rawCareerTrajectory.medium_term_goals),
    long_term_goals: asArray(rawCareerTrajectory.long_term_goals),
    estimated_timeline: rawCareerTrajectory.estimated_timeline || 'Not specified',
  };
  const networking_recommendations = asArray(result.networking_recommendations);
  const portfolio_recommendations = asArray(result.portfolio_recommendations);
  const roleGapEntries = Object.entries(skill_assessment.skill_gaps);
  const learningPathEntries = Object.entries(learning_path);

  return (
    <div className="skill-gap-container">
      <h1 className="skill-gap-title">Your Skill Assessment Results</h1>

      <section className="skill-gap-overview" aria-label="Skill assessment summary">
        <div className="overview-stat overview-stat--strengths">
          <span>{String(skill_assessment.current_strengths.length).padStart(2, '0')}</span>
          <small>strengths to build on</small>
        </div>
        <div className="overview-stat overview-stat--gaps">
          <span>{String(roleGapEntries.length).padStart(2, '0')}</span>
          <small>career directions assessed</small>
        </div>
        <div className="overview-stat overview-stat--paths">
          <span>{String(learningPathEntries.length).padStart(2, '0')}</span>
          <small>learning tracks ready</small>
        </div>
      </section>
      
      {/* Current Strengths Section */}
      <div className="skill-gap-section">
        <div className="section-header">
          <h2>Current Strengths</h2>
        </div>
        
        <div className="section-content strengths-content">
          <ul className="skills-list">
            {skill_assessment.current_strengths.map((strength, index) => (
              <li key={index} className="strength-item">
                <span className="strength-badge">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Current Skill Levels Section */}
      <div className="skill-gap-section">
        <div className="section-header">
          <h2>Current Skill Levels</h2>
        </div>
        
        <div className="section-content">
          {Object.entries(skill_assessment.current_skill_levels).map(([skill, description], index) => {
              const skillDescription = typeof description === 'string'
                ? description
                : String(description?.description || '');
              // Extract level from description (assuming format "(Level) Description")
              const levelMatch = skillDescription.match(/^\((.*?)\)/);
              const level = levelMatch ? levelMatch[1] : "Intermediate";
              const cleanDescription = skillDescription.replace(/^\(.*?\)\s*/, '');
              
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
      </div>

      {/* Transferable Skills Section */}
      <div className="skill-gap-section">
        <div className="section-header">
          <h2>Transferable Skills</h2>
        </div>
        
        <div className="section-content">
          <ul className="transferable-skills-list">
            {skill_assessment.transferable_skills.map((skill, index) => (
              <li key={index} className="transferable-skill-item">{skill}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skill Gaps Section */}
      <div className="skill-gap-section skill-gaps-container">
        <div className="section-header">
          <h2>Skill Gaps</h2>
        </div>
        
        {/* Render each role's skill gaps */}
        {roleGapEntries.map(([roleKey, roleData], index) => {
          const safeRoleData = asRecord(roleData);
          const role = roleKey.replace(/_/g, ' ');
          const priorityLevel = String(safeRoleData.priority_level || safeRoleData.priority || 'Medium');
          return (
            <div key={index} className="role-gap-container">
              <button
                type="button"
                className="role-header" 
                onClick={() => toggleSection('skillGaps', roleKey)}
                aria-expanded={expandedSections.skillGaps[roleKey]}
              >
                <h3>{role}</h3>
                <span className={`priority-badge ${priorityLevel.toLowerCase()}`}>
                  Priority: {priorityLevel}
                </span>
                <span className={`expand-icon ${expandedSections.skillGaps[roleKey] ? 'expanded' : ''}`}>+</span>
              </button>
              
              {expandedSections.skillGaps[roleKey] && (
                <div className="role-content">
                  <div className="skills-column">
                    <h4>Essential Technical Skills</h4>
                    <ul>
                      {asArray(safeRoleData.essential_technical_skills).map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="skills-column">
                    <h4>Essential Soft Skills</h4>
                    <ul>
                      {asArray(safeRoleData.essential_soft_skills).map((skill, idx) => (
                        <li key={idx}>
                          {typeof skill === 'string' ? skill : skill?.skill}
                          {typeof skill !== 'string' && skill?.importance_rating && <span className="importance">(Importance: {skill.importance_rating})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="skills-column">
                    <h4>Recommended Tools</h4>
                    <ul className="tools-list">
                      {asArray(safeRoleData.recommended_tools).map((tool, idx) => (
                        <li key={idx} className="tool-item">{tool}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="skills-column">
                    <h4>Nice to Have</h4>
                    <ul>
                      {asArray(safeRoleData.nice_to_have).map((skill, idx) => (
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
      <div className="skill-gap-section">
        <div className="section-header">
          <h2>Learning Path</h2>
        </div>
        
        {/* Render each learning path */}
        {learningPathEntries.map(([pathKey, pathData], index) => {
          const safePathData = asRecord(pathData);
          const pathName = pathKey.replace(/_/g, ' ');
          return (
            <div key={index} className="learning-path-container">
              <button
                type="button"
                className="path-header" 
                onClick={() => toggleSection('learningPath', pathKey)}
                aria-expanded={expandedSections.learningPath[pathKey]}
              >
                <h3>{pathName}</h3>
                <span className={`expand-icon ${expandedSections.learningPath[pathKey] ? 'expanded' : ''}`}>+</span>
              </button>
              
              {expandedSections.learningPath[pathKey] && (
                <div className="path-content">
                  <div className="resource-column">
                    <h4>Beginner Resources</h4>
                    <ul>
                      {asArray(safePathData.beginner_resources).map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="resource-column">
                    <h4>Intermediate Resources</h4>
                    <ul>
                      {asArray(safePathData.intermediate_resources).map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="resource-column">
                    <h4>Advanced Resources</h4>
                    <ul>
                      {asArray(safePathData.advanced_resources).map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="resource-column">
                    <h4>Practice Projects</h4>
                    <ul>
                      {asArray(safePathData.practice_projects).map((project, idx) => (
                        <li key={idx}>{project}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="resource-column">
                    <h4>Certifications</h4>
                    <ul>
                      {asArray(safePathData.certifications).map((cert, idx) => (
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
      <div className="skill-gap-section">
        <div className="section-header">
          <h2>Industry Insights</h2>
        </div>
        
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
      </div>

      {/* Career Trajectory Section */}
      <div className="skill-gap-section">
        <div className="section-header">
          <h2>Career Trajectory</h2>
        </div>
        
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
      </div>

      {/* Networking Recommendations Section */}
      <div className="skill-gap-section">
        <div className="section-header">
          <h2>Networking Recommendations</h2>
        </div>
        
        <div className="section-content">
          <ul className="networking-list">
            {networking_recommendations.map((recommendation, index) => (
              <li key={index} className="networking-item">{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Portfolio Recommendations Section */}
      <div className="skill-gap-section">
        <div className="section-header">
          <h2>Portfolio Recommendations</h2>
        </div>
        
        <div className="section-content">
          <ul className="portfolio-list">
            {portfolio_recommendations.map((recommendation, index) => (
              <li key={index} className="portfolio-item">{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SkillGapResult;
