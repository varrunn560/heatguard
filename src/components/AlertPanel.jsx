import { useState } from "react"

export default function AlertPanel({ alerts }) {
  const [dismissed, setDismissed] = useState(false)
  if (!alerts?.length || dismissed) return null

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-orange-400 font-bold text-sm uppercase tracking-widest">⚡ Active Alerts</p>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-gray-500 hover:text-white"
        >Dismiss all</button>
      </div>
      <div className="flex flex-col gap-2">
        {alerts.map((a, i) => (
          <div key={i} className={`flex gap-3 items-start p-4 rounded-xl border ${a.type === 'danger' ? 'border-red-500 bg-red-950' : 'border-yellow-500 bg-yellow-950'}`}>
            <span className="text-2xl">{a.icon}</span>
            <div>
              <p className="font-bold text-white">{a.title}</p>
              <p className="text-sm text-gray-300">{a.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}