import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'
import CommentSection from '../components/CommentSection'

const STATUS_COLORS = {
  'à venir': 'bg-blue-50 text-blue-600',
  'en cours': 'bg-green-50 text-green-600',
  'terminée': 'bg-gray-100 text-gray-500',
}

const STATUS_OPTIONS = ['à venir', 'en cours', 'terminée']

export default function ActivityDetail() {
  const { id } = useParams()
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    axios.get(`/activities/${id}`)
      .then(({ data }) => setActivity(data.activity))
      .finally(() => setLoading(false))
  }, [id])

  const isAuthor = activity?.author?._id === user?._id
  const isParticipant = activity?.participants?.some(p => p._id === user?._id)
  const isFull = activity?.participants?.length >= activity?.maxParticipants

  const handleJoin = async () => {
    setActionLoading(true)
    try {
      const { data } = await axios.post(`/activities/${id}/join`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      setActivity(data.activity)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    setActionLoading(true)
    try {
      const { data } = await axios.post(`/activities/${id}/leave`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      setActivity(data.activity)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    setActionLoading(true)
    try {
      const { data } = await axios.patch(`/activities/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      setActivity(data.activity)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cette activité ?')) return
    try {
      await axios.delete(`/activities/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      navigate('/discover')
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    }
  }

  if (loading) return (
    <div className="p-8">
      <p className="text-gray-400 text-sm">Chargement...</p>
    </div>
  )

  if (!activity) return (
    <div className="p-8">
      <p className="text-gray-400 text-sm">Activité introuvable.</p>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => navigate('/discover')}
        className="text-sm text-gray-400 hover:text-gray-900 mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[activity.status]}`}>
                {activity.status}
              </span>
              <span className="text-xs text-gray-400 capitalize">{activity.sport}</span>
              <span className="text-xs text-gray-400 capitalize">{activity.level}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{activity.title}</h1>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {activity.price === 0 ? 'Gratuit' : `${activity.price}€`}
          </span>
        </div>

        {activity.description && (
          <p className="text-sm text-gray-500 mb-4">{activity.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(activity.date).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Lieu</p>
            <p className="text-sm font-medium text-gray-900">{activity.location.address}</p>
            <p className="text-xs text-gray-400">{activity.location.city}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Organisateur</p>
            <p className="text-sm font-medium text-gray-900">{activity.author?.username}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Places</p>
            <p className="text-sm font-medium text-gray-900">
              {activity.participants?.length} / {activity.maxParticipants}
            </p>
          </div>
        </div>

        {/* Actions auteur */}
        {isAuthor && (
          <div className="flex flex-col gap-3 mb-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Gérer l'activité</p>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  disabled={actionLoading || activity.status === s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activity.status === s
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/activities/${id}/edit`)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-200 transition-colors"
              >
                Modifier
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-50 text-red-600 rounded-lg py-2 text-sm hover:bg-red-100 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Action participant */}
        {!isAuthor && activity.status !== 'terminée' && (
          <div className="pt-4 border-t border-gray-100">
            {isParticipant ? (
              <button onClick={handleLeave} disabled={actionLoading}
                className="w-full bg-gray-100 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Chargement...' : 'Se désister'}
              </button>
            ) : (
              <button onClick={handleJoin} disabled={actionLoading || isFull}
                className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Chargement...' : isFull ? 'Complet' : 'Rejoindre'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">
          Participants ({activity.participants?.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {activity.participants?.map(p => (
            <div key={p._id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {p.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-700">{p.username}</span>
              {p._id === activity.author?._id && (
                <span className="text-xs text-gray-400">(organisateur)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Commentaires */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <CommentSection activityId={id} />
      </div>
    </div>
  )
}