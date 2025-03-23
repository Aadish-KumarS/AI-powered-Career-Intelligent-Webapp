import { useEffect } from 'react';
import gsap from 'gsap';
import '../../styles/Landingpage Styles/HeroSection.css';
import { FaArrowRight } from 'react-icons/fa';
import RocketIcon from '../../assets/rocket.svg?react';
import BrainIcon from '../../assets/brain.svg?react';
import heroImage from '../../assets/hero-illustration.jpeg';



export default function HeroSection() {
  useEffect(() => {
    gsap.fromTo(".hero-title span", 
      { opacity: 0, y: -30 },  
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }  
    );

    gsap.fromTo(".hero-subtitle", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }  
    );

    gsap.fromTo(".btn-primary", 
      {
        opacity: 0, 
        scale: 0.8, 
        y: 50           
      },  
      {
        opacity: 1, 
        scale: 1, 
        y: 0,          
        duration: 0.8, 
        delay: 0.6, 
        ease: "power3.out"
      }
    );
    
    gsap.fromTo(
      '.icon', 
      { opacity: 0, scale: 0.5, rotation: -180 }, 
      { 
        opacity: 1, 
        scale: 1, 
        rotation: 0, 
        duration: 1.5, 
        stagger: 0.3,
        ease: 'power3.out' 
      }
    );
  }, []);

  return (
    <section className="hero">
      <div className="abstract-bg">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
        <div className="shape shape4"></div>
        <div className="shape shape5"></div>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          <span><RocketIcon className="icon" /> </span>
          <span>Shape</span> 
          <span>Your</span> 
          <span>Future</span> 
          <span><BrainIcon className="icon" /> </span> 
          <span>with</span> <span>AI</span>
        </h1>
        <p className="hero-subtitle">An intelligent career roadmap built for your success, powered by AI.</p>
        <button className="btn btn-primary">Get Started <FaArrowRight /></button>
      </div>
      <div className="hero-image">
        <img src={heroImage} alt="Career Roadmap AI" />
      </div>
    </section>
  );
}