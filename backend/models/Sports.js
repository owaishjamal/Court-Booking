const mongoose = require("mongoose");

const SportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courts",
    },
  ],
  centre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Centres",
    required: true,
  },
});


module.exports = mongoose.model("Sports", SportSchema);
