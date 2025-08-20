// Register.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import config from '../config';

import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Backdrop,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";


const Register = () => {
  const [step, setStep] = useState(1); // 1: Register, 2: Verify OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" }); // Unified message state
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const validateForm = () => {
    if (name.length < 2) {
      setMessage({
        type: "error",
        text: "Name must be at least 2 characters long.",
      });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return false;
    } else if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return false;
    }
    setMessage({ type: "", text: "" });
    return true;
  };

  // Function to clear the message after 4 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 4000); // Clear message after 4 seconds

      return () => clearTimeout(timer); // Clean up the timer if component unmounts
    }
  }, [message]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return; // Do not proceed if validation fails
    }

    setLoading(true); // Start loader

    try {
      const response = await axios.post(
        `${config.API_URL}/api/auth/createuser`,
        {
          name,
          email,
          password,
          role,
        }
      );

      setStep(2); // Move to OTP verification step
      setMessage({
        type: "success",
        text: "Registration successful! OTP has been sent to your email.",
      });
    } catch (error) {
      if (error.response) {
        // Backend responded with a status other than 2xx
        setMessage({
          type: "error",
          text: error.response.data.message || "Email already used.",
        });
      } else if (error.request) {
        // Request was made but no response received
        setMessage({
          type: "error",
          text: "No response from the server. Please try again.",
        });
      } else {
        // Something else caused the error
        setMessage({ type: "error", text: error.message });
      }
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit OTP." });
      return;
    }

    setLoading(true); // Start loader

    try {
      const response = await axios.post(
        `${config.API_URL}/api/auth/verifyOtp`,
        {
          email,
          otp,
        }
      );

      console.log("OTP verification successful", response.data);

      // Set success message and wait before redirecting
      setMessage({
        type: "success",
        text: "OTP verified successfully! Redirecting to login page...",
      });

      // Optionally, disable the OTP form or set a flag to hide it
      setOtp(""); // Clear the OTP input
      setStep(3); // Move to a new step if needed to display only the message

      // Wait for 3 seconds before redirecting
      setTimeout(() => {
        navigate("/login", { state: { verified: true } });
      }, 3000); // 3000 milliseconds = 3 seconds
    } catch (error) {
      if (error.response) {
        setMessage({
          type: "error",
          text: error.response.data.message || "Invalid OTP.",
        });
      } else if (error.request) {
        setMessage({
          type: "error",
          text: "No response from the server. Please try again.",
        });
      } else {
        setMessage({ type: "error", text: error.message });
      }
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const handleResendOtp = async () => {
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const response = await axios.post(
        `${config.API_URL}/api/auth/resendOtp`,
        {
          email,
        }
      );

      console.log("OTP resend successful", response.data);
      setMessage({
        type: "success",
        text: "OTP has been resent to your email.",
      });
    } catch (error) {
      if (error.response) {
        setMessage({
          type: "error",
          text: error.response.data.message || "Failed to resend OTP.",
        });
      } else if (error.request) {
        setMessage({
          type: "error",
          text: "No response from the server. Please try again.",
        });
      } else {
        setMessage({ type: "error", text: error.message });
      }
    } finally {
      setLoading(false);
    }
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
        <Typography component="h1" variant="h4" gutterBottom>
          {step === 1
            ? "Register"
            : step === 2
            ? "Verify OTP"
            : "Verification Successful"}
        </Typography>

        {/* Display message if any */}
        {message.text && (
          <Alert severity={message.type} sx={{ width: "100%", mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* Registration Form */}
        {step === 1 && (
          <Box
            component="form"
            onSubmit={handleRegisterSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              fullWidth
              required
              label="Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              margin="normal"
              fullWidth
              required
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              margin="normal"
              fullWidth
              required
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? "Registering..." : "Register"}
            </Button>

            <Typography variant="body2" align="center">
              Already have an account?{" "}
              <Link to="/login" style={{ textDecoration: "none" }}>
                Login here
              </Link>
            </Typography>

            {/* Divider */}
            {/* <Divider sx={{ my: 3, width: "100%" }}>OR</Divider> */}

            {/* Social Sign-In Buttons */}
            <Box
              sx={{ width: "100%", display: "flex", flexDirection: "column" }}
            >
              {/* <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{ mb: 1 }}
                // onClick={handleGoogleSignIn} // Implement when ready
              >
                Sign in with Google
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon sx={{ color: "#4267B2" }} />}
                // onClick={handleFacebookSignIn} // Implement when ready
              >
                Sign in with Facebook
              </Button> */}
            </Box>
          </Box>
        )}

        {/* OTP Verification Form */}
        {step === 2 && (
          <Box
            component="form"
            onSubmit={handleOtpSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <Typography variant="body1" align="center" gutterBottom>
              An OTP has been sent to your email: <strong>{email}</strong>
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              required
              label="Enter OTP"
              name="otp"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <Typography variant="body2" align="center">
              Didn't receive the OTP?{" "}
              <Button
                variant="text"
                onClick={handleResendOtp}
                sx={{ textTransform: "none" }}
              >
                Resend
              </Button>
            </Typography>
          </Box>
        )}

        {/* Verification Success Message */}
        {step === 3 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Your account has been successfully verified!
            </Typography>
            <Typography variant="body1" align="center">
              Redirecting to the login page...
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Register;
