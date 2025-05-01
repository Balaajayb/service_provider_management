import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfileImage from "../../assets/images/default-avatar.png";

const UserRegistration = () => {
  const [user, setUser] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    password: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateName = (name: string) => {
    if (!/^[a-zA-Z\s]*$/.test(name)) {
      toast.error("Name should contain only alphabetic characters");
      return false;
    }
    if (name.length > 20) {
      toast.error("Name should not exceed 20 characters");
      return false;
    }
    return true;
  };

  const validatePhone = (phone: string) => {
    if (!/^\d+$/.test(phone)) {
      toast.error("Phone number should contain only digits");
      return false;
    }
    if (phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }
    if (/(\d)\1{9}/.test(phone)) {
      toast.error("Phone number cannot have all identical digits");
      return false;
    }
    if (/(\d)\1{2,}/.test(phone)) {
      toast.error("Phone number cannot have repeated sequences");
      return false;
    }
    return true;
  };

  const validateEmail = (email: string) => {
    // Requires at least one letter before @
    const emailRegex = /^[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*(?:[._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Email must contain letters before @ (e.g., ajay123@gmail.com)");
      return false;
    }
    return true;
  };

  const validatePassword = (password: string) => {
    // Requires both letters and numbers
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Password must contain both letters and numbers");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "name") {
      if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
        setUser({ ...user, [name]: value });
      }
    } 
    else if (name === "phone") {
      if (value === "" || /^\d*$/.test(value)) {
        setUser({ ...user, [name]: value });
      }
    }
    else {
      setUser({ ...user, [name]: value });
      if (name === "password") {
        setPasswordEntered(value.length > 0);
        setShowPassword(false);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "name" && value) {
      validateName(value);
    }
    else if (name === "phone" && value) {
      validatePhone(value);
    }
    else if (name === "email" && value) {
      validateEmail(value);
    }
    else if (name === "password" && value) {
      validatePassword(value);
    }
  };

  const handleTogglePassword = () => {
    if (passwordEntered) setShowPassword(!showPassword);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!user.name || !user.email || !user.phone || !user.password) {
      toast.error("All fields are required.");
      return;
    }

    if (!validateName(user.name)) return;
    if (!validatePhone(user.phone)) return;
    if (!validateEmail(user.email)) return;
    if (!validatePassword(user.password)) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("name", user.name.trim());
    formData.append("email", user.email.trim());
    formData.append("phone", user.phone);
    formData.append("password", user.password);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    try {
      await axios.post("http://localhost:5000/api/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Registration failed. Please try again.");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
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
      
      <div className="card shadow-lg p-4 border-0" style={{ width: "100%", maxWidth: "500px", boxShadow: "0px 2px 10px 3px rgba(28, 99, 44, 0.9)" }}>
        <h2 className="text-center mb-3 fw-bold" style={{ color: "#28a745" }}>Register</h2>
        <form onSubmit={handleSubmit}>
          {/* Profile Picture Upload */}
          <div className="text-center mb-4 position-relative">
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#f0f0f0", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #ddd", overflow: "hidden" }}>
              {profilePicture ? (
                <img src={URL.createObjectURL(profilePicture)} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <img src={defaultProfileImage} alt="Default Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <label htmlFor="profilePicture" style={{ position: "absolute", bottom: "10px", right: "calc(50% - 50px)", cursor: "pointer", backgroundColor: "#fff", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
              <FaCamera size={16} color="#28a745" />
            </label>
            <input type="file" id="profilePicture" name="profilePicture" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </div>

          {/* Name and Email Fields */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                name="name" 
                className="form-control" 
                placeholder="Enter full name" 
                value={user.name} 
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={20}
                autoComplete="off" 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                placeholder="Enter email" 
                value={user.email} 
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off" 
                required 
              />
            </div>
          </div>

          {/* Phone and Password Fields */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input 
                type="text" 
                name="phone" 
                className="form-control" 
                placeholder="Enter phone number" 
                value={user.phone} 
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={10}
                autoComplete="off" 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password</label>
              <div className="position-relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  className="form-control" 
                  placeholder="Enter password" 
                  value={user.password} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password" 
                  required 
                  style={{ paddingRight: "40px" }} 
                />
                <span className="position-absolute top-50 end-20 translate-middle-y" style={{ cursor: "pointer", right: "10px" }} onClick={handleTogglePassword}>
                  {passwordEntered ? (showPassword ? <FaEye color="#28a745" /> : <FaEyeSlash color="#28a745" />) : <FaEye color="#28a745" />}
                </span>
              </div>
            </div>
          </div>

          {/* Register Button */}
          <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: "#28a745" }} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-3 text-center">
          Already have an account? <Link to="/login" className="text-primary fw-semibold" style={{ fontSize: "14px" }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegistration;