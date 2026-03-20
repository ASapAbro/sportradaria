import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

export default function Enterprise() {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken || user?.plan !== 'entreprise') {
      // Utiliser un timeout pour éviter le setState synchrone
      const timer = setTimeout(() => setLoading(false), 0)
      return () => clearTimeout(timer)
    }
    
    let mounted = true
    
    axios.get('/enterprise/dashboard', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(({ data }) => {
        if (mounted) setData(data)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
    return () => {
      mounted = false
    }
  }, [accessToken, user?.plan])

  if (user?.plan !== 'entreprise') {
    return (
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Espace Entreprise</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-gray-400 text-sm mb-4">
            Cette section est réservée aux comptes Entreprise.
          </p>
          
          <button
            onClick={() => navigate('/pricing')}
            className="inline-block bg-gray-900 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voir les offres
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="p-8"><p className="text-gray-400 text-sm">Chargement...</p></div>
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard RH</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-gray-900">{data?.stats.totalEmployees}</p>
          <p className="text-xs text-gray-400 mt-1">Employés actifs</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-gray-900">{data?.stats.totalActivities}</p>
          <p className="text-xs text-gray-400 mt-1">Activités totales</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-gray-900">{data?.stats.avgActivities}</p>
          <p className="text-xs text-gray-400 mt-1">Moy. par employé</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Équipe</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {data?.employees.map(employee => (
            <div key={employee._id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{employee.username}</p>
                <p className="text-xs text-gray-400">{employee.email}</p>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-sm font-medium text-gray-900">{employee.stats.activitiesCompleted}</p>
                  <p className="text-xs text-gray-400">activités</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{employee.badges.length}</p>
                  <p className="text-xs text-gray-400">badges</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
