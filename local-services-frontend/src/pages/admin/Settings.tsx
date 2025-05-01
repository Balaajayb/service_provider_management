import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
} from "@mui/material";

const Settings = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", severity: "error" });

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setMessage({ text: "Not authorized. Please login.", severity: "error" });
          return;
        }

        const response = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        // Debugging: Log the full API response
        console.log("Admin profile response:", response.data);

        if (response.data.success && response.data.admin) {
          setAdminEmail(response.data.admin.admin_email || "");
        } else {
          setMessage({ 
            text: response.data.message || "Failed to fetch admin details", 
            severity: "error" 
          });
        }
      } catch (error) {
        console.error("Fetch admin error:", error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem("adminToken");
          setMessage({ 
            text: "Session expired. Please login again.", 
            severity: "error" 
          });
        } else {
          setMessage({ 
            text: error.response?.data?.message || "Error fetching admin details", 
            severity: "error" 
          });
        }
      }
    };

    fetchAdmin();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      return setMessage({ 
        text: "Please enter your current password.", 
        severity: "error" 
      });
    }

    if (newPassword && newPassword !== confirmPassword) {
      return setMessage({ 
        text: "New passwords do not match.", 
        severity: "error" 
      });
    }

    setLoading(true);
    setMessage({ text: "", severity: "error" });

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return setMessage({ 
          text: "Not authorized. Please login.", 
          severity: "error" 
        });
      }

      const updateData = { currentPassword };
      if (newEmail) updateData.newEmail = newEmail;
      if (newPassword) updateData.newPassword = newPassword;

      const response = await axios.put(
        "http://localhost:5000/api/admin/update",
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );

      // Debugging: Log the update response
      console.log("Update response:", response.data);

      if (response.data.success) {
        setMessage({ 
          text: response.data.message || "Settings updated successfully", 
          severity: "success" 
        });
        
        // Update the email display if it was changed
        if (response.data.admin?.admin_email) {
          setAdminEmail(response.data.admin.admin_email);
        }
        
        // Clear form fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ 
          text: response.data.message || "Failed to update settings", 
          severity: "error" 
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        setMessage({ 
          text: "Session expired. Please login again.", 
          severity: "error" 
        });
      } else {
        setMessage({ 
          text: error.response?.data?.message || "Failed to update settings", 
          severity: "error" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, margin: "auto", mt: 1, p: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom>
          Admin Settings
        </Typography>
        <Divider sx={{ my: 2 }} />

        {message.text && (
          <Typography 
            color={message.severity === "error" ? "error" : "primary"} 
            variant="body2" 
            align="center"
            sx={{ mb: 2 }}
          >
            {message.text}
          </Typography>
        )}

        <form autoComplete="off" onSubmit={handleUpdate}>
          <Grid container spacing={3}>
            {/* Email Section */}
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                Admin Email
              </Typography>
              <TextField
                label="Current Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={adminEmail || "Loading..."}
                disabled
                InputLabelProps={{ shrink: !!adminEmail }}
              />
              <TextField
                label="New Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="off"
                name="emailInputX"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Password Section */}
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                Update Password
              </Typography>
              <TextField
                label="Current Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="new-password"
                name="passInputY"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="New Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                name="passInputZ"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                name="passInputW"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Settings;