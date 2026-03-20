import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'

export default function App() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-gray-900">SportRadaria</h1>
      <p className="text-gray-600">Connecté en tant que {user.username}</p>
      <button
        onClick={logout}
        className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
      >
        Se déconnecter
      </button>
    </div>
  )
}