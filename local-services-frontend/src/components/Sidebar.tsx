import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Handshake as HandshakeIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Build as BuildIcon, // Worker Management
  PersonAdd as PersonAddIcon, // Add Worker
  Star as StarIcon, // Ratings
  Receipt as ReceiptIcon, // Transactions
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { text: "Dashboard", icon: <HomeIcon />, path: "/admin/dashboard" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Services", icon: <HandshakeIcon />, path: "/admin/services" },
    { text: "Bookings", icon: <TimelineIcon />, path: "/admin/bookings" },
    { text: "Workers", icon: <BuildIcon />, path: "/admin/workers" },
    { text: "Ratings", icon: <StarIcon />, path: "/admin/ratings" },
    { text: "Transactions", icon: <ReceiptIcon />, path: "/admin/transactions" },
    { text: "Settings", icon: <SettingsIcon />, path: "/admin/settings" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 70 : 250,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: isCollapsed ? 70 : 250,
          boxSizing: "border-box",
          backgroundColor: "#1e1e2d",
          color: "#fff",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: isCollapsed ? "center" : "flex-end",
          alignItems: "center",
          height: "64px",
          padding: "6px",
        }}
      >
        <IconButton onClick={toggleSidebar} sx={{ color: "#fff" }}>
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: isCollapsed ? "center" : "flex-start" }}>
        <List sx={{ width: "100%", transition: "all 0.3s ease" }}>
          {menuItems.map((item, index) => (
            <ListItem
              button
              key={index}
              sx={{
                justifyContent: isCollapsed ? "center" : "flex-start",
                mb: 1,
                height: "48px", // Fixed height
                transition: "all 0.3s ease", // Smooth transition
                "&:hover": { backgroundColor: "#444", cursor: "pointer" },
              }}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon sx={{ minWidth: "auto", mr: isCollapsed ? 0 : 2, color: "#fff", transition: "all 0.3s ease" }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: isCollapsed ? 0 : 1,
                    transition: "opacity 0.3s ease",
                    whiteSpace: "nowrap", // Prevent text from breaking
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </div>
    </Drawer>
  );
};

export default Sidebar;