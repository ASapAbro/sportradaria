import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '⊞' },
  { to: '/discover', label: 'Découvrir', icon: '🗺' },
  { to: '/planning', label: 'Mon planning', icon: '📅' },
  { to: '/profile', label: 'Mon profil', icon: '👤' },
  { to: '/badges', label: 'Mes badges', icon: '🏅' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="px-6 py-6 border-b border-gray-100">
        <span className="text-lg font-bold text-gray-900">SportRadaria</span>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  )
}