import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import "./Footer.css";

function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with: ${email}`);
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Hospital Info */}
            <div className="footer-section">
              <div className="footer-logo">
                <FaHeart className="logo-icon" />
                <h3>MediCare Hospital</h3>
              </div>
              <p className="footer-description">
                Providing compassionate healthcare with cutting-edge technology 
                and professional care for all patients. Your health is our priority.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <FaFacebook />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Doctors
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-section">
              <h4 className="footer-title">Our Services</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Emergency Care
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Surgery
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Diagnostics
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Pediatrics
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FaArrowRight className="link-icon" />
                    Cardiology
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div className="footer-section">
              <h4 className="footer-title">Stay Connected</h4>
              
              <div className="contact-info">
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>123 Health Street, Kisii, Kenya</span>
                </div>
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>+254 700 123 456</span>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>healthcare@mediCare.com</span>
                </div>
              </div>

              <div className="newsletter">
                <h5>Newsletter</h5>
                <p>Subscribe for health tips and updates</p>
                <form onSubmit={handleSubscribe} className="subscribe-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="subscribe-input"
                    required
                  />
                  <button type="submit" className="subscribe-btn">
                    <FaArrowRight />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    <p className="copyright text-center  fw-bold fs-5">
               For IT support  
              <span className="made-with p-1 m-2">
                <FaPhone className="heart-icon "  /> +254 793 786 072 
              </span>
              <span>
                <FaEnvelope className="heart-icon p-1 m-2 fs-3"  /> masangakevin60@gmail.com
              </span>
            </p>
      {/* Footer Bottom */}
      <div className="footer-bottom ">
        <div className="container">
          <div className="footer-bottom-content">
            
            <p className="copyright text-center">
              &copy; {new Date().getFullYear()} MediCare Hospital. All rights reserved.
              <span className="made-with">
                Made with <FaHeart className="heart-icon" /> for better healthcare
              </span>
            </p>
            
            <button onClick={scrollToTop} className="back-to-top" aria-label="Back to top">
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;