import React, { useState } from 'react';
import '../../styles/Career analysis styles/JobMarketInsights.css';
import AppState from '../../components/AppState';

const asArray = (value) => Array.isArray(value) ? value : [];
const asRecord = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const JobMarketInsights = ({ jobMarketInsights }) => {
  const [activeSection, setActiveSection] = useState('skills');

  if (!jobMarketInsights?.result) {
    return <AppState title="Reading the market" description="We’re organizing demand, roles, and hiring signals." />;
  }

  const {
    market_demand_analysis,
    role_insights,
    industry_landscape,
    compensation_insights,
    future_outlook,
    hiring_channel_effectiveness,
    interview_process_insights
  } = jobMarketInsights.result;
  const marketDemandAnalysis = asRecord(market_demand_analysis);
  const roleInsights = asArray(role_insights);
  const industryLandscape = asRecord(industry_landscape);
  const compensationInsights = asRecord(compensation_insights);
  const salaryRanges = asRecord(compensationInsights.salary_ranges);
  const futureOutlook = asRecord(future_outlook);
  const hiringChannelEffectiveness = asRecord(hiring_channel_effectiveness);
  const interviewProcessInsights = asRecord(interview_process_insights);

  // Handler for section changes
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Render skill item with demand rating visualization
  const renderSkillDemand = (skill) => (
    <div className="skill-item" key={skill.name}>
      <span className="skill-name">{skill.name}</span>
      <div className="demand-bar-container">
        <div 
          className="demand-bar" 
          style={{ width: `${skill.demand_rating * 10}%` }}
        ></div>
        <span className="demand-rating">{skill.demand_rating}</span>
      </div>
    </div>
  );

  // Render emerging skill with growth visualization
  const renderEmergingSkill = (skill) => (
    <div className="emerging-skill-item" key={skill.name}>
      <span className="skill-name">{skill.name}</span>
      <div className="growth-bar-container">
        <div 
          className="growth-bar" 
          style={{ width: `${skill.growth_percentage}%` }}
        ></div>
        <span className="growth-percentage">{skill.growth_percentage}%</span>
      </div>
    </div>
  );

  // Render role card
  const renderRoleCard = (role) => (
    <div className="role-card" key={role.role_title}>
      <h3 className="role-title">{role.role_title}</h3>
      <div className="role-stats">
        <div className="stat-item">
          <span className="stat-label">Experience:</span>
          <span className="stat-value">{role.average_years_experience}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Remote:</span>
          <span className="stat-value">{role.remote_opportunities}</span>
        </div>
      </div>
      <div className="role-requirements">
        <h4>Requirements</h4>
        <ul>
        {asArray(role.common_requirements).map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>
      <div className="role-titles">
        <h4>Common Titles</h4>
        <div className="title-tags">
          {asArray(role.common_titles).map((title, i) => (
            <span className="title-tag" key={i}>{title}</span>
          ))}
        </div>
      </div>
      <div className="distribution-chart">
        <h4>Level Distribution</h4>
        <div className="distribution-bar">
          {String(role.entry_vs_senior_distribution || '').split(', ').filter(Boolean).map((level, i) => {
            const [percentage, levelType] = level.split(' ');
            return (
              <div 
                className={`distribution-segment ${levelType}`} 
                key={i}
                style={{ width: percentage }}
              >
                <span className="segment-label">{level}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="job-market-insights">
      <header className="insights-header">
        <h1>Job Market Insights</h1>
        <div className="insight-date">
          Generated on {new Date(jobMarketInsights.processed_at).toLocaleDateString()}
        </div>
      </header>

      <nav className="insights-nav">
        <ul>
          <li className={activeSection === 'skills' ? 'active' : ''}>
            <button type="button" onClick={() => handleSectionChange('skills')} aria-pressed={activeSection === 'skills'}>Skills Demand</button>
          </li>
          <li className={activeSection === 'roles' ? 'active' : ''}>
            <button type="button" onClick={() => handleSectionChange('roles')} aria-pressed={activeSection === 'roles'}>Roles</button>
          </li>
          <li className={activeSection === 'industry' ? 'active' : ''}>
            <button type="button" onClick={() => handleSectionChange('industry')} aria-pressed={activeSection === 'industry'}>Industry</button>
          </li>
          <li className={activeSection === 'compensation' ? 'active' : ''}>
            <button type="button" onClick={() => handleSectionChange('compensation')} aria-pressed={activeSection === 'compensation'}>Compensation</button>
          </li>
          <li className={activeSection === 'future' ? 'active' : ''}>
            <button type="button" onClick={() => handleSectionChange('future')} aria-pressed={activeSection === 'future'}>Future Outlook</button>
          </li>
          <li className={activeSection === 'hiring' ? 'active' : ''}>
            <button type="button" onClick={() => handleSectionChange('hiring')} aria-pressed={activeSection === 'hiring'}>Hiring Channels</button>
          </li>
          <li className={activeSection === 'interview' ? 'active' : ''}>
            <button type="button" onClick={() => handleSectionChange('interview')} aria-pressed={activeSection === 'interview'}>Interview Process</button>
          </li>
        </ul>
      </nav>

      <div className="insights-content">
        {/* Skills Demand Section */}
        <section 
          className={`insights-section skills-section ${activeSection === 'skills' ? 'active' : ''}`}
        >
          <div className="section-grid">
            <div className="grid-item">
              <h2>High Demand Skills</h2>
              <div className="skills-list">
                {asArray(marketDemandAnalysis.high_demand_skills).map(renderSkillDemand)}
              </div>
            </div>
            <div className="grid-item">
              <h2>Saturated Skills</h2>
              <div className="skills-list">
                {asArray(marketDemandAnalysis.saturated_skills).map(renderSkillDemand)}
              </div>
            </div>
            <div className="grid-item">
              <h2>Emerging Skills</h2>
              <div className="skills-list">
                {asArray(marketDemandAnalysis.emerging_skills).map(renderEmergingSkill)}
              </div>
            </div>
            <div className="grid-item skills-balance">
              <h2>Skills Balance</h2>
              <p>{marketDemandAnalysis.technical_vs_soft_skills_balance}</p>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section 
          className={`insights-section roles-section ${activeSection === 'roles' ? 'active' : ''}`}
        >
          <div className="roles-container">
            {roleInsights.map(renderRoleCard)}
          </div>
        </section>

        {/* Industry Section */}
        <section 
          className={`insights-section industry-section ${activeSection === 'industry' ? 'active' : ''}`}
        >
          <div className="section-grid">
            <div className="grid-item">
              <h2>Growing Sectors</h2>
              <ul className="sectors-list growing">
                {asArray(industryLandscape.growing_sectors).map((sector, i) => (
                  <li key={i} className="sector-item">{sector}</li>
                ))}
              </ul>
            </div>
            <div className="grid-item">
              <h2>Declining Sectors</h2>
              <ul className="sectors-list declining">
                {asArray(industryLandscape.declining_sectors).map((sector, i) => (
                  <li key={i} className="sector-item">{sector}</li>
                ))}
              </ul>
            </div>
            <div className="grid-item full-width">
              <h2>Geographical Hotspots</h2>
              <div className="hotspots-map">
                {/* Simplified map visualization */}
                <div className="map-container">
                  {asArray(industryLandscape.geographical_hotspots).map((hotspot, i) => (
                    <div 
                      key={i}
                      className="hotspot-marker"
                      style={{ 
                        left: `${(hotspot.longitude + 180) * (100/360)}%`, 
                        top: `${(90 - hotspot.latitude) * (100/180)}%` 
                      }}
                    >
                      <span className="hotspot-label">{hotspot.city}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid-item">
              <h2>Startup vs Enterprise</h2>
              <p>{industryLandscape.startup_vs_enterprise}</p>
            </div>
          </div>
        </section>

        {/* Compensation Section */}
        <section 
          className={`insights-section compensation-section ${activeSection === 'compensation' ? 'active' : ''}`}
        >
          <div className="section-grid">
            <div className="grid-item">
              <h2>Salary Ranges</h2>
              <div className="salary-levels">
                <div className="salary-level">
                  <h4>Entry Level</h4>
                  <div className="salary-amount">{salaryRanges.entry_level}</div>
                </div>
                <div className="salary-level">
                  <h4>Mid Level</h4>
                  <div className="salary-amount">{salaryRanges.mid_level}</div>
                </div>
                <div className="salary-level">
                  <h4>Senior Level</h4>
                  <div className="salary-amount">{salaryRanges.senior_level}</div>
                </div>
              </div>
            </div>
            <div className="grid-item">
              <h2>Compensation Trends</h2>
              <div className="trends-chart">
                <p>{compensationInsights.compensation_trends}</p>
              </div>
            </div>
            <div className="grid-item">
              <h2>Benefits Trends</h2>
              <ul className="benefits-list">
                {asArray(compensationInsights.benefits_trends).map((benefit, i) => (
                  <li key={i} className="benefit-item">{benefit}</li>
                ))}
              </ul>
            </div>
            <div className="grid-item">
              <h2>Negotiation Leverage</h2>
              <ul className="leverage-list">
                {asArray(compensationInsights.negotiation_leverage_points).map((point, i) => (
                  <li key={i} className="leverage-item">{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Future Outlook Section */}
        <section 
          className={`insights-section future-section ${activeSection === 'future' ? 'active' : ''}`}
        >
          <div className="section-grid">
            <div className="grid-item">
              <h2>5-Year Projection</h2>
              <div className="projection-box">
                <p>{futureOutlook.five_year_projection}</p>
              </div>
            </div>
            <div className="grid-item">
              <h2>Automation Risk</h2>
              <div className="risk-box">
                <p>{futureOutlook.automation_risk}</p>
              </div>
            </div>
            <div className="grid-item">
              <h2>Emerging Hybrid Roles</h2>
              <ul className="hybrid-roles-list">
                {asArray(futureOutlook.emerging_hybrid_roles).map((role, i) => (
                  <li key={i} className="hybrid-role-item">{role}</li>
                ))}
              </ul>
            </div>
            <div className="grid-item">
              <h2>Reskilling Opportunities</h2>
              <ul className="reskilling-list">
                {asArray(futureOutlook.reskilling_opportunities).map((skill, i) => (
                  <li key={i} className="reskilling-item">{skill}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Hiring Channels Section */}
        <section 
          className={`insights-section hiring-section ${activeSection === 'hiring' ? 'active' : ''}`}
        >
          <div className="section-grid">
            <div className="grid-item">
              <h2>Job Boards</h2>
              <ul className="channel-list">
                {asArray(hiringChannelEffectiveness.job_boards).map((board, i) => (
                  <li key={i} className="channel-item">{board}</li>
                ))}
              </ul>
            </div>
            <div className="grid-item">
              <h2>Networking Platforms</h2>
              <ul className="channel-list">
                {asArray(hiringChannelEffectiveness.networking_platforms).map((platform, i) => (
                  <li key={i} className="channel-item">{platform}</li>
                ))}
              </ul>
            </div>
            <div className="grid-item">
              <h2>Recruitment Agencies</h2>
              <ul className="channel-list">
                {asArray(hiringChannelEffectiveness.recruitment_agencies).map((agency, i) => (
                  <li key={i} className="channel-item">{agency}</li>
                ))}
              </ul>
            </div>
            <div className="grid-item">
              <h2>Direct Application Success</h2>
              <div className="success-rate">
                <div className="rate-display">
                  <div 
                    className="rate-fill"
                    style={{ width: hiringChannelEffectiveness.direct_application_success_rate }}
                  ></div>
                  <span className="rate-value">{hiringChannelEffectiveness.direct_application_success_rate}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interview Process Section */}
        <section 
          className={`insights-section interview-section ${activeSection === 'interview' ? 'active' : ''}`}
        >
          <div className="section-grid">
            <div className="grid-item">
              <h2>Common Assessments</h2>
              <ul className="assessment-list">
                {asArray(interviewProcessInsights.common_assessments).map((assessment, i) => (
                  <li key={i} className="assessment-item">{assessment}</li>
                ))}
              </ul>
            </div>
            <div className="grid-item">
              <h2>Interview Stages</h2>
              <div className="stages-timeline">
                {asArray(interviewProcessInsights.interview_stages).map((stage, i) => (
                  <div key={i} className="stage-item">
                    <div className="stage-marker">{i + 1}</div>
                    <div className="stage-name">{stage}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid-item">
              <h2>Key Evaluation Criteria</h2>
              <ul className="criteria-list">
                {asArray(interviewProcessInsights.key_evaluation_criteria).map((criterion, i) => (
                  <li key={i} className="criterion-item">{criterion}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default JobMarketInsights;
