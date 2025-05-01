import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserLogin = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      setPasswordEntered(e.target.value.length > 0);
      setShowPassword(false);
    }
  };

  const handleTogglePassword = () => {
    if (passwordEntered) {
      setShowPassword(!showPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", user);
      const { token, user: userData } = response.data;

      // Save user data and token in local storage
      localStorage.setItem("userToken", token);
      localStorage.setItem("userData", JSON.stringify(userData));

      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/user/home"); // Redirect to home page
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Login failed. Please try again.");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
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
      
      <div
        className="card p-4 rounded border-0"
        style={{
          width: "100%",
          maxWidth: "340px",
          boxShadow: "0px 2px 10px 3px rgba(234, 148, 252, 0.9)",
        }}
      >
        <h2 className="text-center mb-3 fw-bold" style={{ color: "#d435f5" }}>
          User Login
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter email"
              value={user.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          {/* Password Field with Eye Icon */}
          <div className="mb-2 position-relative">
            <label className="form-label">Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control pe-5"
                placeholder="Enter password"
                value={user.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
                onClick={handleTogglePassword}
              >
                {passwordEntered ? (
                  showPassword ? <FaEye color="#d435f5" /> : <FaEyeSlash color="#d435f5" />
                ) : (
                  <FaEye color="#d435f5" />
                )}
              </span>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="mb-3 text-end">
            {/* <Link to="/forgot-password" className="text-primary fw-semibold" style={{ fontSize: "14px" }}>
              Forgot Password?
            </Link> */}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn w-100 text-white"
            style={{ backgroundColor: "#d435f5" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <p className="mt-3 mb-1 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary fw-semibold" style={{ fontSize: "14px" }}>
            Sign Up
          </Link>
        </p>

        {/* Admin Login Link */}
        <p className="mt-1 mb-1 text-center">
          Are you an admin?{" "}
          <Link to="/admin/login" className="text-primary fw-semibold" style={{ fontSize: "14px" }}>
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;