import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'
import { useState } from 'react'

const STATUS_COLORS = {
  'à venir': 'text-blue-500',
  'en cours': 'text-green-500',
  'terminée': 'text-gray-400',
}

export default function ActivityCard({ activity, onUpdate }) {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const isParticipant = activity.participants?.some(p =>
    (p._id || p) === user?._id
  )
  const isFull = activity.participants?.length >= activity.maxParticipants
  const isAuthor = (activity.author?._id || activity.author) === user?._id

  const handleJoinLeave = async (e) => {
    e.stopPropagation()
    setLoading(true)
    try {
      const action = isParticipant ? 'leave' : 'join'
      await axios.post(`/activities/${activity._id}/${action}`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      onUpdate?.()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={() => navigate(`/activities/${activity._id}`)}
      className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide capitalize">
            {activity.sport}
          </span>
          <span className={`text-xs ${STATUS_COLORS[activity.status]}`}>
            {activity.status}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-900">
          {activity.price === 0 ? 'Gratuit' : `${activity.price}€`}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
      <p className="text-sm text-gray-400 mb-1">{activity.location.city}</p>
      <p className="text-xs text-gray-400 mb-4">
        {new Date(activity.date).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {activity.participants?.length}/{activity.maxParticipants} participants
        </span>

        {!isAuthor && activity.status !== 'terminée' && (
          <button
            onClick={handleJoinLeave}
            disabled={loading || (!isParticipant && isFull)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              isParticipant
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : isFull
                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            {loading ? '...' : isParticipant ? 'Se désister' : 'Rejoindre'}
          </button>
        )}

        {isAuthor && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
            Mon activité
          </span>
        )}
      </div>
    </div>
  )
}