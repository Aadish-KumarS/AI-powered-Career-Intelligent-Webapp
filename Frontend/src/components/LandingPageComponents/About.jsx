import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import InnovationIcon from '../../assets/innovation.svg?react';
import GrowthIcon from '../../assets/growth.svg?react';
import '../../styles/About.css';
import aboutImg from '../../assets/about-img.png'

export default function About() {
  const aboutRef = useRef(null);

  useEffect(() => {
    const aboutSection = aboutRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              ".about-title span",
              { opacity: 0, y: -20 },
              { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
            );

            gsap.fromTo(
              ".about-list",
              { opacity: 0, y: 50 },
              { opacity: 1, y: 20, duration: 1, delay: 0.5, ease: "power3.out" }
            );

            gsap.fromTo(
              ".about-img",
              {
                opacity: 0,
                y: 200,
              },
              {
                opacity: 0.25,
                y: 0,
                duration: 1,
                ease: 'power3.out',
              }
            );

          } else {
            gsap.set(".about-title span", { opacity: 0, y: -20 });
            gsap.set(".about-list", { opacity: 0, y: 130 });
            gsap.set(
              ".about-img",
              {
                opacity: 0,
                y: 100,
                duration: 0.8,
                ease: 'power3.in',
              }
            );
          }
        });
      },
      { threshold: 0.3 } 
    );

    observer.observe(aboutSection);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="about column" id='about' ref={aboutRef}>
      <h1>About Us</h1>
      <div className="about-content">

        <div className="about-img">
          <img src={aboutImg} alt="about-us-img" />
        </div>

        <h2 className="about-title">
          <span>Empowering</span> 
          <span>Your</span> 
          <span>Career</span> 
          <span><GrowthIcon className="icon" /> </span>
          <span>with</span> 
          <span>AI</span>
        </h2>

        <div class="about-description">

          <p>
          Our intelligent platform tailors a personalized career roadmap just for you, helping you discover the best opportunities aligned with your skills, passions, and goals. Whether you're a student, a job seeker, or a professional looking to upskill, our AI-powered system ensures you’re always on the right path to success.
          </p>

          
          <div class="about-list">
            <div class="about-item">
              <span class="icon">🚀</span>
              <span>Navigate Your Career with Precision:</span> <br />  Gain step-by-step guidance to reach your dream career, with insights on required skills, courses, certifications, and job prospects.
            </div>
            <div class="about-item">
              <span class="icon">📍</span>
              <span>Stay Ahead of the Competition: </span> <br />Never miss out on exam dates, scholarship opportunities, or industry trends —our real-time updates keep you informed and prepared.
            </div>
            <div class="about-item">
              <span class="icon">🎯</span>
              <span>Your Success, Our Mission: </span><br /> We provide a seamless and interactive experience, using cutting-edge technology to make career planning engaging, effective, and stress-free.
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
