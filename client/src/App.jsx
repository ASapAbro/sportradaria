import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import Planning from './pages/Planning'
import Badges from './pages/Badges'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Pricing from './pages/Pricing'
import Enterprise from './pages/Enterprise'
import Community from './pages/Community'
import Challenges from './pages/Challenges'
import ActivityDetail from './pages/ActivityDetail'
import CreateActivity from './pages/CreateActivity'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gray-400 rounded-full animate-spin animation-delay-150" />
        </div>
        <p className="mt-6 text-sm text-gray-500 animate-pulse-soft">
          Chargement de SportRadaria...
        </p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><Layout><Discover /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/planning" element={<ProtectedRoute><Layout><Planning /></Layout></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><Layout><Badges /></Layout></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Layout><Pricing /></Layout></ProtectedRoute>} />
          <Route path="/enterprise" element={<ProtectedRoute><Layout><Enterprise /></Layout></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>} />
          <Route path="/challenges" element={<ProtectedRoute><Layout><Challenges /></Layout></ProtectedRoute>} />
          <Route path="/activities/:id" element={<ProtectedRoute><Layout><ActivityDetail /></Layout></ProtectedRoute>} />
          <Route path="/activities/create" element={ <ProtectedRoute><Layout><CreateActivity /></Layout></ProtectedRoute> } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
