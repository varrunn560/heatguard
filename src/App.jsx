import { useState, useEffect } from "react"
import { geocodeCity, getCurrentWeather, getHistoricalWeather, getAirQuality } from "./services/openmeteo"
import { computeWBGT, getILOLevel } from "./utils/wbgt"
import { generateAlerts } from "./utils/alerts"

const QUICK_CITIES = ["Delhi", "Chennai", "Mumbai", "Kolkata", "Hyderabad", "Bengaluru"]

export default function App() {
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [historical, setHistorical] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [wbgtValue, setWbgtValue] = useState(null)
  const [riskLevel, setRiskLevel] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [jobType, setJobType] = useState("moderate")
  const [error, setError] = useState(null)

  async function loadCityData(cityName) {
    setLoading(true)
    setError(null)
    try {
      const loc = await geocodeCity(cityName)
      if (!loc) { setError("City not found. Try another name."); setLoading(false); return }
      setLocation(loc)

      const [w, hist, aq] = await Promise.all([
        getCurrentWeather(loc.lat, loc.lon),
        getHistoricalWeather(loc.lat, loc.lon),
        getAirQuality(loc.lat, loc.lon)
      ])

      setWeather(w)
      setHistorical(hist)
      setAirQuality(aq)

      const c = w.current
      const wbgt = computeWBGT(
        c.temperature_2m,
        c.relative_humidity_2m,
        c.windspeed_10m,
        c.direct_radiation
      )
      const risk = getILOLevel(wbgt)
      setWbgtValue(wbgt.toFixed(1))
      setRiskLevel(risk)
      setAlerts(generateAlerts(hist.daily, aq, loc.name))
    } catch (e) {
      setError("Something went wrong. Check your connection.")
    }
    setLoading(false)
  }

  useEffect(() => { loadCityData("Delhi") }, [])

  const tabs = ["dashboard", "map", "trends", "compare"]

  return (
    <div className="bg-gray-950 min-h-screen text-white font-sans">

      {/* HEADER */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex flex-col md:flex-row items-center gap-4 sticky top-0 z-50">
        <h1 className="text-2xl font-black text-orange-500 tracking-widest">🔥 HEATGUARD</h1>
        <div className="flex gap-2 flex-1 justify-center">
          <input
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-64 outline-none border border-gray-700 focus:border-orange-500"
            placeholder="Search city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && loadCityData(search)}
          />
          <button
            onClick={() => loadCityData(search)}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-bold"
          >Search</button>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {QUICK_CITIES.map(c => (
            <button key={c}
              onClick={() => { setSearch(c); loadCityData(c) }}
              className="bg-gray-800 hover:bg-orange-500 text-xs px-3 py-1 rounded-full transition-colors"
            >{c}</button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 px-6 pt-4">
        {tabs.map(t => (
          <button key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-t-lg capitalize font-semibold text-sm transition-colors ${activeTab === t ? "bg-gray-800 text-orange-500" : "text-gray-400 hover:text-white"}`}
          >{t}</button>
        ))}
      </div>

      {/* MAIN */}
      <div className="px-6 py-4">
        {loading && <div className="text-center text-orange-400 text-xl py-20 animate-pulse">Loading heat data for {search || "Delhi"}...</div>}
        {error && <div className="text-center text-red-400 text-lg py-10">{error}</div>}

        {!loading && !error && weather && (
          <>
            {/* CITY TITLE */}
            <div className="mb-4">
              <h2 className="text-3xl font-black">{location?.name}, <span className="text-gray-400">{location?.country}</span></h2>
              <p className="text-gray-500 text-sm">Live occupational heat stress intelligence</p>
            </div>

            {/* ALERTS */}
            {alerts.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {alerts.map((a, i) => (
                  <div key={i} className={`flex gap-3 items-start p-4 rounded-xl border ${a.type === 'danger' ? 'border-red-500 bg-red-950' : 'border-yellow-500 bg-yellow-950'}`}>
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <p className="font-bold">{a.title}</p>
                      <p className="text-sm text-gray-300">{a.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* WBGT HERO CARD */}
                <div className="rounded-2xl p-6 border border-gray-800 bg-gray-900 flex flex-col items-center justify-center">
                  <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Live WBGT</p>
                  <div className="text-8xl font-black mb-2" style={{ color: riskLevel?.color }}>{wbgtValue}°</div>
                  <div className="text-2xl font-bold mb-1" style={{ color: riskLevel?.color }}>{riskLevel?.label}</div>
                  <div className="text-gray-300 text-center mt-2 text-lg font-semibold">{riskLevel?.schedule}</div>
                  <div className="text-blue-400 text-sm mt-1">💧 {riskLevel?.water}</div>
                </div>

                {/* STAT CARDS */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Temperature", value: weather.current.temperature_2m, unit: "°C", icon: "🌡️" },
                    { label: "Humidity", value: weather.current.relative_humidity_2m, unit: "%", icon: "💧" },
                    { label: "Wind Speed", value: weather.current.windspeed_10m, unit: "km/h", icon: "💨" },
                    { label: "AQI", value: airQuality?.aqi, unit: "", icon: "🌫️" },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-gray-400 text-xs uppercase tracking-wider">{s.label}</span>
                      <span className="text-2xl font-black text-white">{s.value}<span className="text-sm text-gray-400">{s.unit}</span></span>
                    </div>
                  ))}
                </div>

                {/* WORK ADVISOR */}
                <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-orange-400 mb-3">👷 Work Advisory — {location?.name}</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm mb-1">Job Type</p>
                      <select
                        className="bg-gray-800 text-white px-3 py-2 rounded-lg w-full mb-3"
                        value={jobType}
                        onChange={e => setJobType(e.target.value)}
                      >
                        <option value="heavy">Heavy — Digging, Carrying, Concrete</option>
                        <option value="moderate">Moderate — Bricklaying, Plastering</option>
                        <option value="light">Light — Supervision, Finishing</option>
                      </select>
                      <div className="p-4 rounded-xl border-2 text-center" style={{ borderColor: riskLevel?.color }}>
                        <p className="text-gray-400 text-xs mb-1">Recommended Schedule</p>
                        <p className="text-xl font-black" style={{ color: riskLevel?.color }}>{riskLevel?.schedule}</p>
                        <p className="text-blue-400 text-sm mt-2">💧 {riskLevel?.water}</p>
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-xl p-4">
                      <p className="text-orange-400 font-bold mb-2">⚠️ ILO Safety Rules for Today</p>
                      <ul className="text-sm text-gray-300 flex flex-col gap-2">
                        <li>✅ Inform workers of today's WBGT before work starts</li>
                        <li>✅ Mandatory water break every interval — no exceptions</li>
                        <li>✅ Buddy system — no worker alone during orange/red</li>
                        <li>✅ Watch for: dizziness, confusion, stopped sweating</li>
                        <li>✅ Move to shade immediately if symptoms appear</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "map" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center text-gray-400">
                🗺️ Map component loads here — P2's work
              </div>
            )}

            {activeTab === "trends" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center text-gray-400">
                📈 Charts load here — P3's work
              </div>
            )}

            {activeTab === "compare" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center text-gray-400">
                ⚖️ City compare loads here — P4's work
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}