// LandingPage.js
import React from "react";
import { Box, Button, Typography, Container, Grid, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  root: {
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontWeight: "bold",
    color: "#1976d2",
    fontSize: "3rem",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#555",
    fontSize: "1.2rem",
    marginBottom: "20px",
  },
  card: {
    padding: "30px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1976d2",
    color: "#fff",
    fontWeight: "bold",
    padding: "12px 30px",
    marginTop: "20px",
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  },
  link: {
    textDecoration: "none",
    color: "inherit",
  },
});

const LandingPage = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container maxWidth="sm">
        <div className={classes.header}>
          <Typography variant="h2" className={classes.title}>Court Booking System</Typography>
          <Typography variant="h6" className={classes.subtitle}>
            Easily book your preferred court slot for sports and activities.
          </Typography>
        </div>

        <Paper className={classes.card}>
          <Typography variant="h5" color="textPrimary" gutterBottom>
            Welcome to the Court Booking System
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Book courts for sports like Tennis, Basketball, and more. Check availability, 
            select your preferred time, and confirm your booking with just a few clicks.
          </Typography>

          <Link to="/login" className={classes.link}>
            <Button variant="contained" className={classes.button}>
              Login to Book Now
            </Button>
          </Link>
        </Paper>

        <Box mt={5}>
          <Typography variant="body2" color="textSecondary" align="center">
            © 2025 Court Booking System. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default LandingPage;
