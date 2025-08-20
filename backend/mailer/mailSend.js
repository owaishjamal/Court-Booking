require('dotenv').config();
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transport.verify((error, success) => {
  if (error) {
    console.log("Nodemailer transporter configuration error:", error);
  } else {
    console.log("Nodemailer transporter is ready to send emails");
  }
});

module.exports = transport;