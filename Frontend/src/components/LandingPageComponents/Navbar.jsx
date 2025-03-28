import { gsap } from 'gsap';
import {  useEffect } from 'react';
import '../../styles/Landingpage Styles/Navbar.css';
import { FaRegUser } from "react-icons/fa6";
import { Link } from 'react-router-dom';


export default function Navbar() {

  useEffect(() => {
    gsap.fromTo(
      '.fade-in', 
      { opacity: 0, y: 20 },  
      { opacity: 1, y: 0, duration: 1, stagger: 0.2 }  
    );
    }, []);

  return (
    <nav className="navbar fade-in">
      <h1 className="logo">Right Track</h1>
      <ul className="nav-links">
        <li><a href="/#features">Features</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/#how-it-works">How It Works</a></li>
        <li><a href="/#target-users">Users</a></li>
      </ul>
      <div className='center'>
        <Link to="/signup"> 
          <div className='user-profile center'>
            <FaRegUser />
          </div>
        </Link>
        <button className="settings-btn">
          <span className="settings-icon"></span>
        </button>
      </div>
    </nav>
  );
}