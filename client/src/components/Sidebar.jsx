import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from './NotificationBell'

const links = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '⊞' },
  { to: '/discover', label: 'Découvrir', icon: '🗺' },
  { to: '/planning', label: 'Mon planning', icon: '📅' },
  { to: '/profile', label: 'Mon profil', icon: '👤' },
  { to: '/badges', label: 'Mes badges', icon: '🏅' },
  { to: '/community', label: 'Communauté', icon: '💬' },
  { to: '/challenges', label: 'Défis', icon: '🎯' },
  { to: '/pricing', label: 'Nos offres', icon: '💎' },
  { to: '/enterprise', label: 'Espace RH', icon: '🏢' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Burger button (mobile only) */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay (mobile) */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative
          w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col
          z-40 transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">SportRadaria</span>
          <NotificationBell />
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
    </>
  )
}
