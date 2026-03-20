import { useState } from 'react'
import ActivityMap from '../components/ActivityMap'
import useActivities from '../hooks/useActivities'

const SPORTS = ['football', 'basketball', 'tennis', 'yoga', 'running', 'cycling', 'swimming', 'rugby', 'hiking', 'autre']
const LEVELS = ['débutant', 'intermédiaire', 'avancé']

export default function Discover() {
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const { activities, loading } = useActivities(filters)

  const setFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val === prev[key] ? '' : val }))
  }

  const filtered = activities.filter(a =>
    search === '' ||
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.location.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Découvrir</h1>
        <p className="text-gray-400 text-sm">{filtered.length} activité{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}</p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par titre ou ville..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* Filtres sport */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SPORTS.map(sport => (
          <button
            key={sport}
            onClick={() => setFilter('sport', sport)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filters.sport === sport
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Filtres niveau + gratuit */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LEVELS.map(level => (
          <button
            key={level}
            onClick={() => setFilter('level', level)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
              filters.level === level
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
            }`}
          >
            {level}
          </button>
        ))}
        <button
          onClick={() => setFilter('price', 'gratuit')}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            filters.price === 'gratuit'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
          }`}
        >
          Gratuit
        </button>
        {(Object.values(filters).some(v => v) || search) && (
          <button
            onClick={() => { setFilters({}); setSearch('') }}
            className="px-4 py-1.5 rounded-full text-sm text-red-400 border border-red-200 hover:bg-red-50 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Carte */}
      {loading ? (
        <div className="h-96 bg-white rounded-2xl flex items-center justify-center">
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      ) : (
        <ActivityMap activities={filtered} />
      )}

      {/* Liste */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(activity => (
          <div key={activity._id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide capitalize">
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
    </div>
  )
}