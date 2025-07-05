import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa";
import "../styles/styles.css";

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="container footer-content">
        <div className="footer-primary-info">
          <p>&copy; 2025 Mentora. All rights reserved.</p>
          <p className="designed-by">Designed by Emerald</p>
          <div className="social-links">
            <a href="#" target="_blank" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" target="_blank" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com/dev_boy09/" target="_blank" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://wa.me/2348162019056" target="_blank" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        <div className="newsletter-section">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest mentorship news and exclusive content.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" className="btn-subscribe">Subscribe</button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
