import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [confirmPasswordEntered, setConfirmPasswordEntered] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordEntered(e.target.value.length > 0);
    setShowPassword(false);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordEntered(e.target.value.length > 0);
    setShowConfirmPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Reset password request:", { email, password });
    alert("Your password has been reset successfully!");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg p-4 border-0"
        style={{
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0px 2px 10px 3px rgba(0, 123, 255, 0.5)",
        }}
      >
        <h2 className="text-center mb-3 text-primary">Reset Password</h2>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Email Field */}
          <div className="mb-3">
            <label className="form-label">Enter your Email</label>
            <input
              type="email"
              name="email"
              autoComplete="off"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-3 position-relative">
            <label className="form-label">New Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control pe-5"
                placeholder="Enter new password"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
                onClick={() => passwordEntered && setShowPassword(!showPassword)}
              >
                {passwordEntered ? (showPassword ? <FaEye color="#007bff" /> : <FaEyeSlash color="#007bff" />) : <FaEye color="#007bff" />}
              </span>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-3 position-relative">
            <label className="form-label">Confirm Password</label>
            <div className="position-relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-control pe-5"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                autoComplete="new-password"
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
                onClick={() => confirmPasswordEntered && setShowConfirmPassword(!showConfirmPassword)}
              >
                {confirmPasswordEntered ? (showConfirmPassword ? <FaEye color="#007bff" /> : <FaEyeSlash color="#007bff" />) : <FaEye color="#007bff" />}
              </span>
            </div>
          </div>

          {/* Reset Password Button */}
          <button type="submit" className="btn btn-primary w-100">
            Reset Password
          </button>
        </form>

        <p className="mt-3 text-center">
          Remembered your password? <Link to="/login" className="text-primary fw-semibold" style={{ fontSize: "14px" }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;