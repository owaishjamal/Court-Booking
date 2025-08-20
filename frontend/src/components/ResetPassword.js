// ResetPassword.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Backdrop,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import config from '../config';


const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""); // Success or error message
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Basic validation
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${config.API_URL}/api/auth/updatePassword/${token}`,
        {
          password,
        }
      );

      setMessage("Your password has been reset successfully.");

      // Optionally, redirect to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error) {
      if (error.response) {
        setMessage(
          error.response.data.message ||
            "An error occurred. Please try again later."
        );
      } else if (error.request) {
        setMessage("No response from the server. Please try again.");
      } else {
        setMessage("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }

    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Container component="main" maxWidth="xs">
      {/* Loader */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Reset Password
        </Typography>

        {/* Display message if any */}
        {message && (
          <Alert
            severity={message.includes("successfully") ? "success" : "error"}
            sx={{ width: "100%", mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            required
            label="New Password"
            name="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            margin="normal"
            fullWidth
            required
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;
