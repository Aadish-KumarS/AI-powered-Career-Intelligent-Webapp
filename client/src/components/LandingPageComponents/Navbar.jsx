import { gsap } from 'gsap';
import { useEffect, useState } from 'react';
import '../../styles/Landingpage Styles/Navbar.css';
import { FaRegUser } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa";
import { Link } from 'react-router-dom';
import SettingsDropdown from './SettingsDropdown';

export default function Navbar() {
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      '.fade-in', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, stagger: 0.2 }
    );
  }, []);

  const toggleServicesDropdown = () => {
    setShowServicesDropdown(!showServicesDropdown);
  };

  return (
    <nav className="navbar fade-in">
      <Link to='/'>
        <h1 className="logo">Right Track</h1>
      </Link>
      <ul className="nav-links">
        <li><a href="/#features">Features</a></li>
        <li><a href="/#about">About</a></li>
        <li className="services-dropdown">
          <div 
            className="services-dropdown-toggle"
            onClick={toggleServicesDropdown}
          >
            Services <FaAngleDown />
          </div>
          {showServicesDropdown && (
            <div className="dropdown-content">
              <div className="dropdown-category">
                <div className="dropdown-category">
                  <h3>Macro Services</h3>
                  <Link to="/services/career-guid/onboarding">AI Career Guidance & Recommondation</Link>
                  <Link to="/services/career-guid/career-analysis">AI Career Analysis</Link>
                </div>
                <h3>Micro Services</h3>
                <Link to="/services/generate-roadmap">AI Roadmap Generator </Link>
                <Link to="/services/exam-certification">Exam Certification AI Recommondation</Link>
                <Link to="/services/learning-path">Learning Progession Tracker</Link>
              </div>
            </div>
          )}
        </li>
      </ul>
      <div className='center'>
        <Link to="/signup">
          <div className='user-profile center'>
            <FaRegUser />
          </div>
        </Link>
        <SettingsDropdown />
      </div>
    </nav>
  );
}