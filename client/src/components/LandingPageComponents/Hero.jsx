import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { FiArrowUpRight, FiPlayCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import careerJourneyImage from '../../assets/career-journey-editorial.jpg';
import '../../styles/Landingpage Styles/HeroSection.css';

export default function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.human-hero__eyebrow', { opacity: 0, y: 18, duration: 0.5 })
        .from('.human-hero__title span', { opacity: 0, y: 38, duration: 0.72, stagger: 0.12 }, '-=0.2')
        .from('.human-hero__copy, .human-hero__actions, .human-hero__note', { opacity: 0, y: 18, duration: 0.52, stagger: 0.1 }, '-=0.35')
        .from('.human-hero__portrait', { opacity: 0, scale: 0.96, duration: 0.9 }, '-=0.7')
        .from('.hero-paper-note', { opacity: 0, x: -20, rotate: -8, duration: 0.55 }, '-=0.4');
    }, heroRef);

    return () => context.revert();
  }, []);

  const scrollToMethod = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="human-hero" ref={heroRef} aria-labelledby="hero-heading">
      <div className="human-hero__sun" aria-hidden="true" />
      <div className="human-hero__inner">
        <div className="human-hero__content">
          <p className="human-hero__eyebrow">Career guidance for the wonderfully undecided</p>
          <h1 id="hero-heading" className="human-hero__title">
            <span>Make your next move</span>
            <span>feel like <em>your own.</em></span>
          </h1>
          <p className="human-hero__copy">
            Right Track turns your experience, curiosity, and ambitions into a direction you can believe in—and a practical plan to get there.
          </p>
          <div className="human-hero__actions">
            <button className="human-hero__primary" type="button" onClick={() => navigate('/signup')}>
              Start with your story <FiArrowUpRight />
            </button>
            <button className="human-hero__secondary" type="button" onClick={scrollToMethod}>
              <FiPlayCircle /> See how it works
            </button>
          </div>
          <p className="human-hero__note"><span /> No generic quizzes. Just a clearer next step.</p>
        </div>

        <div className="human-hero__visual">
          <div className="human-hero__portrait">
            <img src={careerJourneyImage} alt="A professional reflecting on her next career move in a sunlit cafe" />
          </div>
          <div className="hero-paper-note">
            <span className="hero-paper-note__label">A small beginning</span>
            <strong>“I finally know what to explore next.”</strong>
            <i>— your career can start here</i>
          </div>
          <div className="hero-visual-caption" aria-hidden="true">Take the scenic route <span>↗</span></div>
        </div>
      </div>
    </section>
  );
}
