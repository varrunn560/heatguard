import { useState, useEffect } from "react"
import { geocodeCity, getCurrentWeather, getHistoricalWeather, getAirQuality } from "./services/openmeteo"
import { computeWBGT, getILOLevel } from "./utils/wbgt"
import { generateAlerts } from "./utils/alerts"
import WorkAdvisor from "./components/WorkAdvisor"
import AlertPanel from "./components/AlertPanel"
import StatsRow from "./components/StatsRow"
import CityCompare from "./components/CityCompare"
import Map from "./components/Map"
import WBGTGauge from "./components/WBGTGauge"
import HourlyTimeline from "./components/HourlyTimeline"
import TrendChart from "./components/TrendChart"
import ForecastChart from "./components/ForecastChart"

const QUICK_CITIES = ["Delhi", "Chennai", "Mumbai", "Kolkata", "Hyderabad", "Bengaluru", "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Chandigarh", "Bhopal", "Patna", "Kochi", "Guwahati", "Surat", "Nagpur", "Visakhapatnam", "Bhubaneswar", "Indore"]

export default function App() {
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
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
    setShowDropdown(false)
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
      const risk = getILOLevel(wbgt, jobType)
      setWbgtValue(wbgt.toFixed(1))
      setRiskLevel(risk)
      setAlerts(generateAlerts(hist.daily, aq, loc.name))
    } catch (e) {
      setError("Something went wrong. Check your connection.")
    }
    setLoading(false)
  }

  function handleJobTypeChange(type) {
    setJobType(type)
    if (wbgtValue) {
      const risk = getILOLevel(parseFloat(wbgtValue), type)
      setRiskLevel(risk)
    }
  }

  const filteredCities = QUICK_CITIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => { loadCityData("Delhi") }, [])

  const tabs = ["dashboard", "map", "trends", "compare"]

  return (
    <div className="bg-gray-950 min-h-screen text-white font-sans" onClick={() => setShowDropdown(false)}>

      {/* HEADER */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex flex-col md:flex-row items-center gap-4 sticky top-0 z-50">
        <h1 className="text-2xl font-black text-orange-500 tracking-widest">🔥 HEATGUARD</h1>

        <div className="flex gap-2 flex-1 justify-center">
          <div className="relative" onClick={e => e.stopPropagation()}>
            <input
              className="bg-gray-800 text-white px-4 py-2 rounded-lg w-72 outline-none border border-gray-700 focus:border-orange-500"
              placeholder="Search any city in India..."
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={e => { if (e.key === "Enter") { loadCityData(search); setShowDropdown(false) } }}
            />
            {showDropdown && search.length > 0 && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 w-72 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-50 max-h-52 overflow-y-auto shadow-xl">
                {filteredCities.map(c => (
                  <div
                    key={c}
                    onClick={() => { setSearch(c); loadCityData(c) }}
                    className="px-4 py-2 hover:bg-orange-500 cursor-pointer text-sm text-white border-b border-gray-700 last:border-0"
                  >{c}</div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => loadCityData(search)}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-bold"
          >Search</button>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {QUICK_CITIES.slice(0, 6).map(c => (
            <button key={c}
              onClick={() => { setSearch(c); loadCityData(c) }}
              className="bg-gray-800 hover:bg-orange-500 text-xs px-3 py-1 rounded-full transition-colors"
            >{c}</button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 px-6 pt-4 flex-wrap">
        {tabs.map(t => (
          <button key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-t-lg capitalize font-semibold text-sm transition-colors ${activeTab === t ? "bg-gray-800 text-orange-500" : "text-gray-400 hover:text-white"}`}
          >{t}</button>
        ))}
      </div>

      {/* MAIN */}
      <div className="px-6 py-4">
        {loading && (
          <div className="text-center text-orange-400 text-xl py-20 animate-pulse">
            Loading heat data for {search || "Delhi"}...
          </div>
        )}
        {error && (
          <div className="text-center text-red-400 text-lg py-10">{error}</div>
        )}

        {!loading && !error && weather && (
          <>
            {/* CITY TITLE */}
            <div className="mb-4">
              <h2 className="text-3xl font-black">
                {location?.name}, <span className="text-gray-400">{location?.country}</span>
              </h2>
              <p className="text-gray-500 text-sm">Live occupational heat stress intelligence</p>
            </div>

            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="flex flex-col gap-4">
                <AlertPanel alerts={alerts} />
                <StatsRow
                  temp={weather.current.temperature_2m}
                  humidity={weather.current.relative_humidity_2m}
                  windSpeed={weather.current.windspeed_10m}
                  aqi={airQuality?.aqi}
                />
                <div className="rounded-2xl p-8 border border-gray-800 bg-gray-900 flex flex-col items-center justify-center">
                  <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Live WBGT Index</p>
                  <div className="text-9xl font-black mb-2" style={{ color: riskLevel?.color }}>{wbgtValue}°</div>
                  <div className="text-3xl font-bold mb-1" style={{ color: riskLevel?.color }}>{riskLevel?.label}</div>
                  <div className="text-gray-300 text-center mt-2 text-lg font-semibold">{riskLevel?.schedule}</div>
                  <div className="text-blue-400 text-sm mt-1">💧 {riskLevel?.water}</div>
                </div>
                <WorkAdvisor
                  riskLevel={riskLevel}
                  wbgtValue={wbgtValue}
                  cityName={location?.name}
                  jobType={jobType}
                  onJobTypeChange={handleJobTypeChange}
                />
              </div>
            )}

            {/* MAP */}
            {activeTab === "map" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-orange-400">🗺️ Air Quality Map — India</h3>
                  <p className="text-gray-500 text-sm">Live AQI across 15 major cities. Click any city for AI worker advisory.</p>
                </div>
                <div className="h-[600px]">
                  <Map location={location} />
                </div>
              </div>
            )}

            {/* TRENDS */}
            {activeTab === "trends" && (
              <div className="flex flex-col gap-4">
                <WBGTGauge wbgtValue={wbgtValue} riskLevel={riskLevel} />
                <HourlyTimeline hourlyData={weather?.hourly} />
                <TrendChart historical={historical} />
                <ForecastChart forecast={weather?.daily} />
              </div>
            )}

            {/* COMPARE */}
            {activeTab === "compare" && (
              <CityCompare />
            )}
          </>
        )}
      </div>
    </div>
  )
}