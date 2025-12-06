import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight, FaHospital, FaShieldAlt } from "react-icons/fa";
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
    <footer className="footer bg-light">
      {/* Main Footer Content */}
      <div className="footer-main py-5">
        <div className="container">
          <div className="row g-4">
            {/* Hospital Info */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-section">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <FaHospital className="logo-icon text-primary" />
                  <div>
                    <h3 className="hospital-title mb-0 text-dark">MediCare Hospital</h3>
                    <p className="text-muted mb-0 small">Advanced Healthcare System</p>
                  </div>
                </div>
                <p className="footer-description text-secondary mb-4">
                  Providing compassionate healthcare with cutting-edge technology 
                  and professional care for all patients. Your health is our priority.
                </p>
                <div className="social-links d-flex gap-2">
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
            </div>

            {/* Quick Links */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-section">
                <h4 className="footer-title text-dark mb-4">Quick Links</h4>
                <ul className="footer-links list-unstyled">
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Home
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      About Us
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Services
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Doctors
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Services */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-section">
                <h4 className="footer-title text-dark mb-4">Our Services</h4>
                <ul className="footer-links list-unstyled">
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Emergency Care
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Surgery
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Diagnostics
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Pediatrics
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="footer-link text-decoration-none">
                      <FaArrowRight className="link-icon me-2 text-primary" />
                      Cardiology
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact & Newsletter */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-section">
                <h4 className="footer-title text-dark mb-4">Stay Connected</h4>
                
                <div className="contact-info mb-4">
                  <div className="contact-item d-flex align-items-center gap-2 mb-3">
                    <FaMapMarkerAlt className="contact-icon text-primary" />
                    <span className="text-secondary small">123 Health Street, Kisii, Kenya</span>
                  </div>
                  <div className="contact-item d-flex align-items-center gap-2 mb-3">
                    <FaPhone className="contact-icon text-primary" />
                    <span className="text-secondary small">+254 700 123 456</span>
                  </div>
                  <div className="contact-item d-flex align-items-center gap-2 mb-3">
                    <FaEnvelope className="contact-icon text-primary" />
                    <span className="text-secondary small">healthcare@mediCare.com</span>
                  </div>
                </div>

                <div className="newsletter bg-white border border-light-subtle rounded p-3 shadow-sm">
                  <h5 className="text-dark mb-2">Newsletter</h5>
                  <p className="text-secondary small mb-3">Subscribe for health tips and updates</p>
                  <form onSubmit={handleSubscribe} className="d-flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control form-control-sm"
                      required
                    />
                    <button type="submit" className="btn btn-primary btn-sm">
                      <FaArrowRight />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* IT Support Section */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="it-support-card bg-primary bg-opacity-10 border border-primary rounded p-4 mt-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center gap-3">
                      <FaShieldAlt className="text-primary fs-4" />
                      <div>
                        <h5 className="text-dark mb-1">24/7 IT Support</h5>
                        <p className="text-secondary small mb-0">Technical assistance for hospital systems and software</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="mt-3 mt-md-0">
                      <div className="d-flex align-items-center justify-content-md-end gap-2 mb-2">
                        <FaPhone className="text-primary" />
                        <span className="text-dark fw-semibold">+254 793 786 072</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-md-end gap-2">
                        <FaEnvelope className="text-primary" />
                        <span className="text-secondary small">masangakevin60@gmail.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom py-3 bg-light-subtle border-top">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <p className="copyright text-secondary mb-2 mb-md-0">
                &copy; {new Date().getFullYear()} MediCare Hospital. All rights reserved.
                <span className="made-with ms-2 d-inline-flex align-items-center">
                  Made with <FaHeart className="heart-icon mx-1" /> for better healthcare
                </span>
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <button 
                onClick={scrollToTop} 
                className="btn btn-outline-primary btn-sm rounded-circle"
                aria-label="Back to top"
              >
                <FaArrowRight className="rotate-270" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;