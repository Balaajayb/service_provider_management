import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/UserHeader";
import Footer from "../components/Footer"; // Import the Footer component

const UserLayout = () => {
  return (
    <div>
      {/* Header */}
      <Header />

      {/* Nested Routes will be rendered here */}
      <div style={{minHeight: "80vh" }}>
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserLayout;