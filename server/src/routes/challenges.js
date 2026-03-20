const express = require('express')
const router = express.Router()
const Challenge = require('../models/Challenge')
const authGuard = require('../middlewares/authGuard')

// GET /api/challenges — liste des défis actifs
router.get('/', async (req, res) => {
  try {
    const now = new Date()
    const challenges = await Challenge.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate('participants.user', 'username avatar')
      .sort({ endDate: 1 })
    res.json({ challenges })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/challenges/:id/join — rejoindre un défi
router.post('/:id/join', authGuard, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
    if (!challenge) return res.status(404).json({ message: 'Défi introuvable' })

    const already = challenge.participants.find(
      p => p.user.toString() === req.user._id.toString()
    )
    if (already) return res.status(400).json({ message: 'Déjà inscrit' })

    challenge.participants.push({ user: req.user._id, progress: 0 })
    await challenge.save()
    res.json({ challenge })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/challenges/:id/leaderboard — classement
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.user', 'username avatar')

    if (!challenge) return res.status(404).json({ message: 'Défi introuvable' })

    const leaderboard = challenge.participants
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 10)
      .map((p, index) => ({
        rank: index + 1,
        user: p.user,
        progress: p.progress,
        percentage: Math.min(Math.round((p.progress / challenge.goal) * 100), 100),
      }))

    res.json({ leaderboard, goal: challenge.goal, unit: challenge.unit })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Seed — crée des défis de démo si aucun n'existe
router.post('/seed', async (req, res) => {
  try {
    const count = await Challenge.countDocuments()
    if (count > 0) return res.json({ message: 'Défis déjà existants' })

    const now = new Date()
    const endOfWeek = new Date(now)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    const endOfMonth = new Date(now)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)

    await Challenge.insertMany([
      {
        title: 'Sprint de la semaine',
        description: 'Participe à 3 activités cette semaine',
        type: 'hebdomadaire',
        sport: 'running',
        goal: 3,
        unit: 'activités',
        startDate: now,
        endDate: endOfWeek,
        reward: { badge: 'Sprinter', icon: '🏃' },
      },
      {
        title: 'Défi du mois',
        description: 'Cumule 10 activités ce mois-ci',
        type: 'mensuel',
        sport: 'tous',
        goal: 10,
        unit: 'activités',
        startDate: now,
        endDate: endOfMonth,
        reward: { badge: 'Champion du mois', icon: '🏆' },
      },
      {
        title: 'Yoga & zen',
        description: 'Fais 5 séances de yoga cette semaine',
        type: 'hebdomadaire',
        sport: 'yoga',
        goal: 5,
        unit: 'activités',
        startDate: now,
        endDate: endOfWeek,
        reward: { badge: 'Maître zen', icon: '🧘' },
      },
    ])

    res.json({ message: '3 défis créés' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router