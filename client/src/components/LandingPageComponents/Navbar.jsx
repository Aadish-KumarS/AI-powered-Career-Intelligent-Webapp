import { useEffect, useRef, useState } from 'react';
import '../../styles/Landingpage Styles/Navbar.css';
import { FaRegUser } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa";
import { Link } from 'react-router-dom';
import SettingsDropdown from './SettingsDropdown';

const getStoredProfilePicture = () => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    return userData.profilePicture || userData.profileImage || '';
  } catch {
    return '';
  }
};

export default function Navbar({ variant = 'default' }) {
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState(getStoredProfilePicture);
  const servicesDropdownRef = useRef(null);
  const isSignedIn = Boolean(sessionStorage.getItem('authToken'));

  useEffect(() => {
    const syncProfilePicture = () => setProfilePicture(getStoredProfilePicture());
    window.addEventListener('storage', syncProfilePicture);
    window.addEventListener('profile-updated', syncProfilePicture);
    return () => {
      window.removeEventListener('storage', syncProfilePicture);
      window.removeEventListener('profile-updated', syncProfilePicture);
    };
  }, []);

  useEffect(() => {
    if (!showServicesDropdown) return undefined;

    const closeOnScroll = () => setShowServicesDropdown(false);
    const closeOnOutsidePointerDown = (event) => {
      if (!servicesDropdownRef.current?.contains(event.target)) {
        setShowServicesDropdown(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowServicesDropdown(false);
    };

    window.addEventListener('scroll', closeOnScroll, { passive: true });
    document.addEventListener('pointerdown', closeOnOutsidePointerDown);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('scroll', closeOnScroll);
      document.removeEventListener('pointerdown', closeOnOutsidePointerDown);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showServicesDropdown]);

  const toggleServicesDropdown = () => {
    setShowServicesDropdown(!showServicesDropdown);
  };

  return (
    <nav className={`navbar navbar--${variant}`}>
      <Link to='/'>
        <h1 className="logo">Right Track</h1>
      </Link>
      <ul className="nav-links">
        <li><a href="/#features">Features</a></li>
        <li><a href="/#about">About</a></li>
        <li className="services-dropdown" ref={servicesDropdownRef}>
          <button
            type="button"
            className="services-dropdown-toggle"
            onClick={toggleServicesDropdown}
            aria-expanded={showServicesDropdown}
            aria-haspopup="menu"
          >
            Services <FaAngleDown />
          </button>
          {showServicesDropdown && (
            <div className="dropdown-content" role="menu">
              <div className="dropdown-category">
                <h3>Macro Services</h3>
                <Link to="/services/career-guid/career-recommendation" onClick={() => setShowServicesDropdown(false)}>AI Career Guidance &amp; Recommendation</Link>
                <Link to="/services/career-guid/career-analysis" onClick={() => setShowServicesDropdown(false)}>AI Career Analysis</Link>
                <h3>Micro Services</h3>
                <Link to="/services/generate-roadmap" onClick={() => setShowServicesDropdown(false)}>AI Roadmap Generator </Link>
                <Link to="/services/exam-certification" onClick={() => setShowServicesDropdown(false)}>Exam Certification AI Recommondation</Link>
                <Link to="/services/learning-path" onClick={() => setShowServicesDropdown(false)}>Learning Progession Tracker</Link>
              </div>
            </div>
          )}
        </li>
      </ul>
      <div className='center'>
        <Link to={isSignedIn ? "/profile/user-profile" : "/signup"}>
          <div className='user-profile center' aria-label={isSignedIn ? "Open your profile" : "Create an account"}>
            {isSignedIn && profilePicture ? <img src={profilePicture} alt="" /> : <FaRegUser />}
          </div>
        </Link>
        <SettingsDropdown />
      </div>
    </nav>
  );
}
