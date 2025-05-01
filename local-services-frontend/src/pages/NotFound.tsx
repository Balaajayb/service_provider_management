import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate and useLocation
import styles from "./NotFound.module.css"; // Import module CSS

const NotFound = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Initialize useLocation to get the current path

  // Function to go back to the previous page
  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // Determine the text and route for the second button
  const isAdminPage = location.pathname.startsWith("/admin");
  const buttonText = isAdminPage ? "Go to Dashboard" : "Go to Home";
  const buttonRoute = isAdminPage ? "/admin/dashboard" : "/user/home";

  return (
    <div className={`d-flex flex-column justify-content-center align-items-center vh-100 ${styles.container}`}>
      <h1 className={`fw-bold ${styles.errorCode}`}>404</h1>
      <h2 className="mb-3 text-dark fw-semibold">Oops! Page Not Found</h2>
      <p className="text-muted text-center w-75">
        The page you're looking for doesn't exist or has been moved. Please check the URL or return to the homepage.
      </p>
      <div className="d-flex gap-3">
        {/* Button to go back to the previous page */}
        <button onClick={handleGoBack} className="btn btn-secondary px-3 py-1 fw-semibold">
          Go Back to Previous Page
        </button>
        {/* Button to go to the home page or dashboard */}
        <button onClick={() => navigate(buttonRoute)} className="btn btn-primary px-3 py-1 fw-semibold">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default NotFound;