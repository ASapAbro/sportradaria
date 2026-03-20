const express = require('express')
const router = express.Router()
const User = require('../models/User')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt')
const authGuard = require('../middlewares/authGuard')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })
    if (existingUser) {
      return res.status(400).json({ message: 'Email ou username déjà utilisé' })
    }

    const user = await User.create({ username, email, password })

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.status(201).json({ accessToken, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects' })
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.json({ accessToken, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) {
      return res.status(401).json({ message: 'Refresh token manquant' })
    }

    const decoded = verifyRefreshToken(token)
    const accessToken = generateAccessToken(decoded.id)

    res.json({ accessToken })
  } catch (error) {
    res.status(401).json({ message: 'Refresh token invalide ou expiré' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', COOKIE_OPTIONS)
  res.json({ message: 'Déconnecté' })
})

// GET /api/auth/me
router.get('/me', authGuard, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router