import { useState, useEffect } from 'react'
import axios from '../api/axios'

const useWeather = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée')
      setLoading(false)
      return
    }

    const fetchWeather = async (latitude, longitude) => {
      try {
        const { data } = await axios.get(`/weather?lat=${latitude}&lon=${longitude}`)
        setWeather(data)
      } catch {
        setError('Impossible de récupérer la météo')
      } finally {
        setLoading(false)
      }
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchWeather(coords.latitude, coords.longitude)

        // Rafraîchissement toutes les 10 minutes
        const interval = setInterval(
          () => fetchWeather(coords.latitude, coords.longitude),
          10 * 60 * 1000
        )

        return () => clearInterval(interval)
      },
      () => {
        setError('Accès à la position refusé')
        setLoading(false)
      }
    )
  }, [])

  return { weather, loading, error }
}

export default useWeather