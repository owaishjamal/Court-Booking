const express = require("express");
const {getUserDetails, getBookingDetails, getAllUsers, getAllBookings, updateUserName, deleteBooking} = require("../controllers/Users.js");
const verifyAdmin = require("../middlewareAdmin.js");
const router = express.Router();

router.get("/getUserDetailS/:userId1", getUserDetails);
router.get("/getBookingDetailS/:userId1", getBookingDetails);
router.get("/getAllUsers", getAllUsers);
router.get("/getAllBookings", verifyAdmin, getAllBookings);
router.patch("/updateName/:userId", updateUserName);
router.delete("/deleteBooking/:bookingId", deleteBooking);

module.exports = router;