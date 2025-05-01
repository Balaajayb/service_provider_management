import React, { useState, useEffect } from "react";
import { 
  Table, Button, Container, Spinner, Alert, Badge, Card, 
  Modal, Form, Row, Col, FloatingLabel, ListGroup
} from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { 
  FaCalendarAlt, FaInfoCircle, FaUser, FaMoneyBillWave, 
  FaStar, FaQrcode, FaCreditCard, FaMoneyCheckAlt, FaRupeeSign, FaTimes 
} from "react-icons/fa";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

interface Booking {
  _id: string;
  service: {
    _id: string;
    name: string;
  };
  serviceName: string;
  date: string;
  time: string;
  status: "pending" | "assigned" | "on_the_way" | "completed" | "cancelled";
  address: string;
  specialInstructions: string;
  assignedWorker?: {
    _id: string;
    name: string;
    phone: string;
    service?: {
      name: string;
    };
  };
  serviceCharge?: number;
  materialCharge?: number;
  materialDetails?: Array<{
    name: string;
    amount: number;
  }>;
  totalAmount?: number;
  payment?: {
    status: "pending" | "paid" | "failed";
    method?: string;
    transactionId?: string;
    date?: string;
  };
  rating?: {
    stars: number;
    review?: string;
  };
}

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAmountDetailsModal, setShowAmountDetailsModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("online");
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`${API_BASE}/bookings/my-bookings`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setBookings(response.data.data);
        setLoading(false);
      } catch (err) {
        const errorMessage = axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : "Failed to load bookings";
        
        setError(errorMessage);
        setLoading(false);
        
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('userToken');
          window.location.href = '/login';
        }
      }
    };

    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned": return <Badge bg="info" className="px-3 py-2">Assigned</Badge>;
      case "on_the_way": return <Badge bg="primary" className="px-3 py-2">On The Way</Badge>;
      case "pending": return <Badge bg="warning" text="dark" className="px-3 py-2">Pending</Badge>;
      case "completed": return <Badge bg="success" className="px-3 py-2">Completed</Badge>;
      case "cancelled": return <Badge bg="danger" className="px-3 py-2">Cancelled</Badge>;
      default: return <Badge bg="light" text="dark" className="px-3 py-2">Unknown</Badge>;
    }
  };

  const getPaymentBadge = (payment?: { status: string, method?: string }) => {
    if (!payment) return <Badge bg="light" text="dark" className="px-3 py-2">Not Paid</Badge>;
    
    switch (payment.status) {
      case "paid": 
        return (
          <Badge bg="success" className="px-3 py-2">
            Paid {payment.method && `(${payment.method})`}
          </Badge>
        );
      case "pending": return <Badge bg="warning" text="dark" className="px-3 py-2">Pending</Badge>;
      case "failed": return <Badge bg="danger" className="px-3 py-2">Failed</Badge>;
      default: return <Badge bg="light" text="dark" className="px-3 py-2">Not Paid</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const handlePaymentClick = (booking: Booking) => {
    setCurrentBooking(booking);
    setShowPaymentModal(true);
  };

  const handleReviewClick = (booking: Booking) => {
    setCurrentBooking(booking);
    setShowReviewModal(true);
  };

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelConfirm(true);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
  
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication required');
      }
  
      const response = await axios.put(
        `${API_BASE}/bookings/${bookingToCancel}/cancel`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
  
      setBookings(bookings.map(b => 
        b._id === bookingToCancel ? response.data.data : b
      ));
      setShowCancelConfirm(false);
      setBookingToCancel(null);
    } catch (err) {
      setError(
        axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : "Failed to cancel booking"
      );
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !currentBooking) {
        throw new Error('Authentication required');
      }

      const paymentData = {
        paymentMethod,
        status: paymentMethod === 'cash' ? 'paid' : 'pending',
        transactionId: paymentMethod === 'online' ? transactionId : 'CASH-' + Date.now()
      };

      const response = await axios.post(
        `${API_BASE}/bookings/${currentBooking._id}/pay`,
        paymentData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      setBookings(bookings.map(b => 
        b._id === currentBooking._id ? response.data.data.booking : b
      ));

      setShowPaymentModal(false);
      setPaymentMethod('online');
      setTransactionId('');
    } catch (err) {
      setError(
        axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : "Payment failed"
      );
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !currentBooking) {
        throw new Error('Authentication required');
      }

      await axios.post(
        `${API_BASE}/bookings/${currentBooking._id}/rate`,
        { stars: rating, review },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      const response = await axios.get(`${API_BASE}/bookings/my-bookings`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setBookings(response.data.data);
      setShowReviewModal(false);
      setRating(0);
      setReview('');
    } catch (err) {
      setError(
        axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : "Failed to submit review"
      );
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        size={14}
        color={i < rating ? "#ffc107" : "#e4e5e9"}
      />
    ));
  };

  const canCancelBooking = (booking: Booking) => {
    return booking.status === 'pending' || booking.status === 'assigned';
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your bookings...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error Loading Bookings</Alert.Heading>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelConfirm} onHide={() => setShowCancelConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel this booking? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>
            No, Keep Booking
          </Button>
          <Button variant="danger" onClick={handleCancelBooking}>
            Yes, Cancel Booking
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaMoneyBillWave className="me-2" />
            Payment Options
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="mb-4">Total Amount: ₹{currentBooking?.totalAmount}</h5>
          
          <Form.Group className="mb-4">
            <Form.Label>Select Payment Method</Form.Label>
            <div className="d-flex gap-3">
              <Button
                variant={paymentMethod === "online" ? "primary" : "outline-primary"}
                onClick={() => setPaymentMethod("online")}
                className="flex-grow-1"
              >
                <FaCreditCard className="me-2" />
                Online Payment
              </Button>
              <Button
                variant={paymentMethod === "cash" ? "primary" : "outline-primary"}
                onClick={() => setPaymentMethod("cash")}
                className="flex-grow-1"
              >
                <FaMoneyCheckAlt className="me-2" />
                Cash on Service
              </Button>
            </div>
          </Form.Group>

          {paymentMethod === "online" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Transaction ID/Reference</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter transaction ID or reference"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Please provide the transaction ID from your payment
                </Form.Text>
              </Form.Group>

              <Row className="mb-4">
                <Col md={6}>
                  <h6>Bank Transfer</h6>
                  <div className="bg-light p-3 rounded mb-3">
                    <p className="mb-1"><strong>Account Name:</strong> ServicePro Inc.</p>
                    <p className="mb-1"><strong>Account Number:</strong> 1234567890</p>
                    <p className="mb-1"><strong>IFSC Code:</strong> SBIN0001234</p>
                    <p className="mb-1"><strong>Bank:</strong> State Bank of India</p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6>UPI Payment</h6>
                  <div className="bg-light p-3 rounded mb-3">
                    <p className="mb-1"><strong>GPay:</strong> servicepro@upi</p>
                    <p className="mb-1"><strong>PhonePe:</strong> servicepro@ybl</p>
                    <p className="mb-1"><strong>PayTM:</strong> servicepro@paytm</p>
                  </div>
                </Col>
              </Row>

              <div className="text-center">
                <h6>Scan QR Code</h6>
                <div className="d-flex justify-content-center mb-3">
                  <div className="border p-2 rounded">
                    <FaQrcode size={150} />
                  </div>
                </div>
                <small className="text-muted">Scan this QR code with any UPI app to make payment</small>
              </div>
            </>
          )}

          {paymentMethod === "cash" && (
            <Alert variant="info">
              <FaInfoCircle className="me-2" />
              You can pay the service provider directly after service completion.
              The payment status will be marked as "paid" immediately.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePaymentSubmit}>
            {paymentMethod === "cash" ? "Confirm Cash Payment" : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaStar className="me-2" />
            Rate Your Experience
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-4 text-center">
            <Form.Label>Rate the service</Form.Label>
            <div className="d-flex justify-content-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={32}
                  className="mx-2"
                  color={star <= rating ? "#ffc107" : "#e4e5e9"}
                  onClick={() => setRating(star)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <FloatingLabel label="Your review (optional)">
              <Form.Control
                as="textarea"
                placeholder="Your review (optional)"
                style={{ height: '100px' }}
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </FloatingLabel>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReviewSubmit}>
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Amount Details Modal */}
      <Modal show={showAmountDetailsModal} onHide={() => setShowAmountDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaRupeeSign className="me-2" />
            Amount Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentBooking && (
            <div>
              <div className="d-flex justify-content-between mb-2">
                <span>Service Charge:</span>
                <span>₹{currentBooking.serviceCharge || 0}</span>
              </div>
              
              {currentBooking.materialDetails && currentBooking.materialDetails.length > 0 && (
                <>
                  <div className="mb-2">
                    <strong>Material Details:</strong>
                    <ListGroup className="mt-2">
                      {currentBooking.materialDetails.map((item, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between">
                          <span>{item.name}</span>
                          <span>₹{item.amount}</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Material Charge:</span>
                    <span>₹{currentBooking.materialCharge || 0}</span>
                  </div>
                </>
              )}
              
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total Amount:</span>
                <span>₹{currentBooking.totalAmount || 0}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAmountDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="shadow-sm">
        <Card.Header className="bg-dark text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <FaCalendarAlt className="me-2" />
              My Bookings
            </h3>
            <Button as={Link} to="/user/bookings" variant="light">
              Book New Service
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          {bookings.length === 0 ? (
            <div className="text-center py-5">
              <FaInfoCircle size={48} className="text-muted mb-3" />
              <h4>No Bookings Found</h4>
              <p className="text-muted">You haven't booked any services yet</p>
              <Button as={Link} to="/user/services" variant="primary" className="mt-3">
                Browse Services
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Worker Details</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="align-middle">
                        <strong>{booking.serviceName}</strong>
                      </td>
                      <td className="align-middle">
                        <div>
                          <div>{formatDate(booking.date)}</div>
                          <small className="text-muted">{booking.time}</small>
                        </div>
                      </td>
                      <td className="align-middle">
                        {booking.assignedWorker ? (
                          <div>
                            <div><FaUser className="me-1" /> {booking.assignedWorker.name}</div>
                            <small className="text-muted">{booking.assignedWorker.phone}</small>
                            {booking.assignedWorker.service && (
                              <small className="d-block text-muted">
                                {booking.assignedWorker.service.name}
                              </small>
                            )}
                          </div>
                        ) : (
                          <small className="text-muted">Not assigned yet</small>
                        )}
                      </td>
                      <td className="align-middle">
                        <Button 
                          variant="link" 
                          className="p-0 text-decoration-none"
                          onClick={() => {
                            setCurrentBooking(booking);
                            setShowAmountDetailsModal(true);
                          }}
                        >
                          <FaRupeeSign /> {booking.totalAmount}
                          <small className="ms-1 text-muted">(View details)</small>
                        </Button>
                      </td>
                      <td className="align-middle">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="align-middle">
                        {getPaymentBadge(booking.payment)}
                      </td>
                      <td className="align-middle">
                        <div className="d-flex gap-2">
                          {booking.status === "completed" && !booking.rating ? (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleReviewClick(booking)}
                            >
                              Rate
                            </Button>
                          ) : booking.status === "completed" && booking.rating ? (
                            <div className="text-warning">
                              {renderStars(booking.rating.stars)}
                            </div>
                          ) : null}
                          
                          {canCancelBooking(booking) && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleCancelClick(booking._id)}
                            >
                              <FaTimes /> Cancel
                            </Button>
                          )}
                          
                          {(booking.status === "assigned" || booking.status === "on_the_way") && 
                            booking.payment?.status !== "paid" && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handlePaymentClick(booking)}
                            >
                              Pay
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyBookingsPage;