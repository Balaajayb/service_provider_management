import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner"; 

// Lazy-loaded components
const UserLogin = lazy(() => import("../pages/auth/UserLogin"));
const UserRegister = lazy(() => import("../pages/auth/UserRegister"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const AdminLogin = lazy(() => import("../pages/auth/AdminLogin"));
const NotFound = lazy(() => import("../pages/NotFound"));

const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Users = lazy(() => import("../pages/admin/Users"));
const Services = lazy(() => import("../pages/admin/Services"));
const Bookings = lazy(() => import("../pages/admin/Bookings"));
const Workers = lazy(() => import("../pages/admin/Workers"));
const Ratings = lazy(() => import("../pages/admin/Ratings"));
const Transactions = lazy(() => import("../pages/admin/Transactions"));
const Settings = lazy(() => import("../pages/admin/Settings"));

const Home = lazy(() => import("../pages/user/Home"));
const ServicesPage = lazy(() => import("../pages/user/Services"));
const BookingsPage = lazy(() => import("../pages/user/Bookings"));
const ProfilePage = lazy(() => import("../pages/user/Profile"));
const RatingsPage = lazy(() => import("../pages/user/Ratings"));
const MyBookings = lazy(()=> import("../pages/user/MyBookings"));
// const NotificationsPage = lazy(() => import("../pages/user/NotificationsPage"));
// const SupportPage = lazy(() => import("../pages/user/SupportPage"));

const AppRoutes = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Redirect root path to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected User Routes */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="mybookings" element={<MyBookings />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="ratings" element={<RatingsPage />} />
            {/* <Route path="notifications" element={<NotificationsPage />} /> */}
            {/* <Route path="support" element={<SupportPage />} /> */}
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            {/* <Route path="users/edit/:userId" element={<EditUser />} /> */}
            <Route path="services" element={<Services />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="workers" element={<Workers />} />
            {/* <Route path="workers/add" element={<AddWorker />} /> */}
            <Route path="ratings" element={<Ratings />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;