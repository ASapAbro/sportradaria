const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [100, 'Maximum 100 caractères'],
    },
    sport: {
      type: String,
      required: [true, 'Le sport est requis'],
      enum: ['football', 'basketball', 'tennis', 'yoga', 'running', 'cycling', 'swimming', 'rugby', 'volleyball', 'hiking', 'autre'],
    },
    description: {
      type: String,
      maxlength: [500, 'Maximum 500 caractères'],
      default: '',
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
    },
    date: {
      type: Date,
      required: [true, 'La date est requise'],
    },
    maxParticipants: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: String,
      enum: ['débutant', 'intermédiaire', 'avancé'],
      default: 'débutant',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Activity', activitySchema)