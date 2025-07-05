import { useEffect } from "react";
import AOS from 'aos';
import "aos/dist/aos.css";
import "../styles/styles.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      <Navbar />
      <main className="home-page">
        {/* Hero Section */}
        <section className="hero-section home-hero">
          <div className="hero-content" data-aos="fade-up">
            <h1>Find the Right Mentor, Every Step of the Way</h1>
            <p>Connect with experts, grow your skills, and succeed through meaningful mentorship.</p>
            <a href="/about" className="btn-primary pulse-effect">Explore Mentora</a>
          </div>
        </section>

        {/* Popular Tracks or Topics */}
        <section className="featured-categories-section section-padding text-center">
          <div className="container">
            <h2 data-aos="fade-up">Explore by Topics</h2>
            <div className="category-grid">
              <a href="/mentors?category=Tech" className="category-card" data-aos="fade-up" data-aos-delay="100">
                <img src="https://placehold.co/600x450/4CAF50/FFFFFF?text=Tech+Mentorship" alt="Tech" />
                <div className="category-info">
                  <h3>Tech</h3>
                  <p>Frontend, Backend, Mobile, AI & more.</p>
                </div>
              </a>
              <a href="/mentors?category=Design" className="category-card" data-aos="fade-up" data-aos-delay="200">
                <img src="https://placehold.co/600x450/FFC107/333?text=Design+Mentorship" alt="Design" />
                <div className="category-info">
                  <h3>Design</h3>
                  <p>UI/UX, Branding, Graphics & more.</p>
                </div>
              </a>
              <a href="/mentors?category=Business" className="category-card" data-aos="fade-up" data-aos-delay="300">
                <img src="https://placehold.co/600x450/2196F3/FFFFFF?text=Business+Mentorship" alt="Business" />
                <div className="category-info">
                  <h3>Business</h3>
                  <p>Entrepreneurship, Career Growth & more.</p>
                </div>
              </a>
            </div>
            <div className="view-all-btn" data-aos="fade-up" data-aos-delay="400">
              <a href="/mentors" className="btn-secondary">View All Mentors</a>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works-home section-padding bg-light text-center">
          <div className="container">
            <h2 data-aos="fade-up">How Mentora Works</h2>
            <div className="works-steps-grid">
              <div className="work-step-item" data-aos="fade-up" data-aos-delay="100">
                <div className="icon-circle"><i className="fas fa-search"></i></div>
                <h3>1. Browse Mentors</h3>
                <p>Find mentors by category, expertise, or interest area.</p>
              </div>
              <div className="work-step-item" data-aos="fade-up" data-aos-delay="200">
                <div className="icon-circle"><i className="fas fa-calendar-alt"></i></div>
                <h3>2. Book a Session</h3>
                <p>Schedule a session that fits your goals and timeline.</p>
              </div>
              <div className="work-step-item" data-aos="fade-up" data-aos-delay="300">
                <div className="icon-circle"><i className="fas fa-comments"></i></div>
                <h3>3. Learn & Grow</h3>
                <p>Engage, learn, ask questions, and grow with guidance.</p>
              </div>
            </div>
            <div className="view-all-btn" data-aos="fade-up" data-aos-delay="400">
              <a href="/services" className="btn-primary">See Full Guide</a>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section section-padding text-center">
          <div className="container">
            <h2 data-aos="fade-up">Start Your Mentorship Journey Today</h2>
            <p data-aos="fade-up" data-aos-delay="200">Mentorship changes lives. Take your next step now.</p>
            <a href="/register" className="btn-primary pulse-effect" data-aos="fade-up" data-aos-delay="300">Join as Mentee</a>
            <a href="/contact" className="btn-secondary" data-aos="fade-up" data-aos-delay="400">Become a Mentor</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;
