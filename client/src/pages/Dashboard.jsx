import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">SportRadaria</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user.username} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Bienvenue sur SportRadaria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Membre depuis</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Sports favoris</p>
            <p className="text-sm font-medium text-gray-900">
              {user.sports.length > 0 ? user.sports.join(', ') : 'Aucun pour l\'instant'}
            </p>
          </div>
        </div>
      </main>

    </div>
  )
}