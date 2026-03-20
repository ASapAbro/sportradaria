import useWeather from '../hooks/useWeather'

const WeatherStat = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-medium text-gray-700">{value}</span>
  </div>
)

export default function WeatherWidget() {
  const { weather, loading, error } = useWeather()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-sm animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
        <div className="h-10 bg-gray-100 rounded w-1/3 mb-6" />
        <div className="h-4 bg-gray-100 rounded w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-sm">
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{weather.city}</h2>
          <p className="text-gray-400 text-sm capitalize">{weather.condition}</p>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.condition}
          className="w-16 h-16"
        />
      </div>

      <div className="flex items-end gap-2 mb-6">
        <span className="text-5xl font-bold text-gray-900">
          {weather.temperature}°
        </span>
        <span className="text-gray-400 text-sm mb-2">
          Ressenti {weather.feelsLike}°
        </span>
      </div>

      <div className="flex justify-around border-t border-gray-50 pt-4">
        <WeatherStat label="Vent" value={`${weather.wind} km/h`} />
        <WeatherStat label="Humidité" value={`${weather.humidity}%`} />
      </div>
    </div>
  )
}