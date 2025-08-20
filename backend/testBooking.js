const mongoose = require("mongoose");
const Bookings = require("./models/Bookings");

// Connect to MongoDB
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/booking-system";
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testBooking = async () => {
  try {
    console.log("Testing booking creation...");
    
    // Test with different time formats
    const testCases = [
      {
        startTime: "19:00",
        endTime: "20:00",
        description: "HH:MM format"
      },
      {
        startTime: "19:00:00",
        endTime: "20:00:00",
        description: "HH:MM:SS format"
      },
      {
        startTime: "09:00",
        endTime: "10:00:00",
        description: "Mixed format"
      }
    ];
    
    for (const testCase of testCases) {
      try {
        console.log(`\nTesting ${testCase.description}:`);
        console.log(`Start Time: ${testCase.startTime}`);
        console.log(`End Time: ${testCase.endTime}`);
        
        const testBooking = new Bookings({
          centre: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"), // Dummy ID
          sport: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"), // Dummy ID
          court: new mongoose.Types.ObjectId("507f1f77bcf86cd799439013"), // Dummy ID
          user: new mongoose.Types.ObjectId("507f1f77bcf86cd799439014"), // Dummy ID
          date: new Date("2024-12-25"),
          startTime: testCase.startTime,
          endTime: testCase.endTime
        });
        
        // Validate without saving
        await testBooking.validate();
        console.log("✅ Validation passed");
        
        // Test formatting methods
        console.log(`Formatted Start Time: ${testBooking.getFormattedStartTime()}`);
        console.log(`Formatted End Time: ${testBooking.getFormattedEndTime()}`);
        console.log(`Formatted Date: ${testBooking.getFormattedDate()}`);
        
      } catch (error) {
        console.log(`❌ Validation failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testBooking();
}

module.exports = testBooking; 