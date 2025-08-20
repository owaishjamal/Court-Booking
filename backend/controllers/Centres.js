const Centres = require("../models/Centres");
const Sports = require("../models/Sports");
const Courts = require("../models/Courts");
const mongoose = require("mongoose");
const Bookings = require("../models/Bookings");
const User = require("../models/Users");
const moment = require("moment");
const { createBookingEmail } = require("../utils/bookingEmailContent");
const bookingEmail = require("../mailer/bookingEmail");
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

const getCentres = async (req, res) => {
  try {
    const centres = await Centres.find();
    res.json({ success: true, centres });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// backend/controller/centre.controller.js

// Get all sports for a particular centre
const getCentreSports = async (req, res) => {
  const centreId = req.params.id; // Get the centre ID from request parameters

  try {
    // Find all sports associated with the centre ID
    const sports = await Sports.find({ centre: centreId }).populate({
      path: "courts", // Populate the courts associated with each sport
      model: "Courts", // Reference to the Courts model
    });

    // If no sports are found, return a 404 response
    if (!sports || sports.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No sports found for this centre" });
    }

    // Log the found sports and send the response
    // console.log(sports);
    res.json({ success: true, sports });
  } catch (error) {
    // Handle and log any errors
    console.error("Error fetching sports for the centre:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAvailableCourts = async (req, res) => {
  const { centreId, sportId } = req.params; // Get centre ID and sport ID from request parameters
  const { date } = req.query; // Get date from query parameters
  // Validate input
  if (!date) {
    return res
      .status(400)
      .json({ success: false, message: "Date is required" });
  }

  try {
    // Fetch all courts for the specified sport
    const courts = await Courts.find({ sport: sportId });

    // Always return all courts, regardless of bookings
    res.json({ success: true, availableCourts: courts });
  } catch (error) {
    console.error("Error fetching available courts:", error);
    res.status(500).json({ success: false, message: "Server Error hai" });
  }
};
const getAvailableSlots = async (req, res) => {
  try {
    const { centre, sport, court, date } = req.params;

    // *1. Validate Input Parameters*
    if (!centre || !sport || !court || !date) {
      return res.status(400).json({
        message:
          "Missing required query parameters: centre, sport, court, date.",
      });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(centre)) {
      return res.status(400).json({ message: "Invalid Centre ID format." });
    }
    if (!mongoose.Types.ObjectId.isValid(sport)) {
      return res.status(400).json({ message: "Invalid Sport ID format." });
    }
    if (!mongoose.Types.ObjectId.isValid(court)) {
      return res.status(400).json({ message: "Invalid Court ID format." });
    }

    // Validate Date
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    // *2. Verify Relationships*

    // Check if Centre exists
    const foundCentre = await Centres.findById(centre);
    if (!foundCentre) {
      return res.status(404).json({ message: "Centre not found." });
    }

    // Check if Sport exists and belongs to Centre
    const foundSport = await Sports.findOne({ _id: sport, centre: centre });
    if (!foundSport) {
      return res
        .status(404)
        .json({ message: "Sport not found in the specified Centre." });
    }

    // Check if Court exists and belongs to Sport
    const foundCourt = await Courts.findOne({ _id: court, sport: sport });
    if (!foundCourt) {
      return res
        .status(404)
        .json({ message: "Court not found under the specified Sport." });
    }

    // *3. Generate Time Slots*
    const generateTimeSlots = (
      start = "08:00",
      end = "20:00",
      interval = 60
    ) => {
      const slots = [];
      let [startHour, startMinute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);

      while (
        startHour < endHour ||
        (startHour === endHour && startMinute < endMinute)
      ) {
        const slotStart = `${startHour
          .toString()
          .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
        let nextHour = startHour;
        let nextMinute = startMinute + interval;
        if (nextMinute >= 60) {
          nextMinute -= 60;
          nextHour += 1;
        }
        const slotEnd = `${nextHour.toString().padStart(2, "0")}:${nextMinute
          .toString()
          .padStart(2, "0")}`;
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          startDateTimeIST: combineDateAndTimeIST(date, slotStart),
          endDateTimeIST: combineDateAndTimeIST(date, slotEnd),
          booked: false,
        });
        startHour = nextHour;
        startMinute = nextMinute;
      }

      return slots;
    };

    const timeSlots = generateTimeSlots();

    // *4. Check Existing Bookings*
    // Define start and end of the day for querying
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch bookings for the specified court and date
    const existingBookings = await Bookings.find({
      centre: centre,
      sport: sport,
      court: court,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).populate("user", "name email");

    // *5. Map Time Slots with Booking Status (no bookedBy info)*
    const allSlots = timeSlots.map((slot) => {
      // Check if this slot overlaps with any existing booking
      const isBooked = existingBookings.some((b) => {
        // Convert times to minutes for comparison
        const [slotStartHour, slotStartMinute] = slot.startTime.split(":").map(Number);
        const [slotEndHour, slotEndMinute] = slot.endTime.split(":").map(Number);
        const [bookStartHour, bookStartMinute] = b.startTime.split(":").map(Number);
        const [bookEndHour, bookEndMinute] = b.endTime.split(":").map(Number);

        const slotStart = slotStartHour * 60 + slotStartMinute;
        const slotEnd = slotEndHour * 60 + slotEndMinute;
        const bookStart = bookStartHour * 60 + bookStartMinute;
        const bookEnd = bookEndHour * 60 + bookEndMinute;

        // Overlap if slotStart < bookEnd and slotEnd > bookStart
        return slotStart < bookEnd && slotEnd > bookStart;
      });
      return {
        ...slot,
        booked: isBooked,
      };
    });

    // *6. Respond with All Slots*
    return res.status(200).json({
      success: true,
      date: date,
      centre: centre,
      sport: sport,
      court: court,
      availableSlots: allSlots, // Include all slots with booking status and bookedBy info
    });
  } catch (error) {
    console.error("Error in getAvailableSlots:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const booking = async (req, res) => {
  const { centreId, sportId, courtId, startTime, endTime, date, userId } =
    req.params;
  // Assuming you send date and userId in the request body

  // Validate input
  if (!date || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Date and user ID are required" });
  }

  try {
    // Format times to HH:MM format (remove seconds if present)
    const formatTime = (time) => {
      if (time && time.includes(':')) {
        const parts = time.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
      return time;
    };

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    // Create a new booking document with proper Date object
    const newBooking = new Bookings({
      centre: mongoose.Types.ObjectId(centreId),
      sport: mongoose.Types.ObjectId(sportId),
      court: mongoose.Types.ObjectId(courtId),
      date: new Date(date), // Convert string to Date object
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      user: mongoose.Types.ObjectId(userId), // Assuming you have the user ID in the request body
    });

    const [centre1, sport1, user1, court1] = await Promise.all([
      Centres.findById(centreId),
      Sports.findById(sportId),
      User.findById(userId),
      Courts.findById(courtId),
    ]);

    if (!centre1 || !sport1 || !user1 || !court1) {
      return res.status(404).json({
        success: false,
        message: "Invalid Centre, Sport, or User ID provided",
      });
    }

    // Save the booking
    const savedBooking = await newBooking.save();
    const bookingDetails = {
      centreName: centre1.name,
      sportName: sport1.name,
      courtName: court1.name, // Assuming courtId is a string. If you have a Court model, fetch the name similarly.
      date: savedBooking.getFormattedDate(),
      startTime: savedBooking.getFormattedStartTime(),
      endTime: savedBooking.getFormattedEndTime(),
      startDateTimeIST: combineDateAndTimeIST(date, formattedStartTime),
      endDateTimeIST: combineDateAndTimeIST(date, formattedEndTime),
    };

    // Create the email content
    const emailContent = createBookingEmail(user1.name, bookingDetails);
    await bookingEmail(user1.email, emailContent);
    res.status(201).json({
      success: true,
      message: "Court booked successfully",
      booking: {
        ...savedBooking.toObject(),
        startDateTimeIST: combineDateAndTimeIST(date, formattedStartTime),
        endDateTimeIST: combineDateAndTimeIST(date, formattedEndTime),
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//add centre

const addCentre = async (req, res) => {
  const { name, location } = req.body;
  try {
    const newCentre = new Centres({ name, location });
    await newCentre.save();
    res.status(201).json({ message: "Centre added successfully", newCentre });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding centre", error: err.message });
  }
};

//add sport at the centres
const addSport = async (req, res) => {
  const { centreId, sportName } = req.params;
  // console.log("dsss");
  try {
    // Step 1: Find the center by ID
    const centre = await Centres.findById(centreId);
    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    // Step 2: Create the new sport and associate it with the centre
    const newSport = new Sports({
      name: sportName,
      centre: centreId,
    });

    // Step 3: Save the new sport
    const savedSport = await newSport.save();

    // Step 4: Update the centre's sports array with the new sport ID
    centre.sports.push(savedSport._id);
    await centre.save();

    // Step 5: Return a success response
    res.status(200).json({
      message: "Sport added to the centre successfully",
      sport: savedSport,
    });
  } catch (error) {
    console.error("Error adding sport to centre:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//get sports at centre
const getSportsAtCentre = async (req, res) => {
  try {
    const { centreId } = req.params;

    // Find the centre by ID and populate the sports field
    const centre = await Sports.find({ centre: centreId });

    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    //  console.log(centre);
    res.json(centre); // Send back the sports data
  } catch (err) {
    console.error("Error fetching sports:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addCourt = async (req, res) => {
  const { selectedSport } = req.params;
  const { name } = req.body;

  try {
    // Check if the sport exists
    const sport = await Sports.findById(selectedSport);
    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    // Create the new court
    const court = new Courts({
      name,
      sport: selectedSport,
    });
    await court.save();

    // Add the court to the sport's court list
    sport.courts.push(court._id);
    await sport.save();

    res.status(201).json({
      message: "Court added successfully",
      court,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding court",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Find all users where the role is not 'manager'
    const users = await User.find({ role: { $ne: "manager" } });
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

module.exports = {
  getCentres,
  getCentreSports,
  getAvailableCourts,
  getAvailableSlots,
  booking,
  addCentre,
  addSport,
  getSportsAtCentre,
  addCourt,
  getAllUsers,
};
