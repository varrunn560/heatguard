import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { computeWBGT, getILOLevel } from "../utils/wbgt"

export default function ForecastChart({ forecast }) {
  if (!forecast?.time) return null

  const data = forecast.time.map((t, i) => {
    const temp = forecast.temperature_2m_max[i]
    const wbgt = computeWBGT(temp, 60, 10, 400)
    const risk = getILOLevel(wbgt)
    return {
      day: new Date(t).toLocaleDateString("en", { weekday: "short", day: "numeric" }),
      wbgt: parseFloat(wbgt.toFixed(1)),
      color: risk?.color,
      label: risk?.label,
      schedule: risk?.schedule
    }
  })

  const safestDay = data.reduce((a, b) => a.wbgt < b.wbgt ? a : b)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
          <p className="font-bold text-white">{d.day}</p>
          <p style={{ color: d.color }}>WBGT: {d.wbgt}°C</p>
          <p style={{ color: d.color }}>{d.label}</p>
          <p className="text-gray-400 text-xs mt-1">{d.schedule}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">📅 7-Day WBGT Forecast</p>
      <p className="text-gray-500 text-xs mb-4">
        ⭐ Safest day to work: <span className="text-green-400 font-bold">{safestDay.day} — WBGT {safestDay.wbgt}°C</span>
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
          <YAxis stroke="#6b7280" domain={[15, 40]} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="wbgt" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                opacity={entry.day === safestDay.day ? 1 : 0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3 flex-wrap">
        {[
          { color: "#00e400", label: "Safe" },
          { color: "#ffff00", label: "Caution" },
          { color: "#ff7e00", label: "Warning" },
          { color: "#ff0000", label: "Danger" },
          { color: "#7e0023", label: "Stop Work" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}