import { useState } from "react"
import { geocodeCity, getCurrentWeather, getAirQuality } from "../services/openmeteo"
import { computeWBGT, getILOLevel } from "../utils/wbgt"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function CityCompare() {
  const [city1, setCity1] = useState("Delhi")
  const [city2, setCity2] = useState("Chennai")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  async function compare() {
    setLoading(true)
    try {
      const [loc1, loc2] = await Promise.all([geocodeCity(city1), geocodeCity(city2)])
      if (!loc1 || !loc2) { alert("City not found"); setLoading(false); return }

      const [w1, w2, aq1, aq2] = await Promise.all([
        getCurrentWeather(loc1.lat, loc1.lon),
        getCurrentWeather(loc2.lat, loc2.lon),
        getAirQuality(loc1.lat, loc1.lon),
        getAirQuality(loc2.lat, loc2.lon),
      ])

      const wbgt1 = computeWBGT(w1.current.temperature_2m, w1.current.relative_humidity_2m, w1.current.windspeed_10m, w1.current.direct_radiation)
      const wbgt2 = computeWBGT(w2.current.temperature_2m, w2.current.relative_humidity_2m, w2.current.windspeed_10m, w2.current.direct_radiation)

      setData({
        loc1: { ...loc1, wbgt: wbgt1.toFixed(1), risk: getILOLevel(wbgt1), temp: w1.current.temperature_2m, humidity: w1.current.relative_humidity_2m, aqi: aq1.aqi },
        loc2: { ...loc2, wbgt: wbgt2.toFixed(1), risk: getILOLevel(wbgt2), temp: w2.current.temperature_2m, humidity: w2.current.relative_humidity_2m, aqi: aq2.aqi },
      })
    } catch (e) { alert("Something went wrong") }
    setLoading(false)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-orange-400 mb-4">⚖️ Compare Two Cities</h3>
      <div className="flex gap-3 mb-6">
        <input className="bg-gray-800 text-white px-3 py-2 rounded-lg flex-1 border border-gray-700" value={city1} onChange={e => setCity1(e.target.value)} placeholder="City 1" />
        <input className="bg-gray-800 text-white px-3 py-2 rounded-lg flex-1 border border-gray-700" value={city2} onChange={e => setCity2(e.target.value)} placeholder="City 2" />
        <button onClick={compare} className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-bold">
          {loading ? "..." : "Compare"}
        </button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[data.loc1, data.loc2].map((c, i) => (
              <div key={i} className="rounded-xl border-2 p-4 text-center" style={{ borderColor: c.risk?.color }}>
                <p className="font-black text-xl mb-1">{c.name}</p>
                <p className="text-5xl font-black mb-1" style={{ color: c.risk?.color }}>{c.wbgt}°</p>
                <p className="font-bold mb-1" style={{ color: c.risk?.color }}>{c.risk?.label}</p>
                <p className="text-gray-400 text-sm">{c.risk?.schedule}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { metric: "WBGT", [data.loc1.name]: data.loc1.wbgt, [data.loc2.name]: data.loc2.wbgt },
              { metric: "Temp °C", [data.loc1.name]: data.loc1.temp, [data.loc2.name]: data.loc2.temp },
              { metric: "Humidity %", [data.loc1.name]: data.loc1.humidity, [data.loc2.name]: data.loc2.humidity },
              { metric: "AQI", [data.loc1.name]: data.loc1.aqi, [data.loc2.name]: data.loc2.aqi },
            ]}>
              <XAxis dataKey="metric" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
              <Legend />
              <Bar dataKey={data.loc1.name} fill="#f97316" />
              <Bar dataKey={data.loc2.name} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}