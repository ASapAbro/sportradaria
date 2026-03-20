import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setStatus(data.message))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-gray-900">SportRadaria</h1>
      <p className="text-gray-500 text-sm">
        API : {status ?? 'connexion...'}
      </p>
    </div>
  )
}

export default App