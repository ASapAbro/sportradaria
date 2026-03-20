import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'

export default function Challenges() {
  const { accessToken } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [leaderboards, setLeaderboards] = useState({})

  useEffect(() => {
    axios.get('/challenges')
      .then(({ data }) => setChallenges(data.challenges))
      .finally(() => setLoading(false))
  }, [])

  const loadLeaderboard = async (challengeId) => {
    if (leaderboards[challengeId]) return
    try {
      const { data } = await axios.get(`/challenges/${challengeId}/leaderboard`)
      setLeaderboards(prev => ({ ...prev, [challengeId]: data }))
    } catch (error) {
      console.error(error)
    }
  }

  const handleJoin = async (challengeId) => {
    try {
      await axios.post(`/challenges/${challengeId}/join`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const { data } = await axios.get('/challenges')
      setChallenges(data.challenges)
    } catch (error) {
      console.error(error)
    }
  }

  const daysLeft = (endDate) => {
    const diff = new Date(endDate) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Défis communauté</h1>
        <p className="text-gray-400 text-sm">Relève des défis et grimpe dans le classement</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-gray-400 text-sm mb-4">Aucun défi actif pour le moment.</p>
          <button
            onClick={() => axios.post('/challenges/seed').then(() => window.location.reload())}
            className="bg-gray-900 text-white text-sm px-6 py-2.5 rounded-lg"
          >
            Créer des défis de démo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map(challenge => {
            const lb = leaderboards[challenge._id]
            return (
              <div key={challenge._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide capitalize">
                        {challenge.type}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                        {challenge.reward.icon} {challenge.title}
                      </h2>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {daysLeft(challenge.endDate)}j restants
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">{challenge.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Objectif : <strong>{challenge.goal} {challenge.unit}</strong>
                    </span>
                    <span className="text-sm text-gray-400">
                      {challenge.participants.length} participants
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleJoin(challenge._id)}
                      className="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Rejoindre
                    </button>
                    <button
                      onClick={() => loadLeaderboard(challenge._id)}
                      className="px-4 bg-gray-100 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Classement
                    </button>
                  </div>
                </div>

                {lb && (
                  <div className="border-t border-gray-100 px-6 py-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Top 5
                    </h3>
                    <div className="flex flex-col gap-2">
                      {lb.leaderboard.slice(0, 5).map(entry => (
                        <div key={entry.user._id} className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-400 w-4">
                            {entry.rank}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                            {entry.user.username?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 flex-1">
                            {entry.user.username}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-gray-900 h-1.5 rounded-full"
                                style={{ width: `${entry.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">
                              {entry.progress}/{lb.goal}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}