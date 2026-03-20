import { createContext, useContext, useState, useEffect } from 'react'
import axios from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Au montage : tente un refresh silencieux
  useEffect(() => {
    const refresh = async () => {
      try {
        const { data } = await axios.post('/auth/refresh')
        setAccessToken(data.accessToken)
        const me = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        })
        setUser(me.data.user)
      } catch {
        // Pas de session active, c'est normal
      } finally {
        setLoading(false)
      }
    }
    refresh()
  }, [])

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password })
    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const register = async (username, email, password) => {
    const { data } = await axios.post('/auth/register', { username, email, password })
    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const logout = async () => {
    await axios.post('/auth/logout')
    setAccessToken(null)
    setUser(null)
  }

  return (
  <AuthContext.Provider value={{ user, setUser, accessToken, loading, login, register, logout }}>
    {children}
  </AuthContext.Provider>
)
}

export const useAuth = () => useContext(AuthContext)