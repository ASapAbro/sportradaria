import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import WeatherWidget from '../components/WeatherWidget'

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
            Conditions météo actuelles près de vous
          </p>
        </div>
        <Link 
          to="/discover" 
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-block mb-6"
        >
          Découvrir
        </Link>

        <WeatherWidget />
      </main>
    </div>
  )
}