import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flexGrow: 1 }}>
        {/* Header */}
        <Header />

        {/* Nested Routes will be rendered here */}
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;