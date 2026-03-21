import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'

const SPORTS = ['football', 'basketball', 'tennis', 'yoga', 'running', 'cycling', 'swimming', 'rugby', 'hiking', 'autre']
const LEVELS = ['débutant', 'intermédiaire', 'avancé']

export default function CreateActivity() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    title: '',
    sport: 'football',
    description: '',
    address: '',
    city: '',
    lat: '',
    lon: '',
    date: '',
    maxParticipants: 10,
    price: 0,
    level: 'débutant',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await axios.post('/activities', {
        title: form.title,
        sport: form.sport,
        description: form.description,
        location: {
          address: form.address,
          city: form.city,
          coordinates: {
            lat: parseFloat(form.lat),
            lon: parseFloat(form.lon),
          },
        },
        date: form.date,
        maxParticipants: parseInt(form.maxParticipants),
        price: parseFloat(form.price),
        level: form.level,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      navigate('/discover')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer une activité</h1>
        <p className="text-gray-400 text-sm">Remplis les informations pour proposer une activité</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-medium text-gray-700">Informations générales</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Titre</label>
            <input type="text" required value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex : Match de foot du dimanche"
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Sport</label>
              <select value={form.sport} onChange={e => set('sport', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {SPORTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Niveau</label>
              <select value={form.level} onChange={e => set('level', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Décris l'activité..."
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-medium text-gray-700">Lieu</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Adresse</label>
            <input type="text" required value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="Ex : Stade Charléty"
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Ville</label>
            <input type="text" required value={form.city}
              onChange={e => set('city', e.target.value)}
              placeholder="Ex : Paris"
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Latitude</label>
              <input type="number" step="any" required value={form.lat}
                onChange={e => set('lat', e.target.value)}
                placeholder="Ex : 48.8197"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Longitude</label>
              <input type="number" step="any" required value={form.lon}
                onChange={e => set('lon', e.target.value)}
                placeholder="Ex : 2.3455"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Pour trouver les coordonnées : clique droit sur Google Maps → "Plus d'infos sur cet endroit"
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-medium text-gray-700">Détails pratiques</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Date et heure</label>
            <input type="datetime-local" required value={form.date}
              onChange={e => set('date', e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Participants max</label>
              <input type="number" min="1" max="100" value={form.maxParticipants}
                onChange={e => set('maxParticipants', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Prix (€)</label>
              <input type="number" min="0" step="0.5" value={form.price}
                onChange={e => set('price', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/discover')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-gray-900 text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer l\'activité'}
          </button>
        </div>
      </form>
    </div>
  )
}