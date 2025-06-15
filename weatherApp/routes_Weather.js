const express = require('express');
const axios = require('axios');
const Weather = require('../models/Weather');

const router = express.Router();

// GET /api/weather/:city
router.get('/:city', async (req, res) => {
  const city = req.params.city;
  try {
    // Check cache first
    let weather = await Weather.findOne({ city: city.toLowerCase() });
    if (weather && (Date.now() - weather.dataFetchedAt.getTime() < 10 * 60 * 1000)) {
      // If cached data is less than 10 mins old, return it
      return res.json(weather);
    }

    // Fetch from public weather API
    const response = await axios.get(process.env.WEATHER_API_URL, {
      params: {
        access_key: process.env.WEATHER_API_KEY,
        query: city
      }
    });
    const data = response.data;
    if (!data.current) {
      return res.status(404).json({ error: 'City not found or API error' });
    }

    // Save/update in DB
    const weatherData = {
      city: city.toLowerCase(),
      temperature: data.current.temperature,
      humidity: data.current.humidity,
      description: data.current.weather_descriptions[0],
      dataFetchedAt: new Date()
    };

    weather = await Weather.findOneAndUpdate({ city: city.toLowerCase() }, weatherData, { upsert: true, new: true });

    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching weather data', details: err.message });
  }
});

module.exports = router;
