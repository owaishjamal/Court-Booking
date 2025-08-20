// ForgotPassword.js
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
import { useNavigate } from "react-router-dom";
import config from "../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // Success or error message
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);

    try {
      const response = await axios.post(
        `${config.API_URL}/api/auth/forgotPassword`,
        {
          email,
        }
      );
      //  console.log(response)
      setMessage(
        "If this email is registered, you will receive a password reset link shortly."
      );
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

    setEmail("");
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
          Forgot Password
        </Typography>

        {/* Display message if any */}
        {message && (
          <Alert
            severity={
              message.includes("receive a password reset link")
                ? "success"
                : "error"
            }
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
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <Button fullWidth variant="text" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
