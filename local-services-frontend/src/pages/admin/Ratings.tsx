import React, { useState, useEffect } from "react";
import {
  Table,
  Badge,
  Pagination,
  Spinner,
  Alert,
  Card,
  Form,
  Row,
  Col
} from "react-bootstrap";
import axios from "axios";
import { Star, StarHalf, StarBorder } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const API_BASE = "http://localhost:5000/api";

const RatingsPage = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    service: "",
    worker: "",
    user: ""
  });
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const ratingsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Get token from storage (use 'adminToken' if stored separately)
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        
        if (!token) {
          navigate('/admin/login');
          return;
        }

        // Create request config with auth header
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Make parallel requests with proper error handling
        const [ratingsRes, servicesRes, workersRes, usersRes] = await Promise.all([
          axios.get(`${API_BASE}/ratings`, {
            params: {
              service: filters.service || undefined,
              worker: filters.worker || undefined,
              user: filters.user || undefined
            },
            ...config
          }).catch(err => {
            throw new Error(err.response?.data?.message || "Failed to fetch ratings");
          }),
          axios.get(`${API_BASE}/services`, config)
            .catch(() => ({ data: { data: [] } })), // Fail silently for secondary data
          axios.get(`${API_BASE}/workers`, config)
            .catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE}/admin/users`, config)
            .catch(() => ({ data: { users: [] } }))
        ]);

        setRatings(ratingsRes.data.data || []);
        setServices(servicesRes.data.data || []);
        setWorkers(workersRes.data.data || []);
        setUsers(usersRes.data.users || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} style={{ color: "#ffc107" }} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} style={{ color: "#ffc107" }} />);
      } else {
        stars.push(<StarBorder key={i} style={{ color: "#ffc107" }} />);
      }
    }
    return stars;
  };

  // Pagination
  const indexOfLastRating = currentPage * ratingsPerPage;
  const indexOfFirstRating = indexOfLastRating - ratingsPerPage;
  const currentRatings = ratings.slice(indexOfFirstRating, indexOfLastRating);
  const totalPages = Math.ceil(ratings.length / ratingsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Ratings & Reviews</h2>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>
          <h5>Filters</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Service</Form.Label>
                <Form.Select
                  name="service"
                  value={filters.service}
                  onChange={handleFilterChange}
                  disabled={loading}
                >
                  <option value="">All Services</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Worker</Form.Label>
                <Form.Select
                  name="worker"
                  value={filters.worker}
                  onChange={handleFilterChange}
                  disabled={loading}
                >
                  <option value="">All Workers</option>
                  {workers.map(worker => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>User</Form.Label>
                <Form.Select
                  name="user"
                  value={filters.user}
                  onChange={handleFilterChange}
                  disabled={loading}
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {ratings.length === 0 ? (
        <Alert variant="info">
          No ratings found matching your criteria
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Worker</th>
                <th>Service</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentRatings.map((rating, index) => (
                <tr key={rating._id}>
                  <td>{indexOfFirstRating + index + 1}</td>
                  <td>{rating.user?.name || "N/A"}</td>
                  <td>{rating.worker?.name || "N/A"}</td>
                  <td>{rating.service?.name || "N/A"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {renderStars(rating.stars)}
                      <Badge bg="light" text="dark" className="ms-2">
                        {rating.stars.toFixed(1)}/5
                      </Badge>
                    </div>
                  </td>
                  <td>{rating.review || "No review"}</td>
                  <td>{format(new Date(rating.createdAt), "MMM dd, yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="mt-3">
              <Pagination.Prev
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              />
              
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => !loading && setCurrentPage(i + 1)}
                  disabled={loading}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              
              <Pagination.Next
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
              />
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default RatingsPage;