import { FiArrowUpRight, FiHeart, FiLayers, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../../styles/Landingpage Styles/About.css';

const principles = [
  { icon: <FiHeart aria-hidden="true" />, title: 'Human before algorithm', body: 'We start with your lived experience—not a score or a stereotype.' },
  { icon: <FiLayers aria-hidden="true" />, title: 'Useful, not noisier', body: 'Every recommendation should make the next decision feel lighter.' },
  { icon: <FiUsers aria-hidden="true" />, title: 'Made for real lives', body: 'Ambition looks different for everyone. Your plan should too.' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <section className="home-belief" id="about" aria-labelledby="belief-heading">
      <div className="home-belief__quote-mark" aria-hidden="true">“</div>
      <div className="home-belief__intro">
        <p className="section-kicker">Why Right Track exists</p>
        <h2 id="belief-heading">Career guidance should feel more like a good conversation than a personality quiz.</h2>
      </div>

      <div className="home-belief__body">
        <div className="home-belief__body-copy">
          <p>There’s rarely one perfect answer to “what should I do next?” There is, however, a better way to notice the patterns in your story, explore what fits, and move before certainty arrives.</p>
          <p>Right Track combines practical AI with the perspective that careers are personal, nonlinear, and always in progress.</p>
          <button type="button" onClick={() => navigate('/signup')}>Begin your next chapter <FiArrowUpRight /></button>
        </div>
        <aside className="home-belief__aside">
          <p>Our promise</p>
          <strong>We’ll help you find a direction without pretending to have your whole life figured out.</strong>
          <span>That part is yours.</span>
        </aside>
      </div>

      <div className="home-belief__principles">
        {principles.map(({ icon, title, body }) => (
          <article key={title}>
            {icon}
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
