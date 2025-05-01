import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Container, Spinner } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";
import styles from "./Home.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Typewriter messages
const typewriterMessages = [
  "Quality Service At Your Doorstep • ",
  "Your Trusted Home Service Partner • ",
  "Experts In All Home Repairs • ",
  "Satisfaction Guaranteed • ",
  "24/7 Emergency Services Available • "
];

const CarouselItem = ({ service, style, isActive }) => {
  const [loaded, setLoaded] = useState(false);
  const API_BASE = "http://localhost:5000";
  const UPLOADS_URL = `${API_BASE}/uploads`;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${UPLOADS_URL}/${imagePath}`;
  };

  return (
    <div 
      className={styles.carouselItem}
      style={{
        transform: `translateX(${style.x}px) scale(${style.scale})`,
        opacity: style.opacity,
        zIndex: style.zIndex,
      }}
    >
      <Card className={styles.carouselCard}>
        <div style={{ position: 'relative', height: '180px' }}>
          <img
            src={getImageUrl(service.image)}
            alt={service.name}
            className={styles.carouselImage}
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
          {!loaded && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Spinner animation="border" variant="primary" />
            </div>
          )}
        </div>
        <Card.Body className="text-center">
          <Card.Title>{service.name}</Card.Title>
          <Card.Text>{service.description}</Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};

const TypewriterText = () => {
  const [displayText, setDisplayText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingSpeed = isDeleting ? 30 : 80;
    const currentMessage = typewriterMessages[messageIndex];

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentMessage.length) {
        setDisplayText(currentMessage.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(currentMessage.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else {
        setIsDeleting(!isDeleting);
        if (!isDeleting) {
          setTimeout(() => {
            setMessageIndex((messageIndex + 1) % typewriterMessages.length);
          }, 1200);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, messageIndex]);

  return (
    <div className={styles.typewriterContainer}>
      <h1 className={styles.typewriterText}>
        {displayText}
        <span className={styles.cursor} />
      </h1>
    </div>
  );
};

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/services");
        setServices(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Auto-rotation with cleanup
  useEffect(() => {
    if (services.length > 0) {
      autoRotateRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % services.length);
      }, 5000);
      
      return () => {
        if (autoRotateRef.current) clearInterval(autoRotateRef.current);
      };
    }
  }, [services]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % services.length);
    resetAutoRotation();
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + services.length) % services.length);
    resetAutoRotation();
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    resetAutoRotation();
  };

  const resetAutoRotation = () => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % services.length);
    }, 5000);
  };

  // Get positions for all cards
  const getCardPositions = () => {
    const positions = [];
    const centerIndex = currentIndex;
    
    // Positions for 5 visible cards (center, left/right 2 each)
    for (let i = -2; i <= 2; i++) {
      let index = centerIndex + i;
      if (index < 0) index += services.length;
      if (index >= services.length) index -= services.length;
      
      // Calculate styles based on position
      let style;
      switch (i) {
        case -2: // Far left
          style = { scale: 0.7, opacity: 0.5, zIndex: 1, x: -360 };
          break;
        case -1: // Left
          style = { scale: 0.85, opacity: 0.7, zIndex: 2, x: -180 };
          break;
        case 0: // Center
          style = { scale: 1, opacity: 1, zIndex: 3, x: 0 };
          break;
        case 1: // Right
          style = { scale: 0.85, opacity: 0.7, zIndex: 2, x: 180 };
          break;
        case 2: // Far right
          style = { scale: 0.7, opacity: 0.5, zIndex: 1, x: 360 };
          break;
        default:
          style = { scale: 0.7, opacity: 0, zIndex: 0, x: 0 };
      }
      
      positions.push({ index, style });
    }
    
    return positions;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center">
        Error loading services: {error}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="alert alert-info text-center">
        No services available at the moment.
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      <Container className="my-5 py-4 position-relative">
        {/* Enhanced Typewriter Text */}
        <TypewriterText />
        
        <div className={styles.carouselWrapper}>
          {/* Left Arrow */}
          <button 
            onClick={handlePrev}
            className={`${styles.carouselArrow} ${styles.leftArrow}`}
            aria-label="Previous service"
          >
            <FaChevronLeft size={24} />
          </button>

          <div className={styles.carouselTrack}>
            {getCardPositions().map(({ index, style }) => {
              const service = services[index];
              const isActive = style.x === 0; // Center card is active
              
              return (
                <CarouselItem 
                  key={`${service._id}-${index}`}
                  service={service}
                  style={style}
                  isActive={isActive}
                />
              );
            })}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={handleNext}
            className={`${styles.carouselArrow} ${styles.rightArrow}`}
            aria-label="Next service"
          >
            <FaChevronRight size={24} />
          </button>
        </div>

        {/* Indicator dots */}
        <div className={styles.indicators}>
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`${styles.indicatorDot} ${
                index === currentIndex ? 'active' : ''
              }`}
              aria-label={`Go to service ${index + 1}`}
            />
          ))}
        </div>
      </Container>
    </div>
  );
};

export default HomePage;