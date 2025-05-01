import React, { useState, useEffect, FormEvent } from "react";
import { 
  Card, Button, Row, Col, Form, Offcanvas, 
  Spinner, Alert, Modal, Container
} from "react-bootstrap";
import { FaEdit, FaTrash, FaCamera, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "./ServicesPage.css";

interface Service {
  _id: string;
  name: string;
  description: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState({
    page: false,
    delete: false,
    submit: false
  });

  const API_BASE = "http://localhost:5000";
  const API_URL = `${API_BASE}/api/services`;
  const UPLOADS_URL = `${API_BASE}/uploads`;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(prev => ({ ...prev, page: true }));
      const response = await axios.get(API_URL);
      setServices(response.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch services");
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  };

  const handleAddService = () => {
    setCurrentService({
      _id: "",
      name: "",
      description: "",
      image: ""
    });
    setShowCanvas(true);
  };

  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setShowCanvas(true);
  };

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      const response = await axios.delete(`${API_URL}/${serviceToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Deletion failed");
      }

      setServices(prev => prev.filter(service => service._id !== serviceToDelete));
      
      toast.success("Service deleted successfully");
    } catch (err: any) {
      fetchServices();
      toast.error(err.response?.data?.message || "Failed to delete service");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      if (currentService) {
        setCurrentService({
          ...currentService,
          image: URL.createObjectURL(file)
        });
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentService) return;

    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const formData = new FormData();
      formData.append("name", currentService.name);
      formData.append("description", currentService.description);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      };

      const response = currentService._id
        ? await axios.put(`${API_URL}/${currentService._id}`, formData, config)
        : await axios.post(API_URL, formData, config);

      setServices(currentService._id
        ? services.map(s => s._id === currentService._id ? response.data.data : s)
        : [...services, response.data.data]
      );

      toast.success(`Service ${currentService._id ? "updated" : "added"} successfully`);
      setShowCanvas(false);
      setImageFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("blob:")) return imagePath;
    return `${UPLOADS_URL}/${imagePath}`;
  };

  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f8f9fa'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='16' text-anchor='middle' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
    <Container fluid className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0 text-primary">Services Management</h1>
        <Button 
          variant="primary" 
          onClick={handleAddService}
          disabled={loading.page}
          className="d-flex align-items-center"
        >
          <FaPlus className="me-2" /> Add Service
        </Button>
      </div>

      {/* Services Grid */}
      {loading.page && !services.length ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading services...</p>
        </div>
      ) : (
        <Row className="g-4">
          {services.map(service => (
            <Col key={service._id} xl={3} lg={4} md={6}>
              <Card className="h-100 shadow-sm">
                <div className="position-relative" style={{ height: "200px" }}>
                  <Card.Img
                    variant="top"
                    src={getImageUrl(service.image)}
                    alt={service.name}
                    style={{ height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                  />
                  <div className="position-absolute top-0 end-0 p-2">
                    <Button 
                      variant="light" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEditService(service)}
                    >
                      <FaEdit className="text-primary" />
                    </Button>
                    <Button 
                      variant="light" 
                      size="sm"
                      onClick={() => handleDeleteClick(service._id)}
                      disabled={loading.delete}
                    >
                      <FaTrash className="text-danger" />
                    </Button>
                  </div>
                </div>
                <Card.Body>
                  <Card.Title>{service.name}</Card.Title>
                  <Card.Text className="text-muted">
                    {service.description || "No description provided"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Service Form */}
      <Offcanvas 
        show={showCanvas} 
        onHide={() => {
          setShowCanvas(false);
          setImageFile(null);
        }} 
        placement="end"
        style={{ width: "500px" }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">
            {currentService?._id ? "Edit Service" : "Add New Service"}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body 
          className="p-0 d-flex flex-column"
          style={{ height: "calc(100vh - 56px)" }}
        >
          <div className="p-4" style={{ overflowY: "auto", flex: "1" }}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Service Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentService?.name || ""}
                  onChange={(e) => currentService && setCurrentService({ 
                    ...currentService, 
                    name: e.target.value 
                  })}
                  required
                  disabled={loading.submit}
                  placeholder="Enter service name"
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={currentService?.description || ""}
                  onChange={(e) => currentService && setCurrentService({ 
                    ...currentService, 
                    description: e.target.value 
                  })}
                  required
                  disabled={loading.submit}
                  placeholder="Enter detailed description"
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Service Image</Form.Label>
                <div className="d-flex flex-column align-items-center">
                  <div 
                    className="mb-3 border rounded p-2 d-flex align-items-center justify-content-center" 
                    style={{ height: "200px", width: "100%", backgroundColor: "#f8f9fa" }}
                  >
                    <img 
                      src={currentService?.image ? getImageUrl(currentService.image) : fallbackImage} 
                      alt="Preview" 
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </div>
                  <label className="btn btn-outline-primary w-100">
                    <FaCamera className="me-2" />
                    {currentService?.image ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      disabled={loading.submit}
                    />
                  </label>
                  <small className="text-muted mt-2">
                    JPEG, PNG (Max 5MB)
                  </small>
                </div>
              </Form.Group>
            </Form>
          </div>
          
          {/* Fixed position submit button */}
          <div className="border-top p-3 bg-white">
            <Button 
              variant={currentService?._id ? "primary" : "success"}
              type="submit" 
              onClick={handleSubmit}
              disabled={loading.submit}
              className="w-100 py-2 fw-bold"
            >
              {loading.submit ? (
                <Spinner size="sm" className="me-2" />
              ) : currentService?._id ? (
                "UPDATE SERVICE"
              ) : (
                "ADD SERVICE"
              )}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this service? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            disabled={loading.delete}
          >
            {loading.delete ? (
              <Spinner size="sm" className="me-2" />
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ServicesPage;