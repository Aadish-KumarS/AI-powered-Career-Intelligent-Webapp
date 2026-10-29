import { FiArrowUpRight, FiAward, FiBarChart2, FiCompass, FiMap, FiTrendingUp } from 'react-icons/fi';
import '../../styles/Landingpage Styles/Features.css';
import featuresData from '../../constants/featureConstants';
import { useNavigate } from 'react-router-dom';

const featureIcons = [
  <FiMap aria-hidden="true" />,
  <FiAward aria-hidden="true" />,
  <FiBarChart2 aria-hidden="true" />,
  <FiCompass aria-hidden="true" />,
  <FiTrendingUp aria-hidden="true" />,
  <FiMap aria-hidden="true" />,
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <section className="journey-section" id="features" aria-labelledby="journey-heading">
      <div className="journey-section__header">
        <p className="section-kicker">A little clarity goes a long way</p>
        <h2 id="journey-heading">Everything you need for the part that comes next.</h2>
        <p>From the first “what if?” to a plan you’re proud to follow, each tool is designed to be useful—not overwhelming.</p>
      </div>

      <div className="journey-grid">
        {featuresData.map((feature, index) => {
          const icon = featureIcons[index];
          return (
            <article className="journey-card" key={feature.id}>
              <div className="journey-card__topline"><span>0{index + 1}</span>{icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.shortDesc}</p>
              <button type="button" onClick={() => navigate(`/${feature.link.replace(/^\//, '')}`)}>
                Explore tool <FiArrowUpRight />
              </button>
            </article>
          );
        })}
      </div>

      <div className="journey-method" aria-label="How Right Track works">
        <div className="journey-method__intro">
          <p className="section-kicker">The right kind of support</p>
          <h3>Less guessing.<br /><em>More momentum.</em></h3>
        </div>
        <ol className="journey-method__steps">
          <li><span>01</span><div><strong>Tell us where you are</strong><p>Share the experience, skills, and questions you’re carrying right now.</p></div></li>
          <li><span>02</span><div><strong>See a direction take shape</strong><p>Explore roles that fit your strengths and the life you want to build.</p></div></li>
          <li><span>03</span><div><strong>Take one good next step</strong><p>Use a tailored roadmap to move forward at a pace that feels doable.</p></div></li>
        </ol>
      </div>
    </section>
  );
}
