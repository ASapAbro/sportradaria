import { useState } from 'react'
import ActivityMap from '../components/ActivityMap'
import ActivityCard from '../components/ActivityCard'
import SkeletonCard from '../components/SkeletonCard'
import useActivities from '../hooks/useActivities'
import { SPORTS, LEVELS } from '../constants'
import { useNavigate } from 'react-router-dom'

export default function Discover() {
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const { activities, loading, refetch } = useActivities(filters)
  const navigate = useNavigate()

  const setFilter = (key, val) => {
    setFilters(prev => ({
      ...prev,
      [key]: val === prev[key] ? '' : val
    }))
  }

  const filtered = activities.filter(a =>
    search === '' ||
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.location.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 relative">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Découvrir</h1>
        <p className="text-gray-400 text-sm">
          {filtered.length} activité{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par titre ou ville..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* SPORT FILTERS */}
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

      {/* LEVEL + PRICE */}
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
            onClick={() => {
              setFilters({})
              setSearch('')
            }}
            className="px-4 py-1.5 rounded-full text-sm text-red-400 border border-red-200 hover:bg-red-50 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* MAP */}
      {loading ? (
        <div className="h-96 bg-white rounded-2xl flex items-center justify-center">
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      ) : (
        <ActivityMap activities={filtered} />
      )}

      {/* LIST */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="text-6xl mb-4">🏃‍♂️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune activité trouvée
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {Object.values(filters).some(v => v) || search
              ? 'Essayez de modifier vos filtres'
              : 'Soyez le premier à créer une activité !'}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(activity => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}

      {/* ✅ BOUTON FLOTTANT */}
      <button
        onClick={() => navigate('/activities/create')}
        className="fixed bottom-8 right-8 bg-gray-900 text-white rounded-full w-14 h-14 text-2xl shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center z-50"
      >
        +
      </button>

    </div>
  )
}