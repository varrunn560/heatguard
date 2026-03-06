import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { computeWBGT, getILOLevel } from "../utils/wbgt"

export default function HourlyTimeline({ hourlyData }) {
  if (!hourlyData) return null

  const { time, temperature_2m, relative_humidity_2m, windspeed_10m, direct_radiation } = hourlyData

  const todayStr = new Date().toISOString().split("T")[0]

  const data = time
    .map((t, i) => {
      if (!t.startsWith(todayStr)) return null
      const hour = new Date(t).getHours()
      if (hour < 5 || hour > 20) return null
      const wbgt = computeWBGT(
        temperature_2m[i],
        relative_humidity_2m[i],
        windspeed_10m[i],
        direct_radiation[i]
      )
      const risk = getILOLevel(wbgt)
      return {
        hour: `${hour}:00`,
        wbgt: parseFloat(wbgt.toFixed(1)),
        color: risk?.color,
        label: risk?.label
      }
    })
    .filter(Boolean)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
          <p className="font-bold text-white">{d.hour}</p>
          <p style={{ color: d.color }}>WBGT: {d.wbgt}°C</p>
          <p style={{ color: d.color }}>{d.label}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">⏱ Hourly Safe Work Windows — Today</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="hour" stroke="#6b7280" tick={{ fontSize: 11 }} />
          <YAxis stroke="#6b7280" domain={[15, 40]} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="wbgt" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
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