import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

interface Service {
  _id: string;
  name: string;
  description: string;
  image: string;
  category?: string;
}

interface Location {
  name: string;
  distance: number;
}

interface BookingData {
  service: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  distance: number;
  date: string;
  time: string;
  notes: string;
  serviceName: string;
}

const LOCATIONS: Location[] = [
  { name: "Parvathipuram", distance: 6 },
  { name: "Muttom", distance: 16 },
  { name: "Pazhavilai", distance: 8 },
  { name: "Mangavilai", distance: 9 },
  { name: "Kanyakumari", distance: 18 },
  { name: "Karungal", distance: 23 },
  { name: "Nagercoil Junction", distance: 3 },
  { name: "Nagercoil Town", distance: 2 },
  { name: "Edaicode", distance: 25 },
  { name: "Arumanai", distance: 30 },
  { name: "Kulasekaram", distance: 35 },
  { name: "Thuckalay", distance: 15 },
  { name: "Marthandam", distance: 25 },
  { name: "Kuzhithurai", distance: 27 },
  { name: "Colachel", distance: 20 },
  { name: "Thiruvattaru", distance: 30 },
  { name: "Boothapandi", distance: 10 },
  { name: "Eraniel", distance: 15 },
  { name: "Suchindram", distance: 7 },
  { name: "Rajakkamangalam", distance: 12 },
  { name: "Manavalakurichi", distance: 18 },
  { name: "Thingalnagar", distance: 22 }
];

const calculateServiceCharge = (distance: number): number => {
  if (distance <= 6) return 200;
  if (distance <= 10) return 300;
  if (distance <= 20) return 400;
  return 500; // for distances above 20km
};

const BookingPage = ({ onBack }) => {
  const { serviceId } = useParams();
  const [formData, setFormData] = useState<BookingData>({
    service: serviceId || '',
    name: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    distance: 0,
    date: '',
    time: '',
    notes: '',
    serviceName: ''
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [calculatedCharge, setCalculatedCharge] = useState(0);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const userResponse = await axios.get(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userResponse.data.success) {
          const userData = userResponse.data.user;
          setFormData(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || ''
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('userToken');
          navigate('/login');
        }
      } finally {
        setUserLoading(false);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/services`);
        setServices(response.data.data);
        
        if (serviceId) {
          const selectedService = response.data.data.find(
            (service: Service) => service._id === serviceId
          );
          if (!selectedService) {
            setError("The selected service does not exist");
          } else {
            setFormData(prev => ({
              ...prev,
              serviceName: selectedService.name
            }));
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch services");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchServices();
  }, [navigate, serviceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'location') {
      const selectedLocation = LOCATIONS.find(loc => loc.name === value);
      if (selectedLocation) {
        const charge = calculateServiceCharge(selectedLocation.distance);
        setCalculatedCharge(charge);
        setFormData(prev => ({
          ...prev,
          location: selectedLocation.name,
          distance: selectedLocation.distance
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'service') {
      const selectedService = services.find(service => service._id === value);
      setFormData(prev => ({
        ...prev,
        serviceName: selectedService?.name || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!formData.service || !formData.location || !formData.date || !formData.time) {
        setError('Please fill all required fields');
        setSubmitLoading(false);
        return;
      }

      // Validate date is in the future
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError('Please select a future date');
        setSubmitLoading(false);
        return;
      }

      const bookingData = {
        ...formData,
        serviceCharge: calculatedCharge,
        specialInstructions: formData.notes
      };

      const response = await axios.post(`${API_BASE}/api/bookings`, bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccessMessage(`Booking confirmed for ${formData.serviceName} service! Total charge: ₹${calculatedCharge}`);
        // Reset form but keep user info
        setFormData(prev => ({
          ...prev,
          service: serviceId || '',
          address: '',
          location: '',
          distance: 0,
          date: '',
          time: '',
          notes: '',
          serviceName: serviceId ? prev.serviceName : ''
        }));
        setCalculatedCharge(0);
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to create booking. Please try again."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading || userLoading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Book a Service</h2>
          {onBack && (
            <Button variant="outline-secondary" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
        
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible className="mb-4">
            {successMessage}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="service" className="mb-3">
                <Form.Label>Service Type</Form.Label>
                <Form.Select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  disabled={!!serviceId}
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="phone" className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="location" className="mb-3">
                <Form.Label>Location*</Form.Label>
                <Form.Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your location</option>
                  {LOCATIONS.map(location => (
                    <option key={location.name} value={location.name}>
                      {location.name} ({location.distance} km)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="address" className="mb-3">
                <Form.Label>Full Address*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Service Charge</Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  value={calculatedCharge ? `₹${calculatedCharge}` : 'Select location first'}
                  className="fw-bold"
                />
                <small className="text-muted">
                  {formData.distance > 0 && `Distance: ${formData.distance} km`}
                </small>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="date" className="mb-3">
                <Form.Label>Service Date*</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="time" className="mb-3">
                <Form.Label>Preferred Time*</Form.Label>
                <Form.Select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select time</option>
                  <option value="9:00 AM - 12:00 PM">Morning (9AM-12PM)</option>
                  <option value="12:00 PM - 3:00 PM">Afternoon (12PM-3PM)</option>
                  <option value="3:00 PM - 6:00 PM">Evening (3PM-6PM)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4" controlId="notes">
            <Form.Label>Special Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special requirements or notes for the service provider"
            />
          </Form.Group>

          <div className="text-center">
            <Button 
              variant="primary" 
              type="submit"
              style={{ padding: '10px 30px', fontWeight: '600' }}
              disabled={!formData.service || !formData.location || submitLoading}
            >
              {submitLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Processing...</span>
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default BookingPage;