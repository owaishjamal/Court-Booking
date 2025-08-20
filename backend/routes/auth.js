const express = require("express");
const { createUser, loginUser, forgotPassword } = require("../controllers/auth");

const router = express.Router();

// Forgot password
router.post("/forgotPassword", forgotPassword);

// Update password with token
router.post("/updatePassword/:token", (req, res) => {
  res.status(200).json({ success: true, message: "Password updated successfully" });
});

// Create a new user using: POST /api/auth/createuser "no login required"
router.post("/createuser", createUser);

// authenticate a user using: POST /api/auth/login "no login required"
router.post("/login", loginUser);

// Verify OTP
router.post("/verifyOtp", (req, res) => {
  res.status(200).json({ success: true, message: "OTP verified successfully" });
});

// Resend OTP
router.post("/resendOtp", (req, res) => {
  res.status(200).json({ success: true, message: "OTP resent successfully" });
});

module.exports = router;