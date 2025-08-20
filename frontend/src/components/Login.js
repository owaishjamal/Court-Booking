// Login.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "../config";

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
import { useNavigate, Link } from "react-router-dom";
// import FacebookIcon from "@mui/icons-material/Facebook";
// import GoogleIcon from "mdi-material-ui/Google"; // Import GoogleIcon

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let timer;
    if (errorMessage) {
      timer = setTimeout(() => {
        if (isMounted.current) setErrorMessage("");
      }, 4000);
    }
    return () => {
      isMounted.current = false;
      if (timer) clearTimeout(timer);
    };
  }, [errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMounted.current) return;
    setErrorMessage("");
    setLoading(true);

    try {
      console.log("Login API URL:", `${config.API_URL}/api/auth/login`);

      const response = await axios.post(
        `${config.API_URL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true, // ✅ IMPORTANT FOR COOKIES & CORS
        }
      );

      console.log("Login successful", response.data);

      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("authToken", response.data.authToken);
      localStorage.setItem("userRole", response.data.user.role);

      // Dispatch custom event to trigger data initialization
      window.dispatchEvent(new CustomEvent('userLoggedIn'));

      if (isMounted.current) navigate("/home");
    } catch (error) {
      if (!isMounted.current) return;
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Invalid email or password.");
        } else if (error.response.status === 500) {
          setErrorMessage("Server error. Unable to login. Please try again.");
        } else {
          setErrorMessage(
            error.response.data.message ||
              "Login failed. Please check your credentials."
          );
        }
      } else if (error.request) {
        setErrorMessage("No response from the server. Please try again.");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
    if (isMounted.current) setEmail("");
    if (isMounted.current) setPassword("");
  };

  return (
    <Container component="main" maxWidth="xs">
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
          Login
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {errorMessage}
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

          <TextField
            margin="normal"
            fullWidth
            required
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Typography variant="body2" align="right">
            <Link to="/forgotPassword" style={{ textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ textDecoration: "none" }}>
              Register here
            </Link>
          </Typography>
        </Box>

        {/* Social sign-in examples (disabled)
        <Divider sx={{ my: 2, width: "100%" }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{ mb: 1 }}
        >
          Sign in with Google
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<FacebookIcon sx={{ color: "#4267B2" }} />}
        >
          Sign in with Facebook
        </Button> */}
      </Box>
    </Container>
  );
};

export default Login;
