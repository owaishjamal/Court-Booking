const mongoose = require('mongoose');

const CentreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  sports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sports',
  }]
});

module.exports = mongoose.model('Centres', CentreSchema);
