import React, { useRef, useState, useEffect } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';
import { FiLogOut, FiEdit, FiLock } from 'react-icons/fi';
import { gsap } from 'gsap';
import '../../styles/Landingpage Styles/SettingsDropdown.css';
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from '../../utils/formHanderls';

const SettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Toggle Dropdown
  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  // Open Dropdown with Animation
  const openDropdown = () => {
    if (dropdownRef.current) {
      setIsOpen(true);
      gsap.fromTo(
        dropdownRef.current,
        { y: -20, opacity: 0, display: 'none' },
        { y: 0, opacity: 1, display: 'block', duration: 0.3, ease: 'power2.out' }
      );
    }
  };

  // Close Dropdown with Animation
  const closeDropdown = () => {
    if (dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setIsOpen(false),
      });
    }
  };

  // Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="settings-container">
      <button 
        ref={buttonRef}
        className={`settings-btn ${isOpen ? 'settings-btn-active' : ''}`}
        onClick={toggleDropdown}
      >
        <IoSettingsOutline className="settings-icon" />
      </button>

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        className={`settings-dropdown ${isOpen ? 'settings-dropdown-visible' : 'settings-dropdown-hidden'}`}
      >
        <div className="dropdown-menu">
          <Link to="/profile/edit-profile" className="dropdown-item">
            <FiEdit className="dropdown-icon" />
            <span>Edit Profile</span>
          </Link>
          <Link to="/forgot-password" className="dropdown-item">
            <FiLock className="dropdown-icon" />
            <span>Forgot Password</span>
          </Link>
          <div onClick={() => logoutUser(navigate)} className="dropdown-item">
            <FiLogOut className="dropdown-icon" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDropdown;
