import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from '../api/axios'

const useActivities = (filters = {}) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      Object.entries(JSON.parse(filtersKey)).forEach(([key, val]) => {
        if (val) params.append(key, val)
      })
      const { data } = await axios.get(`/activities?${params}`)
      setActivities(data.activities)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les activités')
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return { activities, loading, error, refetch: fetchActivities }
}

export default useActivities