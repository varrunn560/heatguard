export default function StatsRow({ temp, humidity, windSpeed, aqi }) {
  const stats = [
    { label: "Temperature", value: temp, unit: "°C", icon: "🌡️", color: "text-red-400" },
    { label: "Humidity", value: humidity, unit: "%", icon: "💧", color: "text-blue-400" },
    { label: "Wind Speed", value: windSpeed, unit: "km/h", icon: "💨", color: "text-green-400" },
    { label: "AQI", value: aqi, unit: "", icon: "🌫️", color: "text-yellow-400" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-1">{s.icon}</div>
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{s.label}</div>
          <div className={`text-2xl font-black ${s.color}`}>
            {s.value ?? "—"}<span className="text-sm text-gray-400">{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}