const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['hebdomadaire', 'mensuel'],
      default: 'hebdomadaire',
    },
    sport: {
      type: String,
      required: true,
    },
    goal: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ['activités', 'heures', 'km'],
      default: 'activités',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        progress: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    reward: {
      badge: { type: String, default: '' },
      icon: { type: String, default: '🏆' },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Challenge', challengeSchema)