import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Divider
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import Offcanvas from "react-bootstrap/Offcanvas";
import Form from "react-bootstrap/Form";
import axios from "axios";

const Workers = () => {
  const [search, setSearch] = useState("");
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [currentWorker, setCurrentWorker] = useState({ 
    name: "", 
    service: "", 
    phone: "", 
    address: "" 
  });
  const [loading, setLoading] = useState({
    workers: false,
    services: false,
    form: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // API endpoints
  const API_URL = "http://localhost:5000/api/workers";
  const SERVICES_URL = "http://localhost:5000/api/workers/services";

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("adminToken") || "";
  };

  // Create axios instance with default headers
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`
    }
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const workersPerPage = 5;

  // Fetch workers and services on component mount
  useEffect(() => {
    fetchWorkers();
    fetchServices();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(prev => ({ ...prev, workers: true }));
      const response = await api.get("/workers");
      setWorkers(response.data.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please login to access this resource");
      } else {
        setError(err.response?.data?.message || "Failed to fetch workers");
      }
    } finally {
      setLoading(prev => ({ ...prev, workers: false }));
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(prev => ({ ...prev, services: true }));
      const response = await api.get("/workers/services");
      setServices(response.data.data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  // Filter workers based on search
  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(search.toLowerCase()) ||
      (worker.service?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      worker.address.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate current workers to display
  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = filteredWorkers.slice(indexOfFirstWorker, indexOfLastWorker);

  // Handle page change
  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle editing a worker
  const handleEditWorker = (worker) => {
    setCurrentWorker({
      id: worker._id,
      name: worker.name,
      service: worker.service._id,
      phone: worker.phone,
      address: worker.address
    });
    setShowCanvas(true);
  };

  // Handle saving a worker
  const handleSaveWorker = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, form: true }));
      setError("");
      
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const workerData = {
        name: currentWorker.name,
        service: currentWorker.service,
        phone: currentWorker.phone,
        address: currentWorker.address
      };

      let response;
      if (currentWorker.id) {
        // Update existing worker
        response = await api.put(`/workers/${currentWorker.id}`, workerData);
      } else {
        // Add new worker
        response = await api.post("/workers", workerData);
      }

      setSuccess(`Worker ${currentWorker.id ? "updated" : "added"} successfully`);
      setTimeout(() => setSuccess(""), 3000);
      setShowCanvas(false);
      fetchWorkers(); // Refresh the list
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again");
      } else {
        setError(err.response?.data?.message || err.message || "An error occurred");
      }
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Handle adding a new worker
  const handleAddWorker = () => {
    const token = getAuthToken();
    if (!token) {
      setError("Please login to add workers");
      return;
    }
    setCurrentWorker({ 
      name: "", 
      service: services[0]?._id || "", 
      phone: "", 
      address: "" 
    });
    setShowCanvas(true);
  };

  // Handle deleting a worker
  const handleDeleteWorker = async (id) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication required");
        }
        
        await api.delete(`/workers/${id}`);
        setSuccess("Worker deleted successfully");
        setTimeout(() => setSuccess(""), 3000);
        fetchWorkers(); // Refresh the list
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again");
        } else {
          setError(err.response?.data?.message || "Failed to delete worker");
        }
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}>
        <Typography variant="h4" component="h1">
          Manage Workers
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddWorker}
          disabled={loading.workers || loading.services}
          sx={{ 
            px: 3,
            py: 1,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Add New Worker
        </Button>
      </Box>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Search Bar */}
      <TextField
        label="Search Workers"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 3 }}
        onChange={(e) => setSearch(e.target.value)}
        disabled={loading.workers}
      />

      {loading.workers ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Workers Table */}
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Service</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Address</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentWorkers.map((worker) => (
                  <TableRow key={worker._id} hover>
                    <TableCell>{worker.name}</TableCell>
                    <TableCell>{worker.service?.name || "N/A"}</TableCell>
                    <TableCell>{worker.phone}</TableCell>
                    <TableCell>{worker.address}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditWorker(worker)}
                        disabled={loading.form}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteWorker(worker._id)}
                        disabled={loading.form}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(filteredWorkers.length / workersPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Offcanvas for Add/Edit Worker */}
      <Offcanvas 
        show={showCanvas} 
        onHide={() => setShowCanvas(false)} 
        placement="end"
        style={{ width: '450px' }}
      >
        <Offcanvas.Header closeButton style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <Offcanvas.Title style={{ fontSize: '1.5rem', fontWeight: '500' }}>
            {currentWorker.id ? "Edit Worker" : "Add New Worker"}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: '20px' }}>
          <Form onSubmit={handleSaveWorker}>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '500', marginBottom: '8px' }}>Full Name *</Form.Label>
              <Form.Control
                type="text"
                value={currentWorker.name}
                onChange={(e) => setCurrentWorker({ ...currentWorker, name: e.target.value })}
                required
                disabled={loading.form}
                style={{ padding: '10px', borderRadius: '4px' }}
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '500', marginBottom: '8px' }}>Phone Number *</Form.Label>
              <Form.Control
                type="text"
                value={currentWorker.phone}
                onChange={(e) => setCurrentWorker({ ...currentWorker, phone: e.target.value })}
                required
                disabled={loading.form}
                style={{ padding: '10px', borderRadius: '4px' }}
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '500', marginBottom: '8px' }}>Service *</Form.Label>
              {loading.services ? (
                <div style={{ padding: '10px', textAlign: 'center' }}>Loading services...</div>
              ) : (
                <Form.Select
                  value={currentWorker.service}
                  onChange={(e) => setCurrentWorker({ ...currentWorker, service: e.target.value })}
                  required
                  disabled={loading.form}
                  style={{ 
                    padding: '10px', 
                    borderRadius: '4px',
                    width: '100%',
                    border: '1px solid #ced4da'
                  }}
                >
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '500', marginBottom: '8px' }}>Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentWorker.address}
                onChange={(e) => setCurrentWorker({ ...currentWorker, address: e.target.value })}
                required
                disabled={loading.form}
                style={{ padding: '10px', borderRadius: '4px' }}
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '10px',
                fontSize: '1rem',
                marginTop: '10px'
              }}
              disabled={loading.form}
            >
              {loading.form ? (
                <span>Processing...</span>
              ) : (
                currentWorker.id ? "Save Changes" : "Add Worker"
              )}
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </Box>
  );
};

export default Workers;