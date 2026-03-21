import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'

const useSocket = (onNotification) => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', user._id)
    })

    socketRef.current.on('new_activity', (data) => {
      onNotification({
        type: 'new_activity',
        message: `Nouvelle activité : ${data.title} (${data.sport}) à ${data.city}`,
        id: Date.now(),
      })
    })

    socketRef.current.on('participant_joined', (data) => {
      onNotification({
        type: 'participant_joined',
        message: `${data.username} a rejoint "${data.activityTitle}" (${data.count}/${data.max})`,
        id: Date.now(),
      })
    })

    socketRef.current.on('activity_completed', (data) => {
      onNotification({
        type: 'activity_completed',
        message: data.message,
        id: Date.now(),
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_activity')
        socketRef.current.off('participant_joined')
        socketRef.current.off('activity_completed')
        socketRef.current.disconnect()
      }
    }
  }, [user, onNotification])
}

export default useSocket
