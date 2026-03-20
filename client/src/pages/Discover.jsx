import { useState } from 'react'
import ActivityMap from '../components/ActivityMap'
import useActivities from '../hooks/useActivities'

const SPORTS = ['football', 'basketball', 'tennis', 'yoga', 'running', 'cycling', 'swimming', 'rugby', 'hiking', 'autre']

export default function Discover() {
  const [filters, setFilters] = useState({})
  const { activities, loading } = useActivities(filters)

  const setFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val === prev[key] ? '' : val }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">SportRadaria</span>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-900">Dashboard</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Découvrir les activités</h1>
          <p className="text-gray-400 text-sm">{activities.length} activité{activities.length > 1 ? 's' : ''} trouvée{activities.length > 1 ? 's' : ''}</p>
        </div>

        {/* Filtres sports */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SPORTS.map(sport => (
            <button
              key={sport}
              onClick={() => setFilter('sport', sport)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                filters.sport === sport
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
              }`}
            >
              {sport}
            </button>
          ))}
          <button
            onClick={() => setFilter('price', 'gratuit')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.price === 'gratuit'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
            }`}
          >
            Gratuit
          </button>
          {Object.keys(filters).some(k => filters[k]) && (
            <button
              onClick={() => setFilters({})}
              className="px-4 py-1.5 rounded-full text-sm text-gray-400 border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Carte */}
        {loading ? (
          <div className="h-125 bg-white rounded-2xl flex items-center justify-center">
            <p className="text-gray-400 text-sm">Chargement de la carte...</p>
          </div>
        ) : (
          <ActivityMap activities={activities} />
        )}

        {/* Liste */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map(activity => (
            <div key={activity._id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {activity.sport}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {activity.price === 0 ? 'Gratuit' : `${activity.price}€`}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{activity.location.city}</p>
              <p className="text-xs text-gray-400 mb-4">
                {new Date(activity.date).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {activity.participants.length}/{activity.maxParticipants} participants
                </span>
                <span className="text-xs text-gray-400 capitalize">{activity.level}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}