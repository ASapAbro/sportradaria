# Roadmap SportRadaria

## ✅ Étape 0 — Setup projet + Docker dev
- Monorepo client / server
- React + Vite + Tailwind CSS
- Node.js + Express
- MongoDB Atlas + Mongoose
- docker-compose.yml avec 3 services
- Dockerfiles de développement avec hot-reload

## ✅ Étape 1a — Auth backend
- Modèle User (Mongoose + bcrypt)
- JWT access token (15min) + refresh token (7j, cookie httpOnly)
- Routes : /register /login /logout /refresh /me
- Middleware authGuard

## ✅ Étape 1b — Auth frontend
- Page Login avec gestion d'erreurs
- Page Register avec validation
- Redirection automatique vers Dashboard
- ProtectedRoute — routes privées
- AuthContext + refresh silencieux au montage

## ✅ Étape 2 — Météo temps réel
- Proxy Express → OpenWeatherMap (clé API cachée)
- Géolocalisation navigateur
- Widget météo : température, condition, vent, humidité
- Rafraîchissement automatique toutes les 10 minutes

## 🔜 Étape 3 — Activités sportives (CRUD + carte)
- Modèle Activity (titre, sport, lieu, date, participants)
- CRUD complet avec routes protégées
- Carte interactive Leaflet.js
- Marqueurs par sport, filtres, rejoindre une activité

## 🔜 Étape 4 — Profil, recherche et notifications
- Profil utilisateur avec avatar (Cloudinary)
- Recherche full-text MongoDB (sport / ville / date)
- Notifications temps réel Socket.io
- Dashboard personnel

## 🔜 Étape 5 — Dockerfile production (multi-stage)
- Dockerfile client : Vite build → Nginx alpine
- Dockerfile server : multi-stage Node alpine
- docker-compose.prod.yml avec healthchecks

## 🔜 Étape 6 — CI/CD + déploiement
- GitHub Actions : lint → test → docker build → push GHCR
- Railway (backend) + Vercel (frontend) + MongoDB Atlas
