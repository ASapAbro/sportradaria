import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'

const PLANS = [
  {
    id: 'gratuit',
    name: 'Gratuit',
    price: 0,
    features: [
      'Carte interactive',
      'Météo temps réel',
      'Rejoindre des activités',
      'Badges de base',
    ],
    cta: 'Plan actuel',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: [
      'Tout le plan Gratuit',
      'Suivi personnalisé',
      'Badges avancés',
      'Statistiques détaillées',
      'Notifications prioritaires',
    ],
    cta: 'Passer Premium',
    highlight: true,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: 49.99,
    features: [
      'Tout le plan Premium',
      'Dashboard RH',
      'Gestion équipes',
      'Défis collectifs',
      'Reporting exportable',
      'Support dédié',
    ],
    cta: 'Contacter',
  },
]

export default function Pricing() {
  const { user, accessToken } = useAuth()
  const [loading, setLoading] = useState(null)

  const handleSubscribe = async (planId) => {
    if (planId === 'gratuit') return
    setLoading(planId)
    try {
      const { data } = await axios.post('/subscriptions/checkout',
        { plan: planId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      window.location.href = data.url
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nos offres</h1>
        <p className="text-gray-400 text-sm">
          Plan actuel : <span className="text-gray-900 font-medium capitalize">{user?.plan || 'gratuit'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col ${
              plan.highlight ? 'ring-2 ring-gray-900' : ''
            }`}
          >
            {plan.highlight && (
              <span className="text-xs font-medium bg-gray-900 text-white px-3 py-1 rounded-full self-start mb-4">
                Recommandé
              </span>
            )}

            <h2 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
              </span>
              {plan.price > 0 && (
                <span className="text-sm text-gray-400">/mois</span>
              )}
            </div>

            <ul className="flex flex-col gap-2 mb-8 flex-1">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={
                loading === plan.id ||
                user?.plan === plan.id ||
                plan.id === 'gratuit'
              }
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                plan.highlight
                  ? 'bg-gray-900 text-white hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id
                ? 'Redirection...'
                : user?.plan === plan.id
                ? 'Plan actuel'
                : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}