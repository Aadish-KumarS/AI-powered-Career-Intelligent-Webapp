import { FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FiArrowUpRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../../styles/Landingpage Styles/Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <p className="site-footer__eyebrow">Your next chapter is waiting</p>
          <h2>Give your career<br /><em>somewhere to go.</em></h2>
        </div>
        <Link className="site-footer__cta" to="/signup">Start your story <FiArrowUpRight /></Link>
      </div>
      <div className="site-footer__middle">
        <div className="site-footer__brand"><Link to="/">Right Track<span>®</span></Link><p>A thoughtful companion for the work you want to grow into.</p></div>
        <nav aria-label="Footer navigation"><Link to="/">Home</Link><a href="#features">Tools</a><a href="#about">Our belief</a><Link to="/login">Sign in</Link></nav>
        <div className="site-footer__social"><a href="#instagram" aria-label="Instagram"><FaInstagram /></a><a href="#linkedin" aria-label="LinkedIn"><FaLinkedinIn /></a></div>
      </div>
      <div className="site-footer__bottom"><span>© {new Date().getFullYear()} Right Track</span><span>Made for the long way round.</span></div>
    </footer>
  );
}
