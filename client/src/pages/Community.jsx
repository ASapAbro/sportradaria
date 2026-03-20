import { useState, useEffect } from 'react'
import axios from '../api/axios'
import CommentSection from '../components/CommentSection'

export default function Community() {
  const [activities, setActivities] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/activities')
      .then(({ data }) => setActivities(data.activities))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Communauté</h1>
        <p className="text-gray-400 text-sm">Échangez avec les autres sportifs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-4">Activités récentes</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Chargement...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {activities.map(activity => (
                <button
                  key={activity._id}
                  onClick={() => setSelected(activity)}
                  className={`text-left bg-white rounded-2xl p-4 shadow-sm transition-all ${
                    selected?._id === activity._id
                      ? 'ring-2 ring-gray-900'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{activity.title}</span>
                    <span className="text-xs text-gray-400 capitalize">{activity.sport}</span>
                  </div>
                  <p className="text-xs text-gray-400">{activity.location.city}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {selected ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-medium text-gray-700 mb-1">{selected.title}</h2>
              <p className="text-xs text-gray-400 mb-4">{selected.location.city} · {selected.participants.length} participants</p>
              <CommentSection activityId={selected._id} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm flex items-center justify-center h-64">
              <p className="text-gray-400 text-sm">Sélectionne une activité pour voir les commentaires</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}