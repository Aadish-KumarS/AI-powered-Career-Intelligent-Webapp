import { Link } from 'react-router-dom';
import { createElement } from 'react';
import { FiArrowUpRight, FiBarChart2, FiCompass, FiMap, FiTarget } from 'react-icons/fi';
import Navbar from '../components/LandingPageComponents/Navbar';
import '../styles/Dashboard.css';

const tools = [
  { icon: FiCompass, title: 'Career guidance', copy: 'Find the three roles that best fit your profile.', to: '/services/career-guid/onboarding', tag: 'Start here' },
  { icon: FiBarChart2, title: 'Career analysis', copy: 'Understand strengths, skill gaps, and the market around you.', to: '/services/career-guid/career-analysis', tag: 'Explore' },
  { icon: FiMap, title: 'Roadmap generator', copy: 'Turn a goal into a practical, paced learning plan.', to: '/services/generate-roadmap', tag: 'Build a plan' },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <Navbar variant="app" />
      <main className="dashboard-shell">
        <section className="dashboard-intro">
          <p className="dashboard-kicker">Your career workspace</p>
          <h1>Make your next move<br /><em>with clarity.</em></h1>
          <p className="dashboard-copy">Use one focused step at a time. We’ll keep your direction, evidence, and next actions in one place.</p>
          <Link className="dashboard-primary-link" to="/services/career-guid/onboarding">Start my career guidance <FiArrowUpRight /></Link>
        </section>

        <section className="dashboard-rail" aria-label="Getting started">
          <div className="dashboard-rail__header"><span>01</span><p>Start with a profile that reflects where you are today.</p></div>
          <div className="dashboard-rail__line" aria-hidden="true"><span /></div>
          <div className="dashboard-rail__header"><span>02</span><p>Use the insight to choose a role worth pursuing.</p></div>
          <div className="dashboard-rail__line dashboard-rail__line--soft" aria-hidden="true"><span /></div>
          <div className="dashboard-rail__header"><span>03</span><p>Build a plan and return when you are ready for the next step.</p></div>
        </section>

        <section className="dashboard-tools" aria-labelledby="dashboard-tools-title">
          <div className="dashboard-section-heading"><div><p className="dashboard-kicker">Choose a place to begin</p><h2 id="dashboard-tools-title">Your tools</h2></div><FiTarget aria-hidden="true" /></div>
          <div className="dashboard-tool-grid">
            {tools.map(({ icon, title, copy, to, tag }) => (
              <Link className="dashboard-tool-card" to={to} key={title}>
                {createElement(icon, { className: 'dashboard-tool-card__icon', 'aria-hidden': true })}
                <span className="dashboard-tool-card__tag">{tag}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="dashboard-tool-card__arrow"><FiArrowUpRight aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
