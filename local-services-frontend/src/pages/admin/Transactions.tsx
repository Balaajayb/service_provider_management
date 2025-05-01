import React, { useState, useEffect } from "react";
import { Table, Badge, Pagination, Spinner, Alert, Card, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    user: "",
    status: "",
    paymentMethod: ""
  });
  const transactionsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        
        if (!token) {
          navigate('/admin/login');
          return;
        }

        const response = await axios.get(`${API_BASE}/transactions`, {
          params: filters,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setTransactions(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters, navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed": return "success";
      case "pending": return "warning";
      case "failed": return "danger";
      default: return "secondary";
    }
  };

  const getMethodVariant = (method) => {
    switch (method) {
      case "online": return "primary";
      case "cash": return "info";
      default: return "light";
    }
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), "MMM dd, yyyy hh:mm a") : "N/A";
    } catch {
      return "Invalid date";
    }
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><Spinner animation="border" /></div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Transactions</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header><h5>Filters</h5></Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Method</Form.Label>
                <Form.Select name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange}>
                  <option value="">All Methods</option>
                  <option value="online">Online</option>
                  <option value="cash">Cash</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Transaction ID</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.map((transaction, index) => (
            <tr key={transaction._id}>
              <td>{indexOfFirstTransaction + index + 1}</td>
              <td>
                {transaction.user}
                {transaction.userPhone && ` (${transaction.userPhone})`}
              </td>
              <td>₹{transaction.amount}</td>
              <td><Badge bg={getMethodVariant(transaction.paymentMethod)}>{transaction.paymentMethod}</Badge></td>
              <td><Badge bg={getStatusVariant(transaction.status)}>{transaction.status}</Badge></td>
              <td>{transaction.transactionId}</td>
              <td>{formatDate(transaction.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-3">
          <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => setCurrentPage(i+1)}>
              {i+1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
        </Pagination>
      )}
    </div>
  );
};

export default TransactionsPage;