// AddCentre.js
import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import Sidebar from "./Sidebar";
import config from "../config";

const AddCentre = () => {
  const [centreName, setCentreName] = useState("");
  const [location, setLocation] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const addCentre = async () => {
    // Validate inputs
    if (!centreName.trim() || !location.trim()) {
      showMessage("Please fill in all fields", "warning");
      return;
    }

    const getToken = localStorage.getItem("authToken");
    
    if (!getToken) {
      showMessage("You are not logged in or your session has expired", "error");
      return;
    }

    try {
      const response = await axios.post(
        `${config.API_URL}/api/centres/add-centres`,
        {
          name: centreName,
          location,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken}`,
            "Content-Type": "application/json"
          },
          withCredentials: true,
        }
      );
      
      setCentreName("");
      setLocation("");
      showMessage("Centre added successfully", "success");
    } catch (err) {
      showMessage(
        err.response ? err.response.data.message || "Error adding centre" : "Network error",
        "error"
      );
    }
  };

  return (
    <Sidebar>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Add Centre
        </Typography>
        <Box component="form" sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Centre Name"
            value={centreName}
            onChange={(e) => setCentreName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            margin="normal"
            required
          />
          <Button
            variant="contained"
            onClick={addCentre}
            fullWidth
            sx={{ mt: 2 }}
          >
            Add Centre
          </Button>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Sidebar>
  );
};

export default AddCentre;