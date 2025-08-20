import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert, // Added Snackbar and Alert for messages
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { useData } from "../context/DataContext";
// const API_URL =
//   process.env.NODE_ENV === "development"
//     ? process.env.REACT_APP_GLOBALURL
//     : process.env.REACT_APP_GLOBALURL;


const AdminPage = () => {
  const navigate = useNavigate();
 
  const [centreName, setCentreName] = useState("");
  const [location, setLocation] = useState("");
  const [sportName, setSportName] = useState("");
  const [courtName, setCourtName] = useState("");
  const [selectedCentre, setSelectedCentre] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [activeForm, setActiveForm] = useState(""); // Tracks which form to display
  const [sportsAtCentre, setSportAtCentre] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // "success" or "error"

  // Use centralized data context
  const { centres, fetchSportsForCentre, refreshData } = useData();

  const fetchSports = async () => {
    try { 
      console.log(selectedCentre+"dcds");
      const sportsData = await fetchSportsForCentre(selectedCentre);
      console.log(sportsData);
      setSportAtCentre(sportsData);
    } catch (err) {
      showMessage("Error fetching centres", "error");
    }
  };

  const showMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const addCentre = async () => {
    try {
      await axios.post(
        `${config.API_URL}/api/centres/add-centres`,
        {
          name: centreName,
          location,
        }
      );
      setCentreName("");
      setLocation("");
      await refreshData(); // Refresh the cache
      setActiveForm(""); // Reset form view
      showMessage("Centre added successfully", "success");
    } catch (err) {
      showMessage("Error adding centre", "error");
    }
  };

  const addSport = async () => {
    if (!selectedCentre) return;
    try {
      await axios.post(
        `${config.API_URL}/api/centres/add-sport/${selectedCentre}/${sportName}`,
        {
          name: sportName,
        }
      );
      setSportName("");
      await refreshData(); // Refresh the cache
      setActiveForm(""); // Reset form view
      showMessage("Sport added successfully", "success");
    } catch (err) {
      showMessage("Error adding sport", "error");
    }
  };

  const addCourt = async () => {
    if (!selectedSport) return;
    try {
      await axios.post(
        `${config.API_URL}/api/centres/add-court/${selectedSport}`,
        {
          
          name: courtName,
        }
      );
      setCourtName("");
      await refreshData(); // Refresh the cache
      setActiveForm(""); // Reset form view
      showMessage("Court added successfully", "success");
    } catch (err) {
      showMessage("Error adding court", "error");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            onClick={() => setActiveForm("centre")}
            fullWidth
          >
            Add Centre
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            onClick={() => setActiveForm("sport")}
            fullWidth
          >
            Add Sport
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            onClick={() => setActiveForm("court")}
            fullWidth
          >
            Add Court
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/manager-dashboard')}
            fullWidth
          >
            View All Bookings
          </Button>
        </Grid>
      </Grid>

      <Box mt={4}>
        {activeForm === "centre" && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Centre
              </Typography>
              <TextField
                fullWidth
                label="Centre Name"
                value={centreName}
                onChange={(e) => setCentreName(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                margin="normal"
              />
              <Button variant="contained" onClick={addCentre} fullWidth>
                Add Centre
              </Button>
            </CardContent>
          </Card>
        )}

        {activeForm === "sport" && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Sport
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Centre</InputLabel>
                <Select
                  value={selectedCentre}
                  onChange={(e) => setSelectedCentre(e.target.value)}
                >
                  {!centres.centres && (
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                  )}
                  {centres.centres.map((centre) => (
                    <MenuItem key={centre._id} value={centre._id}>
                      {centre.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Sport Name"
                value={sportName}
                onChange={(e) => setSportName(e.target.value)}
                margin="normal"
                disabled={!selectedCentre}
              />
              <Button
                variant="contained"
                onClick={addSport}
                fullWidth
                disabled={!selectedCentre}
              >
                Add Sport
              </Button>
            </CardContent>
          </Card>
        )}

        {activeForm === "court" && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Court
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Centre</InputLabel>
                <Select
                  value={selectedCentre}
                  onChange={(e) => setSelectedCentre(e.target.value)}
                >
                  {!centres.centres && (
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                  )}
                  {centres.centres.map((centre) => (
                    <MenuItem key={centre._id} value={centre._id} onClick={fetchSports}>
                      {centre.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" disabled={!selectedCentre}>
                <InputLabel>Select Sport</InputLabel>
                <Select
                 
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  disabled={!selectedCentre}
                >
                  {!sportsAtCentre && (
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                  )}
                  {sportsAtCentre.map((sport) => (
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
                disabled={!selectedSport}
              >
                Add Court
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPage;
