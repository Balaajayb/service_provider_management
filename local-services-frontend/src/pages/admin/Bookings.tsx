import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Badge,
  Form,
  Pagination,
  Modal,
  ListGroup,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Toast,
  ToastContainer
} from "react-bootstrap";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const bookingsPerPage = 5;
  const [newMaterial, setNewMaterial] = useState({ name: "", amount: "" });
  const [workers, setWorkers] = useState([]);
  const [showMaterialDetails, setShowMaterialDetails] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/bookings");
        setBookings(response.data.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/admin/login');
        } else {
          setError(err.response?.data?.message || "Failed to fetch bookings");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const fetchWorkers = async () => {
    try {
      const response = await api.get("/workers");
      setWorkers(response.data?.data || []);
    } catch (err) {
      setError("Failed to load workers list");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.put(`/bookings/${id}/status`, { status });
      setBookings(bookings.map(b => b._id === id ? response.data.data : b));
      if (currentBooking?._id === id) {
        setCurrentBooking(response.data.data);
      }
      showSuccessToast("Status updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handlePaymentStatusUpdate = async (bookingId, status) => {
    try {
      // Always send 'completed' to backend for cash payments
      const backendStatus = 'completed';
      
      const response = await api.put(`/bookings/${bookingId}/payment-status`, { 
        status: backendStatus 
      });
  
      // Update state with 'paid' for UI consistency
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b._id === bookingId 
            ? { 
                ...b, 
                payment: { 
                  ...b.payment, 
                  status: 'paid', // Show as 'paid' in UI
                  transactionId: response.data.data.transaction?.transactionId || b.payment.transactionId
                } 
              } 
            : b
        )
      );
  
      if (currentBooking?._id === bookingId) {
        setCurrentBooking({
          ...currentBooking,
          payment: {
            ...currentBooking.payment,
            status: 'paid', // Show as 'paid' in UI
            transactionId: response.data.data.transaction?.transactionId || currentBooking.payment.transactionId
          }
        });
      }
      
      showSuccessToast(`Payment marked as completed`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update payment status");
    }
  };
  
  
  const handleAssignWorker = async (bookingId, workerId) => {
    if (!workerId) {
      setError("Please select a worker to assign");
      return;
    }

    try {
      setIsAssigning(true);
      const response = await api.put(`/bookings/${bookingId}/assign-worker`, { workerId });

      setBookings(prev => prev.map(b =>
        b._id === bookingId ? response.data.data : b
      ));

      if (currentBooking?._id === bookingId) {
        setCurrentBooking(response.data.data);
      }

      showSuccessToast("Worker assigned successfully");
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to assign worker";
      setError(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateCharges = async (id, field, value) => {
    try {
      const payload = { [field]: Number(value) || 0 };
      const response = await api.put(`/bookings/${id}/charges`, payload);
      setBookings(bookings.map(b => b._id === id ? response.data.data : b));
      if (currentBooking?._id === id) {
        setCurrentBooking(response.data.data);
      }
      showSuccessToast("Charges updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update charges");
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.amount) {
      setError("Please provide material name and amount");
      return;
    }

    try {
      const updatedMaterials = [
        ...(currentBooking.materialDetails || []),
        { name: newMaterial.name, amount: Number(newMaterial.amount) }
      ];

      const response = await api.put(
        `/bookings/${currentBooking._id}/charges`,
        { materialDetails: updatedMaterials }
      );

      setBookings(bookings.map(b =>
        b._id === currentBooking._id ? response.data.data : b
      ));
      setCurrentBooking(response.data.data);
      setNewMaterial({ name: "", amount: "" });
      showSuccessToast("Material added successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add material");
    }
  };

  const showBookingDetails = async (booking) => {
    setCurrentBooking(booking);
    try {
      await fetchWorkers();
      setShowDetails(true);
    } catch (err) {
      setError("Failed to load worker details");
    }
  };

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "success";
      case "pending": return "warning";
      case "cancelled": return "danger";
      case "completed": return "primary";
      case "assigned": return "info";
      case "on_the_way": return "primary";
      default: return "secondary";
    }
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), "MMM dd, yyyy hh:mm a") : "N/A";
    } catch {
      return "Invalid date";
    }
  };

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Service Bookings</h2>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success">
          <Toast.Header>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error.includes(": ") ? error.split(": ")[1] : error}
        </Alert>
      )}

      {bookings.length === 0 && !loading ? (
        <Alert variant="info">
          No bookings found.
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Service</th>
                <th>Date</th>
                <th>Worker</th>
                <th>Status</th>
                <th>Total ₹</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((booking, index) => (
                <tr key={booking._id}>
                  <td>{indexOfFirstBooking + index + 1}</td>
                  <td>{booking.user?.name || "N/A"}</td>
                  <td>{booking.serviceName || "N/A"}</td>
                  <td>{formatDate(booking.date)}</td>
                  <td>
                    {booking.assignedWorker ? (
                      `${booking.assignedWorker.name} (${booking.assignedWorker.phone || 'No phone'})`
                    ) : "Unassigned"}
                  </td>
                  <td>
                    <Badge bg={getStatusVariant(booking.status)}>
                      {booking.status || "N/A"}
                    </Badge>
                  </td>
                  <td>₹{booking.totalAmount || 0}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => showBookingDetails(booking)}
                      className="me-2"
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="mt-3">
              <Pagination.Prev
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Pagination.Item
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              })}

              <Pagination.Next
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </>
      )}

      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentBooking && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-primary text-white">
                      <Card.Title>Customer Information</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Name:</strong> {currentBooking.user?.name || "N/A"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Email:</strong> {currentBooking.user?.email || "N/A"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Phone:</strong> {currentBooking.user?.phone || "N/A"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Address:</strong> {currentBooking.address || "N/A"}
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-info text-white">
                      <Card.Title>Service Information</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Service:</strong> {currentBooking.serviceName || "N/A"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Date:</strong> {formatDate(currentBooking.date)}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Time:</strong> {currentBooking.time || "N/A"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Distance:</strong> {currentBooking.location?.distance || 0} km
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="mb-4">
                <Card.Header className="bg-secondary text-white">
                  <Card.Title>Special Instructions</Card.Title>
                </Card.Header>
                <Card.Body>
                  <p>{currentBooking.specialInstructions || "None provided"}</p>
                </Card.Body>
              </Card>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={currentBooking.status || "pending"}
                      onChange={(e) => handleStatusChange(currentBooking._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="on_the_way">On The Way</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      {currentBooking.assignedWorker ? "Update Worker" : "Assign Worker"}
                    </Form.Label>
                    <Form.Select
                      value={currentBooking.assignedWorker?._id || ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignWorker(currentBooking._id, e.target.value);
                        }
                      }}
                      disabled={isAssigning}
                    >
                      <option value="">-- Select Worker --</option>
                      {workers.map(worker => (
                        <option key={worker._id} value={worker._id}>
                          {worker.name} ({worker.phone || 'No phone'}) - {worker.service?.name || 'No service'}
                        </option>
                      ))}
                    </Form.Select>
                    {isAssigning && <Spinner size="sm" animation="border" className="ms-2" />}
                    {currentBooking.assignedWorker && (
                      <div className="mt-2 text-success">
                        <strong>Current Worker:</strong> {currentBooking.assignedWorker.name}
                        (Phone: {currentBooking.assignedWorker.phone || "N/A"})
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Service Charge (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={currentBooking.serviceCharge || 0}
                      onChange={(e) => handleUpdateCharges(currentBooking._id, "serviceCharge", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Material Charge (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={currentBooking.materialCharge || 0}
                      onChange={(e) => handleUpdateCharges(currentBooking._id, "materialCharge", e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="outline-primary"
                size="sm"
                className="mb-3"
                onClick={() => setShowMaterialDetails(!showMaterialDetails)}
              >
                {showMaterialDetails ? "Hide Materials" : "Show Materials"}
              </Button>

              {showMaterialDetails && (
                <>
                  <ListGroup className="mb-3">
                    {(currentBooking.materialDetails || []).map((item, idx) => (
                      <ListGroup.Item key={idx}>
                        {item.name} - ₹{item.amount}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>

                  <div className="border p-3 mb-3">
                    <h6>Add New Material</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <Form.Control
                          placeholder="Material name"
                          value={newMaterial.name}
                          onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <Form.Control
                          type="number"
                          placeholder="Amount"
                          value={newMaterial.amount}
                          onChange={(e) => setNewMaterial({ ...newMaterial, amount: e.target.value })}
                        />
                      </div>
                      <div className="col-md-2">
                        <Button variant="success" onClick={handleAddMaterial}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="d-flex justify-content-between p-2 bg-light rounded">
                <h5 className="mb-0">Total Amount:</h5>
                <h5 className="mb-0">₹{currentBooking.totalAmount || 0}</h5>
              </div>

              {currentBooking.payment && (
                <Card className="mt-3">
                  <Card.Header className="bg-light">
                    <Card.Title>Payment Information</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Status:</strong>{" "}
                          <Badge bg={
                            currentBooking.payment.status === "paid" ||
                              currentBooking.payment.status === "completed" ? "success" :
                              currentBooking.payment.status === "pending" ? "warning" : "danger"
                          }>
                            {currentBooking.payment.status}
                          </Badge>
                        </div>
                        
{currentBooking.payment.method === "cash" && 
 currentBooking.payment.status === "pending" && (
  <Button 
    variant="success" 
    size="sm"
    onClick={() => handlePaymentStatusUpdate(currentBooking._id, "paid")}
  >
    Mark as Completed
  </Button>
)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Method:</strong> {currentBooking.payment.method}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Transaction ID:</strong>{" "}
                        {currentBooking.payment.transactionId ||
                          (currentBooking.payment.method === 'cash' ? 'Cash Payment' : 'N/A')}
                      </ListGroup.Item>
                      {currentBooking.payment.date && (
                        <ListGroup.Item>
                          <strong>Date:</strong> {formatDate(currentBooking.payment.date)}
                        </ListGroup.Item>
                      )}
                      <ListGroup.Item>
                        <strong>Amount:</strong> ₹{currentBooking.payment.amount || currentBooking.totalAmount || 0}
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              )}

              {currentBooking.rating && (
                <Card className="mt-3">
                  <Card.Header className="bg-light">
                    <Card.Title>Rating Information</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div>
                      <strong>Rating:</strong>{" "}
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < currentBooking.rating.stars ? "#ffc107" : "#e4e5e9" }}>
                          ★
                        </span>
                      ))}
                      ({currentBooking.rating.stars}/5)
                    </div>
                    {currentBooking.rating.review && (
                      <div className="mt-2">
                        <strong>Review:</strong> {currentBooking.rating.review}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminBookingsPage;