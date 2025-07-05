import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// Removed: import AOS from "aos";
// Removed: import "aos/dist/aos.css";
import "../styles/styles.css";

const HowItWorks: React.FC = () => {
  useEffect(() => {
    // Removed: AOS.init();
  }, []);

  return (
    <>
      <Navbar />
      <main className="services-page">
        {/* Hero Section */}
        <section className="hero-section services-hero">
          <div className="hero-content"> {/* Removed data-aos attribute */}
            <h1>Simple Steps to Success</h1>
            <p>Learn how easy it is to connect, learn, and grow with Mentora.</p>
          </div>
        </section>

        {/* For Mentees */}
        <section className="buyers-section section-padding">
          <div className="container">
            <h2>For Mentees</h2> {/* Removed data-aos attribute */}
            <div className="how-it-works-grid">
              {[
                { icon: "magnifying-glass", title: "1. Browse Mentors", desc: "Explore mentor profiles by expertise, ratings, or interests." },
                { icon: "user-check", title: "2. Book a Session", desc: "Schedule 1:1 sessions based on your availability and goals." },
                { icon: "comments", title: "3. Connect Directly", desc: "Join a video or chat session with your mentor — no third-party tools required." },
                { icon: "graduation-cap", title: "4. Grow Your Skills", desc: "Take notes, get feedback, and track your personal growth." },
              ].map((step, ) => (
                <div className="works-step-item" key={step.title}> {/* Removed data-aos attribute */}
                  <div className="icon-circle"><i className={`fas fa-${step.icon}`}></i></div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Mentors */}
        <section className="sellers-section section-padding bg-light">
          <div className="container">
            <h2>For Mentors</h2> {/* Removed data-aos attribute */}
            <div className="how-it-works-grid">
              {[
                { icon: "user-plus", title: "1. Create Your Profile", desc: "Join as a mentor and list your areas of expertise and availability." },
                { icon: "upload", title: "2. Accept Mentees", desc: "Review and approve mentee session requests through your dashboard." },
                { icon: "chart-line", title: "3. Share Knowledge", desc: "Host live sessions, share insights, and help mentees grow." },
                { icon: "trophy", title: "4. Track Impact", desc: "Build your reputation and get rated by those you help." },
              ].map((step, ) => (
                <div className="works-step-item" key={step.title}> {/* Removed data-aos attribute */}
                  <div className="icon-circle"><i className={`fas fa-${step.icon}`}></i></div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section section-padding">
          <div className="container text-center">
            <h2>Ready to Get Started?</h2> {/* Removed data-aos attribute */}
            <p> {/* Removed data-aos attribute */}
              Whether you want to learn or guide others — Mentora is for you.
            </p>
            <a href="/login" className="btn-primary pulse-effect"> {/* Removed data-aos attribute */}
              Browse Mentors
            </a>
            <a href="/register" className="btn-secondary"> {/* Removed data-aos attribute */}
              Become a Mentor
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default HowItWorks;
