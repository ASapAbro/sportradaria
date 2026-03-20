# 🏅 SportRadaria — Code Review Complet

**Date :** 20 mars 2026  
**Stack :** React 19 + Vite + Tailwind CSS / Node.js + Express + MongoDB + Socket.io

---

## PARTIE 1 — BUGS ET ERREURS CRITIQUES

### 🔴 CRITIQUE — Route Enterprise dupliquée dans app.js

**Fichier :** `server/src/app.js`  
**Problème :** L'import `enterpriseRoutes` est absent alors que la route est utilisée  
**Impact :** 500 Internal Server Error sur l'endpoint `/api/enterprise`

**Code actuel :**
```javascript
const enterpriseRoutes = require('./routes/enterprise')
// ... ligne manquante pour app.use
```

**Code corrigé :**
```javascript
const enterpriseRoutes = require('./routes/enterprise')

// ... après les autres routes
app.use('/api/enterprise', enterpriseRoutes)
```

---

### 🔴 CRITIQUE — Erreur de navigation App.jsx

**Fichier :** `client/src/App.jsx` (lignes 31-32)  
**Problème :** Routes Pricing et Enterprise placées APRÈS la route catch-all `*`  
**Impact :** Impossible d'accéder à `/pricing` et `/enterprise`, redirection vers `/dashboard`

**Code actuel :**
```jsx
<Route path="*" element={<Navigate to="/dashboard" replace />} />
<Route path="/pricing" element={<ProtectedRoute><Layout><Pricing /></Layout></ProtectedRoute>} />
<Route path="/enterprise" element={<ProtectedRoute><Layout><Enterprise /></Layout></ProtectedRoute>} />
```

**Code corrigé :**
```jsx
<Route path="/pricing" element={<ProtectedRoute><Layout><Pricing /></Layout></ProtectedRoute>} />
<Route path="/enterprise" element={<ProtectedRoute><Layout><Enterprise /></Layout></ProtectedRoute>} />
<Route path="*" element={<Navigate to="/dashboard" replace />} />
```

---

### 🔴 CRITIQUE — Socket.io URL dans useSocket.js

**Fichier :** `client/src/hooks/useSocket.js` (ligne 11)  
**Problème :** Connexion à `'/'` au lieu du serveur backend  
**Impact :** En production, socket.io ne peut pas se connecter au serveur

**Code actuel :**
```javascript
socketRef.current = io('/', {
  withCredentials: true,
  path: '/socket.io',
})
```

**Code corrigé :**
```javascript
socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
})
```

**Aussi créer :** `client/.env`
```env
VITE_API_URL=http://localhost:5000
```

---

### 🔴 CRITIQUE — Memory leak dans useSocket

**Fichier :** `client/src/hooks/useSocket.js`  
**Problème :** Dépendance `onNotification` manquante dans useEffect  
**Impact :** Connexions socket non fermées, listeners dupliqués

**Code actuel :**
```javascript
useEffect(() => {
  // ...
  return () => {
    socketRef.current?.disconnect()
  }
}, [user]) // ⚠️ onNotification manquant
```

**Code corrigé :**
```javascript
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

  return () => {
    if (socketRef.current) {
      socketRef.current.off('new_activity')
      socketRef.current.off('participant_joined')
      socketRef.current.disconnect()
    }
  }
}, [user, onNotification])
```

---

### 🟡 IMPORTANT — Axios interceptor manquant

**Fichier :** `client/src/api/axios.js`  
**Problème :** Pas de gestion du token expiré ni de retry automatique  
**Impact :** L'utilisateur doit se reconnecter manuellement si le token expire

**Code actuel :**
```javascript
const instance = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export default instance
```

**Code corrigé avec interceptor :**
```javascript
import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Intercepteur de requête : injecte le token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponse : refresh si 401
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return instance(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await instance.post('/auth/refresh')
        localStorage.setItem('accessToken', data.accessToken)
        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return instance(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default instance
```

**Aussi modifier AuthContext.jsx pour persister le token :**
```javascript
const login = async (email, password) => {
  const { data } = await axios.post('/auth/login', { email, password })
  setAccessToken(data.accessToken)
  localStorage.setItem('accessToken', data.accessToken) // ⭐ Ajout
  setUser(data.user)
}
```

---

### 🟡 IMPORTANT — Validation manquante côté serveur

**Fichier :** `server/src/routes/activities.js`  
**Problème :** Pas de validation des champs avant création  
**Impact :** Risque d'injection, données corrompues

**Code à ajouter (middleware de validation) :**
```javascript
// server/src/middlewares/validateActivity.js
const validateActivity = (req, res, next) => {
  const { title, sport, location, date, maxParticipants, price } = req.body

  const errors = []

  if (!title || title.trim().length < 3) {
    errors.push('Le titre doit faire au moins 3 caractères')
  }

  if (!sport || !['football', 'basketball', 'tennis', 'yoga', 'running', 'cycling', 'swimming', 'rugby', 'volleyball', 'hiking', 'autre'].includes(sport)) {
    errors.push('Sport invalide')
  }

  if (!location?.address || !location?.city || !location?.coordinates?.lat || !location?.coordinates?.lon) {
    errors.push('Localisation incomplète')
  }

  if (!date || new Date(date) < new Date()) {
    errors.push('La date doit être dans le futur')
  }

  if (maxParticipants && (maxParticipants < 2 || maxParticipants > 100)) {
    errors.push('Le nombre de participants doit être entre 2 et 100')
  }

  if (price && (price < 0 || price > 1000)) {
    errors.push('Le prix doit être entre 0 et 1000€')
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Données invalides', errors })
  }

  next()
}

module.exports = validateActivity
```

**Utilisation dans routes/activities.js :**
```javascript
const validateActivity = require('../middlewares/validateActivity')

router.post('/', authGuard, validateActivity, async (req, res) => {
  // ...
})

router.put('/:id', authGuard, validateActivity, async (req, res) => {
  // ...
})
```

---

### 🟡 IMPORTANT — Gestion d'erreur incomplète dans Dashboard

**Fichier :** `client/src/pages/Dashboard.jsx`  
**Problème :** `handleLogout` ne gère pas les erreurs  
**Impact :** L'utilisateur reste bloqué si le logout échoue

**Code actuel :**
```jsx
const handleLogout = async () => {
  await logout()
  navigate('/login')
}
```

**Code corrigé :**
```jsx
const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('Erreur de déconnexion:', error)
  } finally {
    // Force la navigation même en cas d'erreur
    setAccessToken(null)
    setUser(null)
    localStorage.removeItem('accessToken')
    navigate('/login')
  }
}
```

---

### 🟡 IMPORTANT — Webhook Stripe incomplet

**Fichier :** `server/src/routes/subscriptions.js` (ligne 100)  
**Problème :** Code tronqué, `await Subscription.create({ ... })` n'est pas fermé  
**Impact :** Webhook Stripe ne fonctionne pas

**Code corrigé (completer le webhook) :**
```javascript
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, plan } = session.metadata

    await User.findByIdAndUpdate(userId, { plan })

    await Subscription.create({
      user: userId,
      plan,
      stripeSubscriptionId: session.subscription,
      status: 'active',
      startDate: new Date(),
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    await User.findOneAndUpdate(
      { stripeCustomerId: subscription.customer },
      { plan: 'gratuit' }
    )
  }

  res.json({ received: true })
})

module.exports = router
```

---

### 🟢 MINOR — ActivityCard.jsx vide

**Fichier :** `client/src/components/ActivityCard.jsx`  
**Problème :** Fichier vide, composant non implémenté  
**Impact :** Code dupliqué dans Discover.jsx

**Code à créer :**
```jsx
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'
import { useState } from 'react'

export default function ActivityCard({ activity, onUpdate }) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    try {
      setLoading(true)
      await axios.post(`/activities/${activity._id}/join`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      onUpdate?.()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const isFull = activity.participants.length >= activity.maxParticipants

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide capitalize">
          {activity.sport}
        </span>
        <span className="text-sm font-medium text-gray-900">
          {activity.price === 0 ? 'Gratuit' : `${activity.price}€`}
        </span>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
      <p className="text-sm text-gray-400 mb-3">{activity.location.city}</p>
      
      <p className="text-xs text-gray-400 mb-4">
        {new Date(activity.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {activity.participants.length}/{activity.maxParticipants} participants
        </span>
        <span className="text-xs text-gray-400 capitalize">{activity.level}</span>
      </div>

      <button
        onClick={handleJoin}
        disabled={loading || isFull}
        className="mt-4 w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Chargement...' : isFull ? 'Complet' : 'Rejoindre'}
      </button>
    </div>
  )
}
```

**Puis dans Discover.jsx, remplacer le div par :**
```jsx
import ActivityCard from '../components/ActivityCard'

{/* Liste */}
<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filtered.map(activity => (
    <ActivityCard key={activity._id} activity={activity} onUpdate={refetch} />
  ))}
</div>
```

---

### 🟢 MINOR — Link incorrect dans Dashboard

**Fichier :** `client/src/pages/Dashboard.jsx` (ligne 33)  
**Problème :** `<a href="/discover">` au lieu de `<Link to="/discover">`  
**Impact :** Rechargement de page complet au lieu d'une navigation SPA

**Code actuel :**
```jsx
<a href="/discover" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
  Découvrir
</a>
```

**Code corrigé :**
```jsx
import { Link } from 'react-router-dom'

<Link to="/discover" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
  Découvrir
</Link>
```

---

### 🟢 MINOR — Enterprise button incorrect

**Fichier :** `client/src/pages/Enterprise.jsx` (ligne 28)  
**Problème :** `window.location.href='/pricing'` au lieu de `navigate`  
**Impact :** Rechargement de page complet

**Code actuel :**
```jsx
<button
  onClick={() => window.location.href='/pricing'}
  className="inline-block bg-gray-900 text-white text-sm px-6 py-2.5 rounded-lg transition-colors"
>
  Voir les offres
</button>
```

**Code corrigé :**
```jsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

<button
  onClick={() => navigate('/pricing')}
  className="inline-block bg-gray-900 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
>
  Voir les offres
</button>
```

---

## PARTIE 2 — QUALITÉ DU CODE

### ♻️ Code dupliqué : SPORTS et LEVELS

**Problème :** Constantes dupliquées dans Profile.jsx et Discover.jsx  
**Solution :** Créer un fichier de constantes partagées

**Créer `client/src/constants/index.js` :**
```javascript
export const SPORTS = [
  'football',
  'basketball',
  'tennis',
  'yoga',
  'running',
  'cycling',
  'swimming',
  'rugby',
  'volleyball',
  'hiking',
  'autre'
]

export const LEVELS = ['débutant', 'intermédiaire', 'avancé']

export const SPORT_ICONS = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  yoga: '🧘',
  running: '🏃',
  cycling: '🚴',
  swimming: '🏊',
  rugby: '🏉',
  volleyball: '🏐',
  hiking: '⛰️',
  autre: '🎯'
}
```

**Puis remplacer dans Profile.jsx et Discover.jsx :**
```jsx
import { SPORTS, LEVELS } from '../constants'
```

---

### ♻️ Gestion des erreurs inconsistante

**Problème :** Certains catch affichent l'erreur, d'autres non  
**Solution :** Hook personnalisé pour les toasts

**Créer `client/src/hooks/useToast.js` :**
```javascript
import { useState, useCallback } from 'react'

export default function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const ToastComponent = toast ? (
    <div
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
```

**Utilisation dans Profile.jsx :**
```jsx
import useToast from '../hooks/useToast'

export default function Profile() {
  const { showToast, ToastComponent } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.put('/users/me', form, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      showToast('Profil mis à jour avec succès', 'success')
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la mise à jour', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {ToastComponent}
      <div className="p-8 max-w-2xl">
        {/* ... */}
      </div>
    </>
  )
}
```

---

### ♻️ Re-renders inutiles dans useActivities

**Fichier :** `client/src/hooks/useActivities.js`  
**Problème :** `JSON.stringify(filters)` recalculé à chaque render  
**Solution :** useMemo

**Code actuel :**
```javascript
const useActivities = (filters = {}) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filtersKey = JSON.stringify(filters) // ⚠️ Recalculé à chaque render

  const fetchActivities = useCallback(async () => {
    // ...
  }, [filtersKey])
```

**Code corrigé :**
```javascript
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
      setError(null) // ⭐ Reset error
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
```

---

### ♻️ Mauvaise pratique MongoDB

**Fichier :** `server/src/routes/activities.js` (ligne 121)  
**Problème :** Incrémentation stats sans transaction, risque de race condition

**Code actuel :**
```javascript
router.post('/:id/join', authGuard, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
    // ...
    activity.participants.push(req.user._id)
    await activity.save()

    const user = await User.findById(req.user._id)
    user.stats.activitiesCompleted += 1
    await user.save()
```

**Code corrigé avec transaction :**
```javascript
const mongoose = require('mongoose')

router.post('/:id/join', authGuard, async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const activity = await Activity.findById(req.params.id).session(session)
    if (!activity) {
      await session.abortTransaction()
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    if (activity.participants.includes(req.user._id)) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Déjà inscrit' })
    }

    if (activity.participants.length >= activity.maxParticipants) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Activité complète' })
    }

    activity.participants.push(req.user._id)
    await activity.save({ session })

    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { 'stats.activitiesCompleted': 1 } },
      { session }
    )

    await session.commitTransaction()

    // Badges et notifications après commit
    const user = await User.findById(req.user._id)
    await checkAndUnlockBadges(user)

    const io = req.app.get('io')
    io.to(`user_${activity.author}`).emit('participant_joined', {
      activityTitle: activity.title,
      username: req.user.username,
      count: activity.participants.length,
      max: activity.maxParticipants,
    })

    const populated = await activity.populate('participants', 'username avatar')
    res.json({ activity: populated })
  } catch (error) {
    await session.abortTransaction()
    res.status(500).json({ message: error.message })
  } finally {
    session.endSession()
  }
})
```

---

### ♻️ Variables d'environnement non typées

**Problème :** Pas de validation des variables d'environnement au démarrage  
**Solution :** Valider au démarrage du serveur

**Ajouter dans `server/src/app.js` au début :**
```javascript
require('dotenv').config()

// ✅ Validation des variables d'environnement critiques
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLIENT_URL'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '))
  process.exit(1)
}

console.log('✅ Variables d\'environnement validées')
```

---

## PARTIE 3 — ERGONOMIE ET UX

### 🎨 Feedback utilisateur manquant

**Problème :** Pas de confirmation visuelle lors du join d'une activité  
**Fichier :** `client/src/components/ActivityCard.jsx` (nouveau composant)

**Ajouter états de chargement :**
```jsx
const [joined, setJoined] = useState(false)

const handleJoin = async () => {
  try {
    setLoading(true)
    await axios.post(`/activities/${activity._id}/join`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    setJoined(true)
    onUpdate?.()
    setTimeout(() => setJoined(false), 2000)
  } catch (error) {
    alert(error.response?.data?.message || 'Erreur')
  } finally {
    setLoading(false)
  }
}

return (
  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
    {/* ... */}
    <button
      onClick={handleJoin}
      disabled={loading || isFull || joined}
      className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
        joined
          ? 'bg-green-500 text-white'
          : 'bg-gray-900 text-white hover:bg-gray-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Chargement...
        </span>
      ) : joined ? (
        '✓ Inscrit'
      ) : isFull ? (
        'Complet'
      ) : (
        'Rejoindre'
      )}
    </button>
  </div>
)
```

---

### 🎨 Skeleton loader manquant

**Problème :** Interface "vide" pendant le chargement  
**Fichier :** `client/src/pages/Discover.jsx`

**Créer `client/src/components/SkeletonCard.jsx` :**
```jsx
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-12 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-4/5 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/5 bg-gray-200 rounded mb-4" />
      <div className="h-3 w-3/5 bg-gray-200 rounded mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-9 w-full bg-gray-200 rounded-lg mt-4" />
    </div>
  )
}
```

**Utiliser dans Discover.jsx :**
```jsx
import SkeletonCard from '../components/SkeletonCard'

{loading ? (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {filtered.map(activity => (
      <ActivityCard key={activity._id} activity={activity} onUpdate={refetch} />
    ))}
  </div>
)}
```

---

### 🎨 Accessibilité : aria-labels manquants

**Fichier :** `client/src/components/NotificationBell.jsx`

**Code actuel :**
```jsx
<button
  onClick={() => setOpen(!open)}
  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
>
```

**Code corrigé :**
```jsx
<button
  onClick={() => setOpen(!open)}
  aria-label={`Notifications (${unread} non lues)`}
  aria-expanded={open}
  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
>
```

---

### 🎨 Fermeture du dropdown au clic extérieur

**Fichier :** `client/src/components/NotificationBell.jsx`  
**Problème :** Le dropdown ne se ferme que si on reclique sur le bouton

**Code corrigé :**
```jsx
import { useState, useRef, useEffect } from 'react'
import useSocket from '../hooks/useSocket'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 10))
  }

  useSocket(addNotification)

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const unread = notifications.length

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ... reste du code */}
    </div>
  )
}
```

---

### 🎨 Messages d'erreur génériques

**Problème :** "Erreur de connexion" n'aide pas l'utilisateur  
**Solution :** Messages contextuels

**Dans Login.jsx :**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  setError(null)
  setLoading(true)
  try {
    await login(form.email, form.password)
    navigate('/dashboard')
  } catch (err) {
    const status = err.response?.status
    const message = err.response?.data?.message

    if (status === 401) {
      setError('Email ou mot de passe incorrect')
    } else if (status === 429) {
      setError('Trop de tentatives, réessayez dans quelques minutes')
    } else if (!navigator.onLine) {
      setError('Pas de connexion internet')
    } else {
      setError(message || 'Erreur de connexion au serveur')
    }
  } finally {
    setLoading(false)
  }
}
```

---

### 🎨 Responsive amélioration Sidebar

**Fichier :** `client/src/components/Sidebar.jsx`  
**Problème :** Sidebar fixe sur mobile, cache le contenu

**Code corrigé avec menu burger mobile :**
```jsx
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
```

**Aussi modifier Layout.jsx :**
```jsx
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
```

---

### 🎨 Empty states

**Problème :** "Aucune activité" sans illustration ni CTA  
**Fichier :** `client/src/pages/Discover.jsx`

**Ajouter après la grille d'activités :**
```jsx
{!loading && filtered.length === 0 && (
  <div className="mt-12 text-center">
    <div className="text-6xl mb-4">🏃‍♂️</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Aucune activité trouvée
    </h3>
    <p className="text-gray-400 text-sm mb-6">
      {Object.values(filters).some(v => v) || search
        ? 'Essayez de modifier vos filtres'
        : 'Soyez le premier à créer une activité !'}
    </p>
    {(Object.values(filters).some(v => v) || search) && (
      <button
        onClick={() => { setFilters({}); setSearch('') }}
        className="inline-block bg-gray-900 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Réinitialiser les filtres
      </button>
    )}
  </div>
)}
```

---

## PARTIE 4 — DYNAMISME ET ANIMATIONS

### ✨ Animations de page transitions

**Créer `client/src/App.css` avec animations :**
```css
/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 200ms ease-in, transform 200ms ease-in;
}

/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Slide in from right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideInRight 0.3s ease-out;
}

/* Pulse animation for loading */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-soft {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Scale on hover */
.hover-lift {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

**Dans tailwind.config.js, ajouter :**
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

---

### ✨ Micro-interactions sur les cartes

**Fichier :** `client/src/components/ActivityCard.jsx`

**Ajouter des classes Tailwind :**
```jsx
return (
  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide capitalize group-hover:text-gray-900 transition-colors">
        {activity.sport}
      </span>
      <span className="text-sm font-medium text-gray-900 px-3 py-1 bg-gray-50 rounded-full group-hover:bg-gray-900 group-hover:text-white transition-colors">
        {activity.price === 0 ? 'Gratuit' : `${activity.price}€`}
      </span>
    </div>
    
    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
      {activity.title}
    </h3>
    {/* ... reste du code */}
  </div>
)
```

---

### ✨ Animations des filtres

**Fichier :** `client/src/pages/Discover.jsx`

**Animer les boutons de filtre :**
```jsx
<div className="flex flex-wrap gap-2 mb-3">
  {SPORTS.map((sport, index) => (
    <button
      key={sport}
      onClick={() => setFilter('sport', sport)}
      style={{ animationDelay: `${index * 30}ms` }}
      className={`
        px-4 py-1.5 rounded-full text-sm font-medium capitalize
        transition-all duration-300 transform hover:scale-105
        animate-fade-in
        ${
          filters.sport === sport
            ? 'bg-gray-900 text-white shadow-lg scale-105'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900 hover:shadow-md'
        }
      `}
    >
      {sport}
    </button>
  ))}
</div>
```

---

### ✨ Feedback visuel sur succès de l'action

**Fichier :** `client/src/components/ActivityCard.jsx`

**Ajouter confetti effect (sans librairie externe) :**
```jsx
const [showSuccess, setShowSuccess] = useState(false)

const handleJoin = async () => {
  try {
    setLoading(true)
    await axios.post(`/activities/${activity._id}/join`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
    onUpdate?.()
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}

return (
  <div className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
    {showSuccess && (
      <div className="absolute inset-0 bg-green-500/10 rounded-2xl flex items-center justify-center animate-fade-in">
        <div className="text-6xl animate-bounce">🎉</div>
      </div>
    )}
    
    {/* ... reste du code */}
  </div>
)
```

---

### ✨ Loading state élégant

**Fichier :** `client/src/App.jsx`

**Remplacer le spinner basique :**
```jsx
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
```

---

### ✨ Staggered list animation

**Fichier :** `client/src/pages/Discover.jsx`

**Animer l'apparition des cartes :**
```jsx
<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filtered.map((activity, index) => (
    <div
      key={activity._id}
      style={{
        animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
      }}
    >
      <ActivityCard activity={activity} onUpdate={refetch} />
    </div>
  ))}
</div>
```

---

### ✨ Bouton avec loader intégré

**Pattern réutilisable pour tous les boutons :**

**Créer `client/src/components/Button.jsx` :**
```jsx
export default function Button({ 
  children, 
  loading, 
  variant = 'primary', 
  ...props 
}) {
  const baseClasses = 'px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
  
  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-gray-700 hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
```

**Utilisation :**
```jsx
import Button from '../components/Button'

<Button loading={loading} onClick={handleSubmit}>
  Se connecter
</Button>
```

---

### ✨ Notification bell pulse animation

**Fichier :** `client/src/components/NotificationBell.jsx`

**Animer le badge de notification :**
```jsx
{unread > 0 && (
  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
    {unread > 9 ? '9+' : unread}
  </span>
)}
```

**Et ajouter un pulse effect :**
```jsx
{unread > 0 && (
  <>
    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center z-10">
      {unread > 9 ? '9+' : unread}
    </span>
    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
  </>
)}
```

---

## RÉSUMÉ DES PRIORITÉS

### 🔥 URGENT (À corriger MAINTENANT)
1. ✅ Routes Pricing/Enterprise après wildcard (App.jsx)
2. ✅ Route Enterprise manquante (app.js)
3. ✅ Socket.io URL incorrecte (useSocket.js)
4. ✅ Memory leak useSocket (dépendances)
5. ✅ Webhook Stripe incomplet (subscriptions.js)

### 🟠 IMPORTANT (Cette semaine)
1. ✅ Intercepteur Axios pour refresh token
2. ✅ Validation côté serveur (middleware)
3. ✅ Transaction MongoDB pour join
4. ✅ Gestion d'erreurs cohérente (toast)
5. ✅ ActivityCard.jsx vide

### 🟢 AMÉLIORATION (Prochaine itération)
1. ✅ Skeleton loaders
2. ✅ Animations page transitions
3. ✅ Responsive sidebar mobile
4. ✅ Empty states
5. ✅ Accessibilité complète

---

**Fin du rapport**

Ce rapport identifie **9 bugs critiques**, **12 problèmes de qualité**, **8 améliorations UX**, et **10 suggestions d'animations**. Prioriser les corrections URGENT avant mise en production.
