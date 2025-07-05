// src/pages/Contact.tsx
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/styles.css';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Contact: React.FC = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <Navbar />
      <main className="contact-page">
        {/* Hero */}
        <section className="hero-section contact-hero">
          <div className="hero-content" data-aos="fade-up" data-aos-duration="1000">
            <h1>Get in Touch with Us</h1>
            <p>We're here to help! Reach out for support, partnerships, or general inquiries.</p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-details-section section-padding">
          <div className="container contact-grid-layout">
            {/* Form */}
            <div className="contact-form-container" data-aos="fade-right" data-aos-duration="1000">
              <h3>Send Us a Message</h3>
              <form className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name:</label>
                  <input type="text" id="name" placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Your Email:</label>
                  <input type="email" id="email" placeholder="john.doe@example.com" required />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject:</label>
                  <input type="text" id="subject" placeholder="Inquiry about mentorship" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Your Message:</label>
                  <textarea id="message" rows={6} placeholder="Your message..." required />
                </div>
                <button type="submit" className="btn-primary">Send Message</button>
              </form>
            </div>

            {/* Info */}
            <div className="contact-info-container" data-aos="fade-left" data-aos-duration="1000">
              <h3>Contact Information</h3>
              <div className="contact-info-block">
                <div className="contact-info-item">
                  <FaEnvelope className="contact-icon" />
                  <span>Email:</span> <a href="mailto:support@mentora.com">support@mentora.com</a>
                </div>
                <div className="contact-info-item">
                  <FaPhoneAlt className="contact-icon" />
                  <span>Phone:</span> <a href="tel:+2348162019056">+234 816 201 9056</a>
                </div>
                <div className="contact-info-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>Address:</span> <address>Mentora HQ, Ibadan, Nigeria</address>
                </div>
              </div>
              <div className="social-links-contact">
                <h4>Follow Us:</h4>
                <div className="social-icons-list">
                  <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                  <a href="#" aria-label="Twitter"><FaTwitter /></a>
                  <a href="https://www.instagram.com/dev_boy09/" target="_blank" aria-label="Instagram"><FaInstagram /></a>
                  <a href="https://wa.me/2348162019056" target="_blank" aria-label="WhatsApp"><FaWhatsapp /></a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
