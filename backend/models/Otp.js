// models/Otp.js
const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String, // Hashed OTP
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // OTP expires after 5 minutes (300 seconds)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", OtpSchema);
