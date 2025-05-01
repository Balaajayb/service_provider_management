import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  styled
} from "@mui/material";
import { Notifications as NotificationsIcon, AccountCircle, Logout, Settings } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const DarkAppBar = styled(AppBar)({
  backgroundColor: "#1a2639", // Darker blue-gray color
  boxShadow: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.12)"
});

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      sessionStorage.clear();
      delete axios.defaults.headers.common['Authorization'];
      
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then(names => names.forEach(name => caches.delete(name)));
        navigator.serviceWorker.getRegistrations()
          .then(registrations => registrations.forEach(reg => reg.unregister()));
      }
      
      toast.success("Logged out successfully");
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout completely");
    }
  };

  return (
      <DarkAppBar position="static">
      <Toolbar sx={{ justifyContent: "flex-end" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* <IconButton size="large" color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton> */}
          
          <IconButton
            size="large"
            aria-label="account"
            onClick={handleMenu}
            color="inherit"
            sx={{ p: 0 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                overflow: 'hidden', // Prevents scrollbar
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  typography: 'body2',
                },
              },
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => {
              navigate("/admin/settings");
              handleClose();
            }}>
              <Settings sx={{ mr: 1.5, fontSize: 20 }} /> 
              Settings
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleLogout}
              sx={{ color: 'error.main' }}
            >
              <Logout sx={{ mr: 1.5, fontSize: 20 }} /> 
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </DarkAppBar>
  );
};

export default Header;