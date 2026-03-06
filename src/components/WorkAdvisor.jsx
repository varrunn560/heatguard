export default function WorkAdvisor({ riskLevel, wbgtValue, cityName, jobType, onJobTypeChange }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-orange-400 mb-4">👷 Work Advisory — {cityName}</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-1">Job Type</p>
          <select
            className="bg-gray-800 text-white px-3 py-2 rounded-lg w-full mb-4"
            value={jobType}
            onChange={e => onJobTypeChange(e.target.value)}
          >
            <option value="heavy">Heavy — Digging, Carrying, Concrete (limit: 25°C)</option>
            <option value="moderate">Moderate — Bricklaying, Plastering (limit: 28°C)</option>
            <option value="light">Light — Supervision, Finishing (limit: 30°C)</option>
          </select>
          <div className="p-4 rounded-xl border-2 text-center" style={{ borderColor: riskLevel?.color }}>
            <p className="text-gray-400 text-xs mb-1">Risk Level for {jobType} work</p>
            <p className="text-xl font-black mb-1" style={{ color: riskLevel?.color }}>{riskLevel?.label}</p>
            <p className="text-white font-semibold text-lg">{riskLevel?.schedule}</p>
            <p className="text-blue-400 text-sm mt-2">💧 {riskLevel?.water}</p>
          </div>
        </div>
        <div className="flex-1 bg-gray-800 rounded-xl p-4">
          <p className="text-orange-400 font-bold mb-3">⚠️ ILO Safety Rules Today</p>
          <ul className="text-sm text-gray-300 flex flex-col gap-2">
            <li>✅ Inform all workers of WBGT before work starts</li>
            <li>✅ Mandatory water break every interval — no exceptions</li>
            <li>✅ Buddy system — no worker alone during orange/red</li>
            <li>✅ Watch for dizziness, confusion, stopped sweating</li>
            <li>✅ Move to shade immediately if symptoms appear</li>
            <li>✅ Keep oral rehydration salts available on site</li>
          </ul>
        </div>
      </div>
    </div>
  )
}