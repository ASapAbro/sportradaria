const express = require('express')
const router = express.Router()
const Activity = require('../models/Activity')
const User = require('../models/User')
const authGuard = require('../middlewares/authGuard')
const validateActivity = require('../middlewares/validateActivity')
const { checkAndUnlockBadges } = require('../utils/badges')

router.get('/', async (req, res) => {
  try {
    const { sport, city, level, price, date } = req.query
    const filter = {}
    if (sport) filter.sport = sport
    if (city) filter['location.city'] = new RegExp(city, 'i')
    if (level) filter.level = level
    if (price === 'gratuit') filter.price = 0
    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      filter.date = { $gte: start, $lt: end }
    }
    const activities = await Activity.find(filter)
      .populate('author', 'username avatar')
      .populate('participants', 'username avatar')
      .sort({ date: 1 })
    res.json({ activities })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('participants', 'username avatar')
    if (!activity) return res.status(404).json({ message: 'Activité introuvable' })
    res.json({ activity })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/', authGuard, validateActivity, async (req, res) => {
  try {
    const activity = await Activity.create({
      ...req.body,
      author: req.user._id,
      participants: [req.user._id],
    })

    // Notifie tous les clients connectés
    const io = req.app.get('io')
    io.emit('new_activity', {
      title: activity.title,
      sport: activity.sport,
      city: activity.location.city,
      id: activity._id,
    })

    res.status(201).json({ activity })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put('/:id', authGuard, validateActivity, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activité introuvable' })
    if (activity.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Non autorisé' })
    const updated = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.json({ activity: updated })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete('/:id', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activité introuvable' })
    if (activity.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Non autorisé' })
    await activity.deleteOne()
    res.json({ message: 'Activité supprimée' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/:id/join', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activité introuvable' })
    if (activity.participants.includes(req.user._id))
      return res.status(400).json({ message: 'Déjà inscrit' })
    if (activity.participants.length >= activity.maxParticipants)
      return res.status(400).json({ message: 'Activité complète' })

    activity.participants.push(req.user._id)
    await activity.save()

    const user = await User.findById(req.user._id)
    user.stats.activitiesCompleted += 1
    await user.save()
    await checkAndUnlockBadges(user)

    // Notifie l'auteur de l'activité
    const io = req.app.get('io')
    io.to(`user_${activity.author}`).emit('participant_joined', {
      activityTitle: activity.title,
      username: req.user.username,
      count: activity.participants.length,
      max: activity.maxParticipants,
    })

    res.json({ activity })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/:id/leave', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activité introuvable' })
    activity.participants = activity.participants.filter(
      p => p.toString() !== req.user._id.toString()
    )
    await activity.save()
    res.json({ activity })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
// PATCH /api/activities/:id/status — changer le statut (auteur uniquement)
router.patch('/:id/status', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('participants')

    if (!activity) return res.status(404).json({ message: 'Activité introuvable' })
    if (activity.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Non autorisé' })

    const { status } = req.body
    activity.status = status
    await activity.save()

    // Si l'activité est terminée, met à jour les stats de chaque participant
    if (status === 'terminée') {
      for (const participant of activity.participants) {
        const user = await User.findById(participant._id || participant)
        if (user) {
          user.stats.activitiesCompleted += 1
          await user.save()
          await checkAndUnlockBadges(user)
        }
      }

      // Notifie tous les participants
      const io = req.app.get('io')
      activity.participants.forEach(p => {
        io.to(`user_${p._id || p}`).emit('activity_completed', {
          title: activity.title,
          message: `L'activité "${activity.title}" est terminée. Vos stats ont été mises à jour !`,
        })
      })
    }

    res.json({ activity })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/activities/user/mine — activités créées par l'utilisateur
router.get('/user/mine', authGuard, async (req, res) => {
  try {
    const activities = await Activity.find({ author: req.user._id })
      .populate('participants', 'username avatar')
      .sort({ date: -1 })
    res.json({ activities })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
