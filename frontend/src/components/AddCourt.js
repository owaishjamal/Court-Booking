// AddCourt.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
} from "@mui/material";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
// const API_URL =
//   process.env.NODE_ENV === "development"
//     ? process.env.REACT_APP_GLOBALURL
//     : process.env.REACT_APP_GLOBALURL;

const AddCourt = () => {
  const [sports, setSports] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [courtName, setCourtName] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  // Use centralized data context
  const { centres, fetchSportsForCentre, refreshData } = useData();

  useEffect(() => {
    // Check if the user is a manager
    const userType = localStorage.getItem("userRole");
    if (userType !== "manager") {
      // Redirect to home or show an error
      navigate("/home");
    }
  }, [navigate]);

  const fetchSports = async (centreId) => {
    try {
      const sportsData = await fetchSportsForCentre(centreId);
      setSports(sportsData || []);
    } catch (err) {
      showMessage("Error fetching sports", "error");
    }
  };

  const showMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const addCourt = async () => {
    if (!selectedSport || !courtName) {
      showMessage("Please fill in all fields", "warning");
      return;
    }
    const getToken = localStorage.getItem("authToken");
    try {
      await axios.post(
        `${config.API_URL}/api/centres/add-court/${selectedSport}`,
        {
          name: courtName,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken}`,
          },
        }
      );
      setCourtName("");
      setSelectedSport("");
      setSports([]);
      await refreshData(); // Refresh the cache
      showMessage("Court added successfully", "success");
    } catch (err) {
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Error adding court";
      showMessage(errorMessage, "error");
    }
  };

  return (
    <Sidebar>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Add Court
        </Typography>
        <Box component="form" sx={{ mt: 3 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Centre</InputLabel>
            <Select
              value={selectedCentre}
              onChange={(e) => {
                setSelectedCentre(e.target.value);
                setSelectedSport("");
                setSports([]);
                fetchSports(e.target.value);
              }}
            >
              {centres.map((centre) => (
                <MenuItem key={centre._id} value={centre._id}>
                  {centre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            fullWidth
            margin="normal"
            disabled={!selectedCentre || centres.length === 0}
          >
            <InputLabel>Select Sport</InputLabel>
            <Select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
            >
              {sports.map((sport) => (
                <MenuItem key={sport._id} value={sport._id}>
                  {sport.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Court Name"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
            margin="normal"
            disabled={!selectedSport}
          />
          <Button
            variant="contained"
            onClick={addCourt}
            fullWidth
            sx={{ mt: 2 }}
            disabled={!selectedSport || !courtName}
          >
            Add Court
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

export default AddCourt;
