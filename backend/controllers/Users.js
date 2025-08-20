const Centres = require("../models/Centres");
const Sports = require("../models/Sports");
const Courts = require("../models/Courts");
const mongoose = require("mongoose");
const Bookings = require("../models/Bookings");
const User = require("../models/Users");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

function combineDateAndTimeIST(date, time) {
  const [hour, minute] = time.split(':');
  return dayjs(date)
    .tz('Asia/Kolkata')
    .hour(Number(hour))
    .minute(Number(minute))
    .second(0)
    .millisecond(0)
    .toISOString();
}

const getUserDetails = async (req, res) => {
  const UserId1 = req.params.userId1;
  try {
    const user = await User.findById(UserId1);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "manager" } });
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const bookings = await Bookings.find({ user: req.params.userId1 })
      .populate({
        path: "centre",
        select: "name location",
      })
      .populate({
        path: "sport",
        select: "name",
      })
      .populate({
        path: "court",
        select: "name",
      })
      .sort({ date: -1, startTime: 1 });

    const formattedBookings = bookings.map((booking) => {
      const startDateTimeIST = combineDateAndTimeIST(booking.date, booking.startTime);
      const endDateTimeIST = combineDateAndTimeIST(booking.date, booking.endTime);
      return {
        _id: booking._id,
        centre: booking.centre.name,
        centreLocation: booking.centre.location,
        sport: booking.sport.name,
        court: booking.court.name,
        date: booking.getFormattedDate(),
        startTime: booking.getFormattedStartTime(),
        endTime: booking.getFormattedEndTime(),
        bookingDate: booking.date, // Keep original date for sorting/filtering
        startDateTimeIST,
        endDateTimeIST,
      };
    });

    res.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ error: "Failed to fetch booking details" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Bookings.find()
      .populate({
        path: "centre",
        select: "name location",
      })
      .populate({
        path: "sport",
        select: "name",
      })
      .populate({
        path: "court",
        select: "name",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .sort({ date: -1, startTime: 1 }); // Sort by date descending, then by start time

    const formattedBookings = bookings.map((booking) => {
      const startDateTimeIST = combineDateAndTimeIST(booking.date, booking.startTime);
      const endDateTimeIST = combineDateAndTimeIST(booking.date, booking.endTime);
      return {
        _id: booking._id,
        centre: booking.centre.name,
        centreLocation: booking.centre.location,
        sport: booking.sport.name,
        court: booking.court.name,
        date: booking.getFormattedDate(),
        startTime: booking.getFormattedStartTime(),
        endTime: booking.getFormattedEndTime(),
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        bookingDate: booking.date, // Keep original date for sorting/filtering
        startDateTimeIST,
        endDateTimeIST,
      };
    });

    res.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching all booking details:", error);
    res.status(500).json({ error: "Failed to fetch booking details" });
  }
};

// PATCH /api/User/updateName/:userId
const updateUserName = async (req, res) => {
  const userId = req.params.userId;
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Name cannot be empty." });
  }
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update name." });
  }
};

// DELETE /api/User/deleteBooking/:bookingId
const deleteBooking = async (req, res) => {
  const bookingId = req.params.bookingId;
  const userId = req.body.userId; // Should be sent in request body
  try {
    const booking = await Bookings.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ error: "You can only cancel your own bookings." });
    }
    // Combine booking date and endTime to get the end datetime
    const [endHour, endMinute] = booking.endTime.split(":").map(Number);
    const bookingEnd = new Date(booking.date);
    bookingEnd.setHours(endHour, endMinute, 0, 0);
    if (bookingEnd < new Date()) {
      return res.status(400).json({ error: "Cannot cancel a completed or past booking." });
    }
    await Bookings.findByIdAndDelete(bookingId);
    res.status(200).json({ success: true, message: "Booking cancelled successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel booking." });
  }
};

module.exports = { getUserDetails, getBookingDetails, getAllUsers, getAllBookings, updateUserName, deleteBooking };
