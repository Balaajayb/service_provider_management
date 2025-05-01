import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  isAdmin?: boolean;
}

const ProtectedRoute = ({ children, isAdmin = false }: ProtectedRouteProps) => {
  // Temporarily bypass auth guard for development
  return children;

  // Uncomment this code later to re-enable the auth guard
  /*
  const user = JSON.parse(localStorage.getItem("user") || null);
  const location = useLocation();

  if (!user) {
    const loginPath = isAdmin ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (isAdmin && user.role !== "admin") {
    return <Navigate to="/user/home" replace />;
  }

  if (!isAdmin && user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
  */
};

export default ProtectedRoute;