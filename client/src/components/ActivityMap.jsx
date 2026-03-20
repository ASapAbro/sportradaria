import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SPORT_COLORS = {
  football: '#22c55e',
  basketball: '#f97316',
  tennis: '#eab308',
  yoga: '#a855f7',
  running: '#3b82f6',
  cycling: '#06b6d4',
  swimming: '#0ea5e9',
  rugby: '#dc2626',
  hiking: '#84cc16',
  autre: '#6b7280',
}

const createSportIcon = (sport) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${SPORT_COLORS[sport] || '#6b7280'};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })

export default function ActivityMap({ activities, center = [48.8566, 2.3522] }) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '500px', width: '100%', borderRadius: '16px' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {activities.map((activity) => {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${activity.location.coordinates.lat},${activity.location.coordinates.lon}`

        return (
          <Marker
            key={activity._id}
            position={[
              activity.location.coordinates.lat,
              activity.location.coordinates.lon,
            ]}
            icon={createSportIcon(activity.sport)}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>
                  {activity.title}
                </p>

                <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  {activity.location.address}, {activity.location.city}
                </p>

                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  {new Date(activity.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>

                <p style={{ fontSize: 12, marginBottom: 8 }}>
                  {activity.price === 0
                    ? 'Gratuit'
                    : `${activity.price}€`} ·{' '}
                  {activity.participants.length}/{activity.maxParticipants}{' '}
                  participants
                </p>

                {/* ✅ CORRECTION ICI */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#111',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    textDecoration: 'none',
                  }}
                >
                  Itinéraire
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}