import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { 
  FaUsers, 
  FaHandshake, 
  FaChartLine, 
  FaMoneyBillAlt, 
  FaTools,
  FaChevronRight
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  const [stats, setStats] = useState({
    services: 0,
    workers: 0,
    users: 0,
    bookings: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/dashboard/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err.message);
      }
    };
  
    fetchStats();
  }, []);

  // Card component for reusability
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    onClick,
    isRevenue = false,
    growth = "+12% from last month"
  }) => (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderLeft: `4px solid ${color}`,
        minHeight: "200px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <div style={{
          backgroundColor: `${color}20`,
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "15px"
        }}>
          <Icon style={{ color, fontSize: "20px" }} />
        </div>
        <h3 style={{ 
          margin: 0, 
          color: "#6c757d",
          fontSize: "16px",
          fontWeight: "500"
        }}>
          {title}
        </h3>
      </div>
      
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#2c3e50",
          margin: "10px 0"
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        
        {isRevenue ? (
          <div style={{ marginTop: "20px" }}>
            <div style={{
              height: "6px",
              background: "linear-gradient(90deg, #f0f0f0, #f0f0f0)",
              borderRadius: "3px",
              marginBottom: "8px",
              overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: "65%",
                background: `linear-gradient(90deg, ${color}, ${color})`,
                borderRadius: "3px"
              }}></div>
            </div>
            <p style={{ 
              fontSize: "14px",
              color: "#6c757d",
              margin: 0
            }}>{growth}</p>
          </div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            color: color,
            marginTop: "20px",
            fontWeight: "500"
          }}>
            <span>View details</span>
            <FaChevronRight style={{ marginLeft: "5px", fontSize: "14px" }} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: "30px",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ 
          color: "#2c3e50",
          fontWeight: "600",
          marginBottom: "5px"
        }}>
          Dashboard Overview
        </h2>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <StatCard 
          title="Services" 
          value={stats.services} 
          icon={FaHandshake} 
          color="#2ecc71"
          onClick={() => handleCardClick("/admin/services")}
        />
        
        <StatCard 
          title="Workers" 
          value={stats.workers} 
          icon={FaTools} 
          color="#f39c12"
          onClick={() => handleCardClick("/admin/workers")}
        />
        
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={FaUsers} 
          color="#3498db"
          onClick={() => handleCardClick("/admin/users")}
        />
        
        <StatCard 
          title="Total Bookings" 
          value={stats.bookings} 
          icon={FaChartLine} 
          color="#e74c3c"
          onClick={() => handleCardClick("/admin/bookings")}
        />
      </div>
    </div>
  );
};

export default Dashboard;