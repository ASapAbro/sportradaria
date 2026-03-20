const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')

// GET /api/weather?lat=48.85&lon=2.35
router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Paramètres lat et lon requis' })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`

    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Erreur OpenWeatherMap' })
    }

    const data = await response.json()

    res.json({
      city: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      icon: data.weather[0].icon,
      wind: Math.round(data.wind.speed * 3.6),
      humidity: data.main.humidity,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router