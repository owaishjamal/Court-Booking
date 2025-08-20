// UserProfile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Box,
  Backdrop,
  CircularProgress,
  Button,
  Alert,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import config from '../config';
import EditIcon from '@mui/icons-material/Edit';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true); // Loading state
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userResponse = await axios.get(
          `${config.API_URL}/api/User/getUserDetailS/${userId}`
        );
        setUser(userResponse.data);
        setLoading(false); // Stop loading after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchData();
  }, [navigate, userId]);

  const handleEditOpen = () => {
    setNewName(user?.name || "");
    setError("");
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setError("");
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.patch(`${config.API_URL}/api/User/updateName/${userId}`, { name: newName });
      setUser(res.data.user);
      setEditOpen(false);
    } catch (err) {
      setError("Failed to update name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sidebar>
      <Container maxWidth="md">
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            {/* User Profile Card */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardHeader
                  title="User Profile"
                  sx={{
                    textAlign: "center",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: "bold",
                    color: "#6610f2",
                  }}
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Name:"
                        secondary={user?.name || "N/A"}
                      />
                      <IconButton aria-label="edit" onClick={handleEditOpen} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Email:"
                        secondary={user?.email || "N/A"}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Role:"
                        secondary={user?.role || "N/A"}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Dashboard Link for Customers */}
            {user?.role === "customer" && (
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        View and manage your court bookings in the dedicated dashboard.
                      </Typography>
                    </Alert>
                    <Box sx={{ textAlign: "center" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/user-dashboard"
                        sx={{ 
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: "bold"
                        }}
                      >
                        View My Bookings Dashboard
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Edit Name Dialog */}
        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle>Edit Name</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              value={newName}
              onChange={handleNameChange}
              disabled={saving}
              error={!!error}
              helperText={error}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose} disabled={saving}>Cancel</Button>
            <Button onClick={handleSaveName} variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loader */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Container>
    </Sidebar>
  );
};

export default UserProfile;
