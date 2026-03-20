import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import axios from '../api/axios'
import { useState } from 'react'

export default function ActivityCard({ activity, onUpdate }) {
  const { accessToken, user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)

  const isFull = activity.participants.length >= activity.maxParticipants
  const isParticipant = activity.participants.some(p => p._id === user?._id || p === user?._id)

  const handleJoin = async () => {
    if (isParticipant) return
    
    try {
      setLoading(true)
      await axios.post(`/activities/${activity._id}/join`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      setJoined(true)
      showToast('Vous avez rejoint l\'activité ! 🎉', 'success')
      setTimeout(() => setJoined(false), 2000)
      onUpdate?.()
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de l\'inscription', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group animate-fade-in">
      {joined && (
        <div className="absolute inset-0 bg-green-500/10 rounded-2xl flex items-center justify-center animate-fade-in z-10">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}
        
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide group-hover:text-gray-900 transition-colors">
            {activity.sport}
          </span>
          <span className="text-sm font-medium text-gray-900 px-3 py-1 bg-gray-50 rounded-full group-hover:bg-gray-900 group-hover:text-white transition-colors">
            {activity.price === 0 ? 'Gratuit' : `${activity.price}€`}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
          {activity.title}
        </h3>
        <p className="text-sm text-gray-400 mb-3">{activity.location.city}</p>
        
        <p className="text-xs text-gray-400 mb-4">
          {new Date(activity.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-400">
            {activity.participants.length}/{activity.maxParticipants} participants
          </span>
          <span className="text-xs text-gray-400 capitalize">{activity.level}</span>
        </div>

        <button
          onClick={handleJoin}
          disabled={loading || isFull || isParticipant || joined}
          className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
            joined
              ? 'bg-green-500 text-white'
              : isParticipant
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Chargement...
            </span>
          ) : joined ? (
            '✓ Inscrit'
          ) : isParticipant ? (
            '✓ Déjà inscrit'
          ) : isFull ? (
            'Complet'
          ) : (
            'Rejoindre'
          )}
        </button>
      </div>
  )
}
