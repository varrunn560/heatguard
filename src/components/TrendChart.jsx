import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from "recharts"
import { computeWBGT, getILOLevel } from "../utils/wbgt"

export default function TrendChart({ historical }) {
  if (!historical?.daily) return null

  const { time, temperature_2m_max } = historical.daily

  const mean = temperature_2m_max.reduce((a, b) => a + b, 0) / temperature_2m_max.length
  const std = Math.sqrt(temperature_2m_max.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / temperature_2m_max.length)

  const data = time.map((t, i) => {
    const temp = temperature_2m_max[i]
    const wbgt = computeWBGT(temp, 60, 10, 400)
    const risk = getILOLevel(wbgt)
    const isAnomaly = Math.abs(temp - mean) > 2 * std
    return {
      date: new Date(t).toLocaleDateString("en", { month: "short", day: "numeric" }),
      wbgt: parseFloat(wbgt.toFixed(1)),
      color: risk?.color,
      isAnomaly,
      temp: temp.toFixed(1)
    }
  })

  const avgWbgt = data.reduce((a, b) => a + b.wbgt, 0) / data.length

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    if (payload.isAnomaly) {
      return <circle cx={cx} cy={cy} r={6} fill="#ff0000" stroke="#fff" strokeWidth={2} />
    }
    return <circle cx={cx} cy={cy} r={3} fill={payload.color} />
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
          <p className="font-bold text-white">{d.date}</p>
          <p style={{ color: d.color }}>WBGT: {d.wbgt}°C</p>
          <p className="text-gray-400">Temp: {d.temp}°C</p>
          {d.isAnomaly && <p className="text-red-400 font-bold">⚠️ Anomaly Detected</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">📈 30-Day WBGT Trend</p>
      <p className="text-gray-500 text-xs mb-4">Red dots = anomaly days — statistically abnormal heat</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} interval={4} />
          <YAxis stroke="#6b7280" domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgWbgt}
            stroke="#6b7280"
            strokeDasharray="4 4"
            label={{ value: `Avg ${avgWbgt.toFixed(1)}°`, fill: "#9ca3af", fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="wbgt"
            stroke="#f97316"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}