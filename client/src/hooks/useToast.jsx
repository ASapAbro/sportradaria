import { useState, useCallback } from 'react'

export default function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const ToastComponent = toast ? (
    <div
      key={toast.id}
      className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-sm font-medium z-50 animate-slide-in ${
        toast.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : toast.type === 'error'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-blue-50 text-blue-700 border border-blue-200'
      }`}
    >
      {toast.message}
    </div>
  ) : null

  return { showToast, ToastComponent }
}
