const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['premium', 'entreprise'],
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due'],
      default: 'active',
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Subscription', subscriptionSchema)