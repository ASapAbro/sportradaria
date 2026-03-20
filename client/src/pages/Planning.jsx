import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'

export default function Planning() {
  const { accessToken } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) return
    axios.get('/users/me/planning', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(({ data }) => setActivities(data.activities))
      .finally(() => setLoading(false))
  }, [accessToken])

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon planning</h1>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-gray-400 text-sm">Aucune activité planifiée</p>
          <a href="/discover" className="text-sm text-gray-900 underline underline-offset-2 mt-2 inline-block">
            Découvrir des activités
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map(activity => (
            <div key={activity._id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {new Date(activity.date).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activity.location.city} · {activity.participants.length}/{activity.maxParticipants} participants
                </p>
              </div>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">
                {activity.sport}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
