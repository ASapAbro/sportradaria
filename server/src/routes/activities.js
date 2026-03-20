const express = require('express')
const router = express.Router()
const Activity = require('../models/Activity')
const authGuard = require('../middlewares/authGuard')

// GET /api/activities — liste avec filtres
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

// GET /api/activities/:id — détail
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('participants', 'username avatar')

    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    res.json({ activity })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/activities — créer (auth requise)
router.post('/', authGuard, async (req, res) => {
  try {
    const activity = await Activity.create({
      ...req.body,
      author: req.user._id,
      participants: [req.user._id],
    })

    res.status(201).json({ activity })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT /api/activities/:id — modifier (auteur uniquement)
router.put('/:id', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)

    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    if (activity.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    const updated = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json({ activity: updated })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE /api/activities/:id — supprimer (auteur uniquement)
router.delete('/:id', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)

    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    if (activity.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    await activity.deleteOne()
    res.json({ message: 'Activité supprimée' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/activities/:id/join — rejoindre
router.post('/:id/join', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)

    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    const alreadyJoined = activity.participants.includes(req.user._id)
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Déjà inscrit' })
    }

    if (activity.participants.length >= activity.maxParticipants) {
      return res.status(400).json({ message: 'Activité complète' })
    }

    activity.participants.push(req.user._id)
    await activity.save()

    res.json({ activity })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/activities/:id/leave — quitter
router.post('/:id/leave', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)

    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    activity.participants = activity.participants.filter(
      p => p.toString() !== req.user._id.toString()
    )
    await activity.save()

    res.json({ activity })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router