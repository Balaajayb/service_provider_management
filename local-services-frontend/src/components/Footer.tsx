import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <footer className="bg-dark text-white py-4">
      <Container>
        <Row>
          {/* About Section */}
          <Col md={4} className="mb-4">
            <h5 className="mb-3 text-primary">ServicePlatform</h5>
            <p className="text-white-50">
              Your one-stop solution for all service needs.
            </p>
          </Col>

          {/* Quick Links Section - Now clearly visible */}
          <Col md={4} className="mb-4">
            <h5 className="mb-3 text-primary">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/user/home" className="text-white text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/user/services" className="text-white text-decoration-none">
                  Services
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/user/bookings" className="text-white text-decoration-none">
                  Bookings
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/user/profile" className="text-white text-decoration-none">
                  Profile
                </Link>
              </li>
            </ul>
          </Col>

          {/* Contact Section */}
          <Col md={4} className="mb-4">
            <h5 className="mb-3 text-primary">Contact Us</h5>
            <ul className="list-unstyled text-white">
              <li className="mb-2">
                <FaEnvelope className="me-2 text-primary" />
                support@serviceplatform.com
              </li>
              <li className="mb-3">
                <FaPhone className="me-2 text-primary" />
                +1 234 567 890
              </li>
            </ul>

            {/* Social Media Links */}
            <div>
              <h5 className="mb-2 text-primary">Follow Us</h5>
              <div className="d-flex gap-3">
                <a href="https://facebook.com" className="text-white">
                  <FaFacebook size={20} />
                </a>
                <a href="https://twitter.com" className="text-white">
                  <FaTwitter size={20} />
                </a>
                <a href="https://instagram.com" className="text-white">
                  <FaInstagram size={20} />
                </a>
              </div>
            </div>
          </Col>
        </Row>

        {/* Copyright Section */}
        <Row className="mt-3 pt-3 border-top border-secondary">
          <Col className="text-center text-white-50">
            &copy; {currentYear} Service Platform. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;