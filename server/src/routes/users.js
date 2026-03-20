const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Activity = require('../models/Activity')
const authGuard = require('../middlewares/authGuard')

// GET /api/users/me/profile — profil complet
router.get('/me/profile', authGuard, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites')
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /api/users/me — modifier le profil
router.put('/me', authGuard, async (req, res) => {
  try {
    const { username, sports, level, objectives, avatar } = req.body

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { username, sports, level, objectives, avatar },
      { new: true, runValidators: true }
    )

    res.json({ user: updated })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// POST /api/users/me/favorites/:activityId — ajouter favori
router.post('/me/favorites/:activityId', authGuard, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const { activityId } = req.params

    const already = user.favorites.includes(activityId)
    if (already) {
      return res.status(400).json({ message: 'Déjà en favoris' })
    }

    user.favorites.push(activityId)
    await user.save()

    res.json({ favorites: user.favorites })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/users/me/favorites/:activityId — retirer favori
router.delete('/me/favorites/:activityId', authGuard, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.favorites = user.favorites.filter(
      f => f.toString() !== req.params.activityId
    )
    await user.save()

    res.json({ favorites: user.favorites })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/users/me/planning — activités rejointes
router.get('/me/planning', authGuard, async (req, res) => {
  try {
    const activities = await Activity.find({
      participants: req.user._id,
      date: { $gte: new Date() },
    })
      .populate('author', 'username avatar')
      .sort({ date: 1 })

    res.json({ activities })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router