// src/pages/About.tsx
import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/styles.css";
import AOS from "aos";
import "aos/dist/aos.css";

const About: React.FC = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <Navbar />
      <main className="about-page">
        <section className="hero-section about-hero">
          <div className="hero-content" data-aos="fade-up" data-aos-duration="1000">
            <h1>Empowering Mentorship Connections</h1>
            <p>Our mission is to connect learners and mentors for transformative career growth.</p>
          </div>
        </section>

        <section className="story-section section-padding">
          <div className="container">
            <h2 data-aos="fade-up" data-aos-duration="800">Our Journey</h2>
            <div className="story-content">
              <div className="story-text" data-aos="fade-right" data-aos-duration="1000">
                <p>
                  Mentora was born out of the desire to bridge the gap between aspiring professionals and experienced mentors.
                  We recognized how powerful mentorship can be and wanted to create a platform where connections are effortless.
                </p>
                <p>
                  From humble beginnings to a fast-growing platform, we’ve stayed true to our goal: to build a supportive community where growth thrives.
                </p>
                <p>
                  We’re committed to continuous innovation, ease of access, and making mentorship a rewarding experience for all.
                </p>
              </div>
              <div className="story-image" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="200">
                <img src="https://placehold.co/800x600/4CAF50/FFFFFF?text=Our+Story" alt="Mentorship Story" />
              </div>
            </div>
          </div>
        </section>

        <section className="values-section section-padding bg-light">
          <div className="container">
            <h2 data-aos="fade-up" data-aos-duration="800">Our Core Values</h2>
            <div className="values-grid">
              {[
                { icon: "fa-handshake", title: "Connection", text: "Building strong bonds between mentors and mentees." },
                { icon: "fa-star", title: "Excellence", text: "Upholding high standards in mentorship and learning." },
                { icon: "fa-lightbulb", title: "Growth", text: "Encouraging innovation and lifelong development." },
                { icon: "fa-shield-alt", title: "Trust", text: "Creating a safe and transparent mentoring environment." }
              ].map((val, i) => (
                <div key={val.title} className="value-item" data-aos="fade-up" data-aos-duration="1000" data-aos-delay={`${(i + 1) * 100}`}>
                  <div className="icon-box"><i className={`fas ${val.icon}`}></i></div>
                  <h3>{val.title}</h3>
                  <p>{val.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="team-section section-padding">
          <div className="container">
            <h2 data-aos="fade-up" data-aos-duration="800">Meet the Team (Coming Soon!)</h2>
            <p data-aos="fade-up" data-aos-duration="900" data-aos-delay="100">
              We are a passionate team building the future of mentorship.
            </p>
            <div className="team-grid">
              <div className="team-member" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                <img src="https://placehold.co/150x150/FFC107/333333?text=Team+Member" alt="Founder" className="round-image" />
                <h3>Founder</h3>
                <p className="role">Visionary behind Mentora</p>
                <p className="bio">Driven by a belief in community-led learning and the power of guidance.</p>
              </div>
              <div className="team-member" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                <img src="https://placehold.co/150x150/4CAF50/FFFFFF?text=Team+Member" alt="Team" className="round-image" />
                <h3>Our Team</h3>
                <p className="role">Passionate Builders</p>
                <p className="bio">Focused on designing tools that make meaningful mentorship simple and accessible.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section section-padding text-center">
          <div className="container">
            <h2 data-aos="fade-up" data-aos-duration="1000">Ready to Start Your Mentorship Journey?</h2>
            <p data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
              Whether you're a mentor or mentee, your growth starts here.
            </p>
            <a href="/register" className="btn-primary pulse-effect" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
              Join Mentora
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
