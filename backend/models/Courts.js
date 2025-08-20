const mongoose = require("mongoose");

const CourtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sports",
    required: true,
  },
});

module.exports = mongoose.model("Courts", CourtSchema);
