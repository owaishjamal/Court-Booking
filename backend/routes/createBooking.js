const express = require("express");
const {
  getAvailableSlots,
  createBooking,
} = require("../controllers/createBooking");
const router = express.Router();

// Create a new user using: POST /api/auth/createuser "no login required"
router.post("/booking", getAvailableSlots);
router.post("/createBook", createBooking);
module.exports = router;
