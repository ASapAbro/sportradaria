require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const weatherRoutes = require('./routes/weather')
const activitiesRoutes = require('./routes/activities')
const usersRoutes = require('./routes/users')

connectDB()

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Rend io accessible dans les routes
app.set('io', io)

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/activities', activitiesRoutes)
app.use('/api/users', usersRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SportRadaria API is running' })
})

io.on('connection', (socket) => {
  console.log('Client connecté :', socket.id)

  // L'utilisateur rejoint sa room personnelle
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`)
    console.log(`User ${userId} a rejoint sa room`)
  })

  socket.on('disconnect', () => {
    console.log('Client déconnecté :', socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})