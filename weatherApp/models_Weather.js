const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  city: { type: String, required: true },
  temperature: Number,
  humidity: Number,
  description: String,
  dataFetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Weather', weatherSchema);
