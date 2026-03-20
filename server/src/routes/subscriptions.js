const express = require('express')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const User = require('../models/User')
const Subscription = require('../models/Subscription')
const authGuard = require('../middlewares/authGuard')

const PLANS = {
  premium: {
    name: 'Premium',
    price: 999,
    features: ['Suivi personnalisé', 'Badges avancés', 'Statistiques détaillées'],
  },
  entreprise: {
    name: 'Entreprise',
    price: 4999,
    features: ['Dashboard RH', 'Gestion équipes', 'Reporting', 'Défis collectifs'],
  },
}

// GET /api/subscriptions/plans — liste des plans
router.get('/plans', (req, res) => {
  res.json({ plans: PLANS })
})

// POST /api/subscriptions/checkout — créer session Stripe
router.post('/checkout', authGuard, async (req, res) => {
  try {
    const { plan } = req.body

    if (!PLANS[plan]) {
      return res.status(400).json({ message: 'Plan invalide' })
    }

    const user = await User.findById(req.user._id)

    // Crée ou récupère le customer Stripe
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
      })
      customerId = customer.id
      user.stripeCustomerId = customerId
      await user.save()
    }

    // Crée la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: `SportRadaria ${PLANS[plan].name}` },
            unit_amount: PLANS[plan].price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?payment=canceled`,
      metadata: { userId: user._id.toString(), plan },
    })

    res.json({ url: session.url })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/subscriptions/webhook — événements Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, plan } = session.metadata

    await User.findByIdAndUpdate(userId, { plan })

    await Subscription.create({
      user: userId,
      plan,
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const sub = await Subscription.findOne({
      stripeSubscriptionId: subscription.id,
    })
    if (sub) {
      await User.findByIdAndUpdate(sub.user, { plan: 'gratuit' })
      sub.status = 'canceled'
      await sub.save()
    }
  }

  res.json({ received: true })
})

// GET /api/subscriptions/me — abonnement actuel
router.get('/me', authGuard, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
    })
    res.json({ plan: user.plan, subscription })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/subscriptions/cancel — annuler
router.post('/cancel', authGuard, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
    })

    if (!subscription) {
      return res.status(404).json({ message: 'Aucun abonnement actif' })
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
    subscription.status = 'canceled'
    await subscription.save()
    await User.findByIdAndUpdate(req.user._id, { plan: 'gratuit' })

    res.json({ message: 'Abonnement annulé' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router