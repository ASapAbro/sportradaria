require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')

connectDB()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SportRadaria API is running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})