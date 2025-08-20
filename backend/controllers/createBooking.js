const User = require("../models/Users");
const Court = require("../models/Courts");
const Booking = require("../models/Bookings");
const mongoose = require("mongoose");
const Centre = require("../models/Centres");
const Sport = require("../models/Sports");

const getAvailableSlots = async (req, res) => {
  const { centre, sport, date } = req.body;

  try {
    const courts = await Court.find({
      sport: new mongoose.Types.ObjectId(sport),
    });

    // All bookings for that day (from 12:00 to next 12:00)
    const baseDate = new Date(`${date}T00:00:00+05:30`);
    const nextDay = new Date(baseDate.getTime() + 36 * 60 * 60 * 1000); // 36 hours for buffer

    const bookings = await Booking.find({
      centre: new mongoose.Types.ObjectId(centre),
      sport: new mongoose.Types.ObjectId(sport),
      startDateTime: { $gte: baseDate, $lt: nextDay },
    });

    // Time slots: 1:30 PM to 1:30 AM next day, in 30-min steps
    const slots = [];
    const slotStart = new Date(`${date}T13:30:00+05:30`);
    for (let i = 0; i < 24; i++) {
      const start = new Date(slotStart.getTime() + i * 30 * 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      if (end > slotStart.getTime() + 12 * 60 * 60 * 1000) break; // stop at +12h (1:30AM)
      slots.push({ start, end });
    }

    const bookedSlotsMap = {};
    bookings.forEach((b) => {
      const courtId = b.court.toString();
      if (!bookedSlotsMap[courtId]) bookedSlotsMap[courtId] = [];
      bookedSlotsMap[courtId].push({ start: b.startDateTime, end: b.endDateTime });
    });

    const availableSlotsPerCourt = courts.map((court) => {
      const courtId = court._id.toString();
      const booked = bookedSlotsMap[courtId] || [];

      const available = slots.filter((slot) => {
        return !booked.some(
          (b) => slot.start < b.end && slot.end > b.start
        );
      });

      return {
        court: court,
        availableSlots: available.map((s) =>
          s.start.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })
        ),
      };
    });

    return res.status(200).json({ availableSlotsPerCourt });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({
      message: "Failed to retrieve available slots",
      error: error.message,
    });
  }
};

const createBooking = async (req, res) => {
  const { centre_id, sport_id, court_id, user_id, date, startTime } = req.body;

  try {
    const centre = await Centre.findById(centre_id);
    if (!centre) return res.status(404).json({ error: "Centre not found" });

    const sport = await Sport.findOne({ _id: sport_id, centre: centre_id });
    if (!sport) return res.status(404).json({ error: "Sport not found" });

    const court = await Court.findOne({ _id: court_id, sport: sport_id });
    if (!court) return res.status(404).json({ error: "Court not found" });

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const startDateTime = combineDateAndTime(date, startTime);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

    const existingBooking = await Booking.findOne({
      court: court_id,
      $or: [
        { startDateTime: { $lt: endDateTime, $gte: startDateTime } },
        { endDateTime: { $gt: startDateTime, $lte: endDateTime } },
        { startDateTime: { $lte: startDateTime }, endDateTime: { $gte: endDateTime } },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        error: "This time slot is already booked for the selected court",
      });
    }

    // Format times to HH:MM format
    const formatTime = (time) => {
      if (time && time.includes(':')) {
        const parts = time.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
      return time;
    };

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endDateTime.toTimeString().slice(0, 5));

    const newBooking = new Booking({
      centre: centre_id,
      sport: sport_id,
      court: court_id,
      user: user_id,
      date: new Date(date), // Convert string to Date object
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    });

    await newBooking.save();

    return res.status(201).json({
      message: "Booking created successfully",
      booking: {
        ...newBooking.toObject(),
        formattedDate: newBooking.getFormattedDate(),
        formattedStartTime: newBooking.getFormattedStartTime(),
        formattedEndTime: newBooking.getFormattedEndTime(),
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ error: "Server error. Unable to create booking." });
  }
};

function combineDateAndTime(date, time) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const ist = new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
  return new Date(ist.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

module.exports = { getAvailableSlots, createBooking };
