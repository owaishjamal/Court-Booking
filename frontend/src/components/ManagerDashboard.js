import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Search, FilterList, Refresh } from "@mui/icons-material";
import config from "../config";
import Sidebar from "./Sidebar";
import { useData } from "../context/DataContext";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const ManagerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCentre, setFilterCentre] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sports, setSports] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Use centralized data context
  const { centres, loading: dataLoading, error: dataError } = useData();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, filterCentre, filterSport, filterDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${config.API_URL}/api/User/getAllBookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data);
      setFilteredBookings(response.data);
      
      // Extract unique sports from bookings after they're loaded
      const uniqueSports = [...new Set(response.data.map(booking => booking.sport))];
      setSports(uniqueSports);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showSnackbar("Error fetching bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by search term (customer name, email, or centre)
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.centre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by centre
    if (filterCentre) {
      filtered = filtered.filter((booking) => booking.centre === filterCentre);
    }

    // Filter by sport
    if (filterSport) {
      filtered = filtered.filter((booking) => booking.sport === filterSport);
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter((booking) => booking.date.includes(filterDate));
    }

    setFilteredBookings(filtered);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleRefresh = () => {
    fetchBookings();
    showSnackbar("Bookings refreshed successfully", "success");
  };

  // Helper to get current time in IST
  function getNowInIST() {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 5.5 * 60 * 60 * 1000);
  }

  // Helper to parse formatted time string (e.g., "2:30 PM") to hours and minutes
  function parseFormattedTime(timeStr) {
    if (!timeStr) return { hour: 0, minute: 0 };
    
    // Handle 12-hour format like "2:30 PM" or "11:45 AM"
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return { hour, minute };
    }
    
    // Handle 24-hour format like "14:30"
    const timeMatch24 = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch24) {
      const hour = parseInt(timeMatch24[1]);
      const minute = parseInt(timeMatch24[2]);
      return { hour, minute };
    }
    
    return { hour: 0, minute: 0 };
  }

  const getStatusColor = (booking) => {
    let dateObj = booking.bookingDate ? new Date(booking.bookingDate) : new Date(booking.date);
    
    // Parse end time properly
    const { hour: endHour, minute: endMinute } = parseFormattedTime(booking.endTime);
    dateObj.setHours(endHour, endMinute, 0, 0);
    
    const nowIST = getNowInIST();
    if (dateObj < nowIST) {
      return "error"; // Completed
    }
    // If slot is today but not completed
    const todayIST = getNowInIST();
    todayIST.setHours(0, 0, 0, 0);
    const slotDay = new Date(booking.bookingDate || booking.date);
    slotDay.setHours(0, 0, 0, 0);
    if (slotDay.getTime() === todayIST.getTime()) {
      return "warning"; // Today
    }
    return "success"; // Upcoming
  };

  const getStatusText = (booking) => {
    let dateObj = booking.bookingDate ? new Date(booking.bookingDate) : new Date(booking.date);
    
    // Parse end time properly
    const { hour: endHour, minute: endMinute } = parseFormattedTime(booking.endTime);
    dateObj.setHours(endHour, endMinute, 0, 0);
    
    const nowIST = getNowInIST();
    if (dateObj < nowIST) {
      return "Completed";
    }
    const todayIST = getNowInIST();
    todayIST.setHours(0, 0, 0, 0);
    const slotDay = new Date(booking.bookingDate || booking.date);
    slotDay.setHours(0, 0, 0, 0);
    if (slotDay.getTime() === todayIST.getTime()) {
      return "Today";
    }
    return "Upcoming";
  };

  return (
    <Sidebar>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Manager Dashboard
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ color: "#666", mb: 3 }}>
          All Bookings Overview
        </Typography>

        {/* Filters and Search */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search by customer, email, or centre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Centre</InputLabel>
                  <Select
                    value={filterCentre}
                    onChange={(e) => setFilterCentre(e.target.value)}
                    label="Filter by Centre"
                  >
                    <MenuItem value="">All Centres</MenuItem>
                    {centres.map((centre) => (
                      <MenuItem key={centre._id} value={centre.name}>
                        {centre.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Sport</InputLabel>
                  <Select
                    value={filterSport}
                    onChange={(e) => setFilterSport(e.target.value)}
                    label="Filter by Sport"
                  >
                    <MenuItem value="">All Sports</MenuItem>
                    {sports.map((sport) => (
                      <MenuItem key={sport} value={sport}>
                        {sport}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Filter by Date"
                  placeholder="e.g., Monday, 25-12-2024"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton onClick={handleRefresh} color="primary">
                    <Refresh />
                  </IconButton>
                  <Typography variant="body2" sx={{ alignSelf: "center", color: "#666" }}>
                    {filteredBookings.length} bookings found
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                      Customer
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                      Centre & Location
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                      Sport & Court
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                      Time Slot
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                              {booking.customerName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {booking.customerEmail}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                              {booking.centre}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {booking.centreLocation}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                              {booking.sport}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Court: {booking.court}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {booking.date}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {dayjs(booking.startDateTimeIST).tz('Asia/Kolkata').format('hh:mm A')} - {dayjs(booking.endDateTimeIST).tz('Asia/Kolkata').format('hh:mm A')}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={getStatusText(booking)}
                            color={getStatusColor(booking)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body1" color="textSecondary">
                          No bookings found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Sidebar>
  );
};

export default ManagerDashboard; 