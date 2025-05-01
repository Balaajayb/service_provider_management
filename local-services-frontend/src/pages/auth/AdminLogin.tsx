import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
  const [admin, setAdmin] = useState({ admin_email: "", admin_pass: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Trim input fields
    const trimmedEmail = admin.admin_email.trim();
    const trimmedPassword = admin.admin_pass.trim();

    // Validate input fields
    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/admin/login", {
        admin_email: trimmedEmail,
        admin_pass: trimmedPassword,
      });

      // Save the token in localStorage
      localStorage.setItem("adminToken", response.data.token);
      console.log("🔑 Token saved in localStorage:", response.data.token);

      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Invalid credentials");
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
      
      <div className="card p-4 rounded border-0" style={{ width: "100%", maxWidth: "400px", boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.5)" }}>
        <h2 className="text-center text-primary">Admin Login</h2>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-3">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              name="admin_email"
              className="form-control"
              placeholder="Enter email"
              value={admin.admin_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="admin_pass"
                className="form-control"
                placeholder="Enter password"
                value={admin.admin_pass}
                onChange={handleChange}
                required
              />
              <span className="input-group-text bg-white border" style={{ cursor: "pointer" }} onClick={handleTogglePassword}>
                {showPassword ? <FaEyeSlash color="#007bff" /> : <FaEye color="#007bff" />}
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;