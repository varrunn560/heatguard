import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export default function WBGTGauge({ wbgtValue, riskLevel }) {
  const value = parseFloat(wbgtValue) || 0
  const min = 15
  const max = 40
  const percent = Math.min((value - min) / (max - min), 1)

  const data = [
    { value: percent },
    { value: 1 - percent }
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
      <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">WBGT Gauge</p>
      <div className="relative w-64 h-36">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={riskLevel?.color || "#00e400"} />
              <Cell fill="#1f2937" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-4xl font-black" style={{ color: riskLevel?.color }}>{wbgtValue}°</span>
          <span className="text-sm font-bold" style={{ color: riskLevel?.color }}>{riskLevel?.label}</span>
        </div>
      </div>
      <div className="flex justify-between w-full px-4 text-xs text-gray-500 mt-1">
        <span>15°C Safe</span>
        <span>40°C Extreme</span>
      </div>
    </div>
  )
}