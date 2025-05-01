import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Container, Badge, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaTools, FaBolt, FaHammer } from "react-icons/fa";
import axios from "axios";

interface Service {
  _id: string;
  name: string;
  description: string;
  image: string;
  category?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [displayedServices, setDisplayedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000";
  const UPLOADS_URL = `${API_BASE}/uploads`;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/services`);
        setServices(response.data.data);
        setDisplayedServices(response.data.data.slice(0, 3));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch services");
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (showAllServices) {
      setDisplayedServices(services);
    } else {
      setDisplayedServices(services.slice(0, 3));
    }
  }, [showAllServices, services]);

  const getServiceIcon = (category: string | undefined) => {
    switch (category?.toLowerCase()) {
      case "plumbing":
        return <FaTools className="text-primary" size={24} />;
      case "electrical":
        return <FaBolt className="text-warning" size={24} />;
      case "carpentry":
        return <FaHammer className="text-success" size={24} />;
      default:
        return <FaTools className="text-primary" size={24} />;
    }
  };

  const handleBookNow = (serviceName: string) => {
    // Store the selected service name in localStorage
    localStorage.setItem('selectedService', serviceName);
    navigate('/user/bookings');
  };

  if (loading) {
    return (
      <Container className="my-5 text-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading services...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Services</Alert.Heading>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Alert>
      </Container>
    );
  }

  if (services.length === 0) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="info">
          No services available at the moment.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold">Our Premium Services</h2>
        <p className="text-muted">Professional solutions for all your home service needs</p>
      </div>
      
      <Row className="g-4">
        {displayedServices.map((service) => (
          <Col key={service._id} lg={4} md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
              <div className="position-relative" style={{ height: "200px", overflow: "hidden" }}>
                <img
                  src={`${UPLOADS_URL}/${service.image}`}
                  alt={service.name}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                <div className="position-absolute top-0 start-0 p-3">
                  {service.isPopular && (
                    <Badge pill bg="danger" className="me-1">
                      Popular
                    </Badge>
                  )}
                  {service.isFeatured && (
                    <Badge pill bg="info" className="me-1">
                      Featured
                    </Badge>
                  )}
                  {service.isNew && (
                    <Badge pill bg="success">
                      New
                    </Badge>
                  )}
                </div>
              </div>
              
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    {getServiceIcon(service.category)}
                  </div>
                  <Card.Title className="mb-0 fs-4">{service.name}</Card.Title>
                </div>
                <Card.Text className="text-muted mb-4">{service.description}</Card.Text>
                
                <div className="mt-auto">
                  <Button 
                    onClick={() => handleBookNow(service.name)}
                    variant="primary" 
                    className="w-100 d-flex align-items-center justify-content-between py-2"
                  >
                    <span>Book Now</span>
                    <FaArrowRight />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <div className="text-center mt-5">
        {!showAllServices && services.length > 3 && (
          <>
            <p className="text-muted">Need something else? We offer many services</p>
            <Button 
              variant="outline-primary" 
              size="lg" 
              onClick={() => setShowAllServices(true)}
            >
              Explore All Services
            </Button>
          </>
        )}
      </div>
    </Container>
  );
};

export default ServicesPage;