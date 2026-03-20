import { useEffect, useState } from 'react'
import axios from '../api/axios'

const ALL_BADGES = [
  { name: 'Premier pas', description: 'Rejoindre sa première activité', icon: '🏃' },
  { name: 'Régulier', description: 'Participer à 5 activités', icon: '⭐' },
  { name: 'Athlète', description: 'Participer à 10 activités', icon: '🏆' },
  { name: 'Matinal', description: '3 jours consécutifs actifs', icon: '🌅' },
  { name: 'Endurant', description: 'Cumuler 10 heures d\'activité', icon: '💪' },
]

export default function Badges() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/users/me/profile')
      .then(({ data }) => setUser(data.user))
      .finally(() => setLoading(false))
  }, [])

  const unlockedNames = user?.badges?.map(b => b.name) || []

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes badges</h1>
      <p className="text-gray-400 text-sm mb-8">
        {unlockedNames.length} / {ALL_BADGES.length} débloqués
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ALL_BADGES.map(badge => {
            const unlocked = unlockedNames.includes(badge.name)
            return (
              <div
                key={badge.name}
                className={`bg-white rounded-2xl p-6 shadow-sm text-center transition-opacity ${
                  unlocked ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <span className="text-4xl block mb-3">{badge.icon}</span>
                <p className="font-medium text-gray-900 text-sm mb-1">{badge.name}</p>
                <p className="text-xs text-gray-400">{badge.description}</p>
                {unlocked && (
                  <span className="inline-block mt-3 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Débloqué
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {user?.stats && (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Mes statistiques</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{user.stats.activitiesCompleted}</p>
              <p className="text-xs text-gray-400 mt-1">Activités</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{user.stats.consecutiveDays}</p>
              <p className="text-xs text-gray-400 mt-1">Jours consécutifs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{user.stats.totalHours}h</p>
              <p className="text-xs text-gray-400 mt-1">Heures actives</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}