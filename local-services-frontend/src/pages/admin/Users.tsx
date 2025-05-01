import React, { useState, useEffect } from "react";
import { 
  Table, Button, Pagination, Offcanvas, Form, 
  Modal, Spinner, Alert, InputGroup, Container,
  Badge
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility, 
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const adminApi = axios.create({
  baseURL: "http://localhost:5000/api/admin"
});

adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  isAdmin?: boolean;
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const [showCanvas, setShowCanvas] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!localStorage.getItem('adminToken')) {
        throw new Error("No authentication token found");
      }

      const response = await adminApi.get('/users');
      
      if (response.data?.success) {
        setUsers(response.data.users || []);
      } else {
        throw new Error(response.data?.message || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.response?.data?.message || err.message);
      if (err.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
      return;
    }
    fetchUsers(); 
  }, [navigate]);

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setNewPassword('');
    setShowCanvas(true);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      const updateData: any = {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || ''
      };
      
      if (newPassword.trim() !== '') {
        if (newPassword.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        updateData.password = newPassword;
      }

      const response = await adminApi.put(
        `/users/${currentUser._id}`,
        updateData
      );

      if (response.data.success) {
        setUsers(users.map(u => u._id === currentUser._id ? response.data.user : u));
        setShowCanvas(false);
        toast.success("User updated successfully");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setIsSubmitting(true);
    try {
      await adminApi.delete(`/users/${userToDelete}`);
      
      setUsers(users.filter(u => u._id !== userToDelete));
      setShowDeleteModal(false);
      toast.success("User deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className=" text-white p-2 rounded-top" style={{ backgroundColor:"#1a2639"}}>
        <h3 className="mb-0 d-flex align-items-center">
          <Person className="me-2" fontSize="large" />
          User Management
        </h3>
      </div>

      <div className="bg-white p-4 rounded-bottom shadow-sm">
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading users...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="d-flex align-items-center">
            <div className="flex-grow-1">{error}</div>
            <Button variant="outline-light" size="sm" onClick={fetchUsers}>
              Try Again
            </Button>
          </Alert>
        ) : users.length === 0 ? (
          <Alert variant="info">No users found</Alert>
        ) : (
          <>
            <Table striped hover responsive className="mb-4">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <Person className="me-2 text-muted" />
                        {user.name}
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <Email className="me-2 text-muted" />
                        {user.email}
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <Phone className="me-2 text-muted" />
                        {user.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="align-middle">
                      {user.isAdmin ? (
                        <Badge bg="primary">Admin</Badge>
                      ) : (
                        <Badge bg="secondary">User</Badge>
                      )}
                    </td>
                    <td className="align-middle text-end">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleEdit(user)}
                        disabled={isSubmitting}
                        className="me-2"
                      >
                        <EditIcon fontSize="small" className="me-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => {
                          setUserToDelete(user._id);
                          setShowDeleteModal(true);
                        }}
                        disabled={isSubmitting}
                      >
                        <DeleteIcon fontSize="small" className="me-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.Prev 
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                    disabled={currentPage === 1} 
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                  />
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Edit User Offcanvas */}
        <Offcanvas 
          show={showCanvas} 
          onHide={() => setShowCanvas(false)} 
          placement="end"
          style={{ width: '500px' }}
        >
          <Offcanvas.Header closeButton className="bg-dark text-white">
            <Offcanvas.Title>
              <EditIcon className="me-2" />
              Edit User
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-4">
            {currentUser && (
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold d-flex align-items-center">
                    <Person className="me-2" />
                    Name
                  </Form.Label>
                  <Form.Control
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold d-flex align-items-center">
                    <Email className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold d-flex align-items-center">
                    <Phone className="me-2" />
                    Phone
                  </Form.Label>
                  <Form.Control
                    value={currentUser.phone || ''}
                    onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold d-flex align-items-center">
                    <Lock className="me-2" />
                    New Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to keep current password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="py-2"
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters
                  </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            )}
          </Offcanvas.Body>
        </Offcanvas>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => !isSubmitting && setShowDeleteModal(false)}>
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>
              <DeleteIcon className="me-2" />
              Confirm Deletion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this user?</p>
            <p className="text-danger">
              <strong>Warning:</strong> This action cannot be undone and will permanently delete the user account.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : 'Delete Permanently'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default UsersPage;