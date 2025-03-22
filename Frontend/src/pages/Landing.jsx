import Navbar from '../components/LandingPageComponents/Navbar';
import HeroSection from '../components/LandingPageComponents/Hero';
import Features from '../components/LandingPageComponents/Features';
import About from '../components/LandingPageComponents/About';
// import HowItWorks from '../components/HowItWorks';
import Footer from '../components/LandingPageComponents/Footer';
import '../styles/landingPage.css';

export default function LandingPage() {

    return (
        <div className='landing-page'>
            <Navbar />
            <HeroSection />
            <Features />
            <About />
            {/* <HowItWorks /> */}
            <Footer />
        </div>
    );
}
