import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'

const useSocket = (onNotification) => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    socketRef.current = io('/', {
      withCredentials: true,
      path: '/socket.io',
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

    return () => {
      socketRef.current?.disconnect()
    }
  }, [user])

  return socketRef.current
}

export default useSocket
