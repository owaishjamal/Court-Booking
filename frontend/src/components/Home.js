// Home.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  Box,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import Sidebar from "./Sidebar"; // Import the Sidebar component
import { Link } from "react-router-dom";
import config from '../config';
import { useData } from "../context/DataContext";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const Home = () => {
  const [users, setUsers] = useState([]); // New state for users
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableCourts, setAvailableCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userRole"); // Assuming 'userRole' holds 'manager' or 'customer'

  // State variables for loading and Snackbar

  const [selectedSlot, setSelectedSlot] = useState(null); // State to track the selected slot

  // Function to handle slot click and toggle selection
  const handleSlotSelection = (slot) => {
    console.log(slot);
    // If the clicked slot is already selected, deselect it
    if (selectedSlot && selectedSlot=== slot) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot); // Otherwise, select the new slot
    }
  };
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  // Use centralized data context
  const { centres, fetchSportsForCentre, loading: dataLoading, error: dataError } = useData();

  useEffect(() => {
    if (userType === "manager") {
      // Fetch data for manager
      fetchUsers();
    }
  }, [userType]);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/api/centres/getAllUsers/`
      );
      console.log(res);
      setUsers(res.data.count);
    } catch (err) {
      console.error("Error fetching centres:", err);
      setSnackbar({
        open: true,
        message: "Error fetching centres.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/api/User/getAllUsers`
      );
      setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      setSnackbar({
        open: true,
        message: "Error fetching users.",
        severity: "error",
      });
    }
  };

  // Existing functions for handling bookings
  const handleCentreChange = async (event) => {
    const centreId = event.target.value;
    const centre = centres.find((c) => c._id === centreId);
    setSelectedCentre(centre);
    setSelectedSport(null);
    setSelectedDate(null);
    setAvailableCourts([]);
    setAvailableSlots([]);
    setSelectedCourt(null);

    if (centre) {
      try {
        const sportsData = await fetchSportsForCentre(centre._id);
        setSports(sportsData);
      } catch (err) {
        console.error("Error fetching sports:", err);
        setSports([]);
      }
    }
  };

  const handleSportChange = (event) => {
    const sportId = event.target.value;
    const sport = sports.find((s) => s._id === sportId);
    setSelectedSport(sport);
    setSelectedDate(null);
    setAvailableCourts([]);
    setAvailableSlots([]);
    setSelectedCourt(null);
  };

  const fetchAvailableCourts = async () => {
    if (!selectedSport || !selectedDate) return;
    try {
      const res = await axios.get(
        `${config.API_URL}/api/centres/courts/${selectedCentre._id}/sport/${selectedSport._id}/available?date=${selectedDate}`
      );
      setAvailableCourts(res.data.availableCourts);
    } catch (err) {
      console.error("Error fetching available courts:", err);
      setAvailableCourts([]);
    }
  };

  const fetchAvailableSlots = async (courtId) => {
    if (!courtId || !selectedDate) return;

    try {
      const res = await axios.get(
        `${config.API_URL}/api/centres/${selectedCentre._id}/${selectedSport._id}/${courtId}/${selectedDate}/timeslots`
      );
      console.log(res.data);
      setAvailableSlots(res.data.availableSlots);
    } catch (err) {
      console.error("Error fetching available slots:", err);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    if (userType !== "manager") {
      fetchAvailableCourts();
    }
  }, [selectedSport, selectedDate, userType]);

  const handleCourtChange = (event) => {
    const courtId = event.target.value;
    const court = availableCourts.find((c) => c._id === courtId);
    setSelectedCourt(court);
    fetchAvailableSlots(courtId);
  };

  const handleSlotClick = (slot) => {
    if (selectedSlot && selectedSlot=== slot) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot); // Otherwise, select the new slot
    }
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setSelectedCourt((prev) => ({ ...prev, timeSlot: slot }));
  };

  const handleBooking = async () => {
    if (!selectedCourt || !selectedDate || !selectedSport || !selectedCentre||!startTime||!endTime) {
      setSnackbar({
        open: true,
        message: "Please complete all fields before booking.",
        severity: "warning",
      });
      return;
    }

    setLoading(true); // Start loading
    const getToken = localStorage.getItem("authToken");
    //console.log(getToken);
    axios.defaults.withCredentials = true;
    const bookingUrl = `${config.API_URL}/api/centres/book/${selectedCentre._id}/${selectedSport._id}/${selectedCourt._id}/${startTime}/${endTime}/${selectedDate}/${userId}`;
    try {
      const res = await axios.post(
        bookingUrl,
        {
          centre_id: selectedCentre._id,
          sport_id: selectedSport._id,
          court_id: selectedCourt._id,
          user_id: userId,
          date: selectedDate,
          startTime: startTime // e.g. "13:30"
        },
        {
          headers: {
            Authorization: `Bearer ${getToken}`,
          },
          withCredentials: true,
        }
      );
      
      console.log("Booking response:", res.data);
      setSnackbar({
        open: true,
        message: "Booking successful!",
        severity: "success",
      });
      fetchAvailableSlots(selectedCourt._id);
     setEndTime("");
     setStartTime("");
    } catch (err) {
      console.error("Error during booking:", err);
      setSnackbar({
        open: true,
        message: "Booking failed. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Sidebar>
      {/* Conditional Rendering Based on User Type */}
      {userType === "customer" ? (
        // Booking form for customers
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Book Your Game
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box component="form">
              <FormControl fullWidth margin="normal">
                <InputLabel id="centre-select-label">Select Centre</InputLabel>
                <Select
                  labelId="centre-select-label"
                  id="centre-select"
                  value={selectedCentre ? selectedCentre._id : ""}
                  onChange={handleCentreChange}
                  label="Select Centre"
                >
                  {centres.map((centre) => (
                    <MenuItem key={centre._id} value={centre._id}>
                      {centre.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" disabled={!selectedCentre}>
                <InputLabel id="sport-select-label">Select Sport</InputLabel>
                <Select
                  labelId="sport-select-label"
                  id="sport-select"
                  value={selectedSport ? selectedSport._id : ""}
                  onChange={handleSportChange}
                  label="Select Sport"
                >
                  {sports.map((sport) => (
                    <MenuItem key={sport._id} value={sport._id}>
                      {sport.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedSport && (
                <DatePicker
                  label="Select Date"
                  value={selectedDate ? dayjs(selectedDate) : null}
                  onChange={(newValue) => {
                    setSelectedDate(
                      newValue ? newValue.format("YYYY-MM-DD") : ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                  minDate={dayjs()}
                />
              )}

              {availableCourts.length > 0 && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="court-select-label">Select Court</InputLabel>
                  <Select
                    labelId="court-select-label"
                    id="court-select"
                    value={selectedCourt ? selectedCourt._id : ""}
                    onChange={handleCourtChange}
                    label="Select Court"
                  >
                    {availableCourts.map((court) => (
                      <MenuItem key={court._id} value={court._id}>
                        {court.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {selectedCourt && availableSlots.length > 0 && (
                <>
                  <Typography variant="h6" component="h4" gutterBottom>
                    Available Time Slots
                  </Typography>
                  <Grid container spacing={2}>
                    {availableSlots.map((slot, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                          sx={{
                            backgroundColor: selectedSlot && selectedSlot === slot
                              ? "#f8bbd0"
                              : slot.booked
                              ? "#f8d7da"
                              : "#d4edda",
                            cursor: slot.booked ? "not-allowed" : "pointer",
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6">
                              {slot.startDateTimeIST ? dayjs(slot.startDateTimeIST).tz('Asia/Kolkata').format('hh:mm A') : slot.startTime} - {slot.endDateTimeIST ? dayjs(slot.endDateTimeIST).tz('Asia/Kolkata').format('hh:mm A') : slot.endTime}
                            </Typography>
                            {slot.booked ? (
                              <Typography variant="body2" color="error">
                                Booked
                              </Typography>
                            ) : (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSlotClick(slot)}
                              >
                                Book this slot
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBooking}
                  disabled={
                    !selectedSlot||
                    !selectedCourt ||
                    !selectedDate ||
                    !selectedSport ||
                    !selectedCentre ||
                    !startTime ||
                    !endTime ||
                    loading // Disable button when loading

                  }
                >
                  {loading ? "Booking..." : "Book Court"}
                </Button>
                
                {/* Quick access to User Dashboard */}
                <Button
                  variant="outlined"
                  color="secondary"
                  component={Link}
                  to="/user-dashboard"
                  sx={{ ml: 2 }}
                >
                  View My Bookings
                </Button>
              </Box>
            </Box>
          </LocalizationProvider>

          {/* Loader */}
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          {/* Snackbar for success/error messages */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      ) : userType === "manager" ? (
        // Display two cards for manager
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Manager Dashboard
          </Typography>
          <Grid container spacing={4}>
            {/* Card for Centres */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    Centres
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    Total Centres: {centres.length}
                  </Typography>
                  {/* You can add more details or a link to manage centres */}
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    component={Link}
                    to="/ManageCentres"
                  >
                    Manage Centres
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            {/* Card for Users */}
            <Grid item xs={12} sm={6}>
              
            </Grid>
          </Grid>

          {/* Loader */}
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          {/* Snackbar for success/error messages */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      ) : (
        // For other user types or if userType is not set
        <Container maxWidth="md">
          <Alert severity="warning">
            User type not recognized. Please contact support.
          </Alert>
        </Container>
      )}
    </Sidebar>
  );
};

export default Home;
