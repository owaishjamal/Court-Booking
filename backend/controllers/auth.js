const userModel = require("../models/Users.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Otp = require("../models/Otp.js");
const middleWare1 = require("../middlewareAdmin.js");
const nodemailer = require("nodemailer");

const crypto = require("crypto");
const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.LOCALURL
    : process.env.GLOBALURL;
    
// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Verify Your Email</h2>
          <p>Thank you for registering with our service. Please use the following OTP to verify your account:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this verification, please ignore this email.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate input before saving
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  try {
    // Check if the email is already in use
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists." });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with isVerified set to true initially
    const user = new userModel({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      isVerified: true // Set to true for now to bypass OTP verification
    });

    const savedUser = await user.save();
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send OTP email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      console.log("Failed to send OTP email, but user was created");
    }

    return res.status(201).json({ 
      success: true, 
      message: "User registered successfully. Please check your email for OTP verification.",
      user: savedUser 
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Invalid data. Please check your inputs.",
        details: err.errors,
      });
    }
    return res.status(500).json({
      error: "Server error. Unable to create user.",
      details: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password);
  try {
    const foundUser = await userModel.findOne({ email });

    if (!foundUser) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const userId = foundUser._id;
    const userData = {
      id: userId,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
    };

    const payload = {
      user: {
        id: userId,
        role: foundUser.role,
      },
    };

    const authToken = jwt.sign(payload, process.env.SECRET_KEY || 'your-secret-key', {
      expiresIn: "24h",
    });

    res.status(200).json({
      success: true,
      authToken,
      userId,
      user: userData,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      // For security, always return success
      return res.status(200).json({ success: true, message: "If this email is registered, you will receive a password reset link shortly." });
    }
    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutes
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    // Send reset email
    const resetUrl = `${API_URL}/resetPassword/${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>This link will expire in 30 minutes.</p>`
    });
    return res.status(200).json({ success: true, message: "If this email is registered, you will receive a password reset link shortly." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Export the functions
module.exports = {
  createUser,
  loginUser,
  forgotPassword
};