import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import "../../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>RightTrack<span>.AI</span></h2>
          <p>Your AI-powered career navigator.</p>
        </div>

        <ul className="footer-links">
          <li><a href="#">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#">How It Works</a></li>
          <li><a href="#">Contact</a></li>
        </ul>

        <div className="footer-social">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaLinkedinIn /></a>
          <a href="#"><FaInstagram /></a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} RightTrack.AI. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
