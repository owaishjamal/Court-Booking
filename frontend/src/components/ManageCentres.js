// ManageCentres.js

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import Sidebar from "./Sidebar"; // Import the Sidebar component
import config from "../config";
import { useData } from "../context/DataContext";

const ManageCentres = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Use centralized data context
  const { centres, loading: dataLoading, error: dataError } = useData();

  console.log(centres);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Sidebar>
      <Container maxWidth="lg">
        <Box mt={4} mb={2}>
          <Typography variant="h4" component="h2" align="center">
            Available Centres
          </Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center">
          {centres.map((centre) => (
            <Grid item key={centre._id}>
              <Card
                sx={{
                  width: 300,
                  height: 200, // Adjusted height since image is removed
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {centre.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Location: {centre.location}
                  </Typography>
                  {/* Display list of sports */}
                  {/* <Typography variant="body2" color="textSecondary" mt={1}>
                    Sports Offered:
                  </Typography>
                  <Box mt={1}>
                    {centre.sports.map((sport) => (
                      <Typography
                        key={sport._id}
                        variant="body2"
                        color="textSecondary"
                      >
                        • {sport.name}
                      </Typography>
                    ))}
                  </Box> */}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Loader */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={!!dataLoading.centres}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Snackbar for success/error messages */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
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
    </Sidebar>
  );
};

export default ManageCentres;
