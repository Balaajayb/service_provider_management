import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Form, Button, Container, Image, Card, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaCamera, FaUser, FaEnvelope, FaPhoneAlt, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfileImage from "../../assets/images/default-avatar.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface UserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  profilePicture: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    profilePicture: defaultProfileImage,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          toast.warn("Please login to access your profile");
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setUser({
            name: response.data.user.name || "",
            email: response.data.user.email || "",
            phone: response.data.user.phone || "",
            password: '',
            profilePicture: response.data.user.profilePicture || defaultProfileImage
          });
          toast.success("Profile loaded successfully");
        }
      } catch (error: unknown) {
        console.error("Failed to fetch profile:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('userToken');
          toast.error("Session expired. Please login again");
          navigate('/login');
        } else {
          toast.error("Failed to load profile data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      setProfilePictureFile(file);
      setUser(prev => ({ ...prev, profilePicture: URL.createObjectURL(file) }));
      toast.success("Profile picture selected");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const toastId = toast.loading("Saving your changes...", {
      position: "top-right",
      autoClose: false,
    });

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.update(toastId, {
          render: "Please login to save changes",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('phone', user.phone);
      if (user.password) formData.append('password', user.password);
      if (profilePictureFile) formData.append('profilePicture', profilePictureFile);

      const response = await axios.put('http://localhost:5000/api/users/me', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.update(toastId, {
        render: "Profile updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Update local storage and state
      localStorage.setItem('userData', JSON.stringify({
        name: response.data.user.name,
        email: response.data.user.email,
        profilePicture: response.data.user.profilePicture
      }));
      
      setUser(prev => ({
        ...prev,
        profilePicture: response.data.user.profilePicture || defaultProfileImage,
        password: ''
      }));
      setProfilePictureFile(null);

    } catch (error: unknown) {
      console.error("Update error:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem('userToken');
          toast.update(toastId, {
            render: "Session expired. Please login again",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          navigate('/login');
        } else if (error.response?.status === 409) {
          toast.update(toastId, {
            render: "Email already in use by another account",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        } else {
          toast.update(toastId, {
            render: error.response?.data?.message || "Failed to update profile",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      } else {
        toast.update(toastId, {
          render: "An unexpected error occurred",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="profile-page" style={{
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
      minHeight: "100vh",
      padding: "2rem 0"
    }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Container className="py-5">
        <div className="d-flex justify-content-center">
          <Card className="shadow" style={{
            width: "100%",
            maxWidth: "600px",
            border: "none",
            borderRadius: "15px",
            overflow: "hidden"
          }}>
            <Card.Header style={{
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
              color: "white",
              padding: "1.5rem",
              borderBottom: "none"
            }}>
              <h2 className="mb-0 text-center" style={{ fontWeight: 600 }}>My Profile</h2>
            </Card.Header>
            
            <Card.Body className="p-4" style={{ backgroundColor: "#ffffff" }}>
              <Form onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <Image
                      src={user.profilePicture}
                      roundedCircle
                      width={150}
                      height={150}
                      className="border border-4 border-white shadow-sm"
                      style={{
                        objectFit: "cover",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                      }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultProfileImage;
                      }}
                      alt="Profile"
                    />
                    <label
                      htmlFor="profilePicture"
                      className="position-absolute"
                      style={{
                        cursor: "pointer",
                        bottom: "0",
                        right: "0",
                        width: "45px",
                        height: "45px",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                        transform: "translate(50%, 50%)"
                      }}
                      title="Change profile picture"
                    >
                      <FaCamera style={{
                        color: "#2575fc",
                        fontSize: "1.2rem"
                      }} />
                      <input
                        type="file"
                        id="profilePicture"
                        name="profilePicture"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="d-flex align-items-center text-muted mb-1">
                    <FaUser className="me-2" style={{ color: "#6a11cb" }} />
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="d-flex align-items-center text-muted mb-1">
                    <FaEnvelope className="me-2" style={{ color: "#6a11cb" }} />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="d-flex align-items-center text-muted mb-1">
                    <FaPhoneAlt className="me-2" style={{ color: "#6a11cb" }} />
                    Phone Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10,15}"
                    title="Please enter a valid phone number (10-15 digits)"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="d-flex align-items-center text-muted mb-1">
                    <FaLock className="me-2" style={{ color: "#6a11cb" }} />
                    Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={user.password}
                      onChange={handleChange}
                      placeholder="Enter new password to change"
                      minLength={6}
                    />
                    <Button
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y me-2"
                      onClick={handleTogglePassword}
                      style={{ zIndex: 5, color: "#6a11cb" }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                  <Form.Text className="text-muted">
                    Leave blank to keep current password
                  </Form.Text>
                </Form.Group>

                <div className="d-grid mt-4">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    style={{
                      background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                      border: "none"
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;