import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'

const SPORTS = ['football', 'basketball', 'tennis', 'yoga', 'running', 'cycling', 'swimming', 'rugby', 'hiking']
const LEVELS = ['débutant', 'intermédiaire', 'avancé']

export default function Profile() {
  const { user, accessToken } = useAuth()
  const [form, setForm] = useState({
    username: user?.username || '',
    sports: user?.sports || [],
    level: user?.level || 'débutant',
    objectives: user?.objectives || '',
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleSport = (sport) => {
    setForm(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.put('/users/me', form, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
          Profil mis à jour
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Informations</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Nom d'utilisateur</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Niveau</label>
              <select
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {LEVELS.map(l => (
                  <option key={l} value={l} className="capitalize">{l}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Mes objectifs</label>
              <textarea
                value={form.objectives}
                onChange={e => setForm({ ...form, objectives: e.target.value })}
                rows={3}
                placeholder="Ex : perdre du poids, courir 10km..."
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Sports favoris</h2>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map(sport => (
              <button
                key={sport}
                type="button"
                onClick={() => toggleSport(sport)}
                className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
                  form.sports.includes(sport)
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
