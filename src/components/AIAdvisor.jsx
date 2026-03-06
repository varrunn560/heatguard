import { useState, useEffect } from "react"

export default function AIAdvisor({ cityName, wbgtValue, riskLevel, jobType, airQuality, weather }) {
  const [briefing, setBriefing] = useState("")
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  async function generateBriefing() {
    setBriefingLoading(true)
    setBriefing("")
    try {
      const prompt = `You are HeatGuard AI, an occupational heat stress expert for Indian construction and informal workers.

Current data for ${cityName}:
- WBGT: ${wbgtValue}°C
- Risk Level: ${riskLevel?.label}
- Recommended Schedule: ${riskLevel?.schedule}
- Air Temperature: ${weather?.current?.temperature_2m}°C
- Humidity: ${weather?.current?.relative_humidity_2m}%
- Wind Speed: ${weather?.current?.windspeed_10m} km/h
- AQI: ${airQuality?.aqi}
- PM2.5: ${airQuality?.pm25} μg/m³
- Job Type: ${jobType}

Write a short, clear daily safety briefing (4-5 sentences) for a construction site supervisor in ${cityName} today. 
Include: current risk, specific work hours to avoid, hydration advice, and one key warning. 
Use simple language. Be direct and actionable. End with one line in Hindi.`

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      })
      const data = await response.json()
      setBriefing(data.content?.[0]?.text || "Unable to generate briefing.")
    } catch (e) {
      setBriefing("Error generating briefing. Check your connection.")
    }
    setBriefingLoading(false)
  }

  async function sendMessage() {
    if (!input.trim()) return
    const userMsg = { role: "user", content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setChatLoading(true)

    try {
      const systemPrompt = `You are HeatGuard AI, an occupational heat stress expert for Indian construction and informal workers.

Current conditions in ${cityName}:
- WBGT: ${wbgtValue}°C (${riskLevel?.label})
- Schedule: ${riskLevel?.schedule}
- Temperature: ${weather?.current?.temperature_2m}°C
- Humidity: ${weather?.current?.relative_humidity_2m}%
- AQI: ${airQuality?.aqi}, PM2.5: ${airQuality?.pm25} μg/m³
- Job Type selected: ${jobType}

Answer questions about heat safety, work schedules, first aid for heat stroke, ILO guidelines, and worker protection. 
Be concise, practical, and use simple language suitable for site supervisors and contractors.
When relevant, refer to the current ${cityName} conditions above.`

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages
        })
      })
      const data = await response.json()
      const aiMsg = { role: "assistant", content: data.content?.[0]?.text || "Sorry, I could not respond." }
      setMessages([...newMessages, aiMsg])
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "Error. Check your connection." }])
    }
    setChatLoading(false)
  }

  useEffect(() => {
    if (cityName && wbgtValue) generateBriefing()
  }, [cityName, wbgtValue])

  return (
    <div className="flex flex-col gap-4">

      {/* AI DAILY BRIEFING */}
      <div className="bg-gray-900 border border-orange-500 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-orange-400 font-bold text-lg">🤖 AI Daily Briefing — {cityName}</p>
            <p className="text-gray-500 text-xs">Generated from live WBGT + AQI data</p>
          </div>
          <button
            onClick={generateBriefing}
            className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg text-sm font-bold"
          >Regenerate</button>
        </div>
        {briefingLoading ? (
          <div className="text-orange-400 animate-pulse text-sm">Analyzing heat conditions for {cityName}...</div>
        ) : (
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{briefing}</p>
        )}
      </div>

      {/* AI CHAT */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-orange-400 font-bold text-lg mb-1">💬 Ask HeatGuard AI</p>
        <p className="text-gray-500 text-xs mb-4">Ask about work schedules, heat stroke first aid, ILO guidelines, worker safety</p>

        {/* SUGGESTED QUESTIONS */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              "Is it safe to pour concrete today?",
              "My worker fainted, what do I do?",
              "What are signs of heat stroke?",
              "Plan my work schedule for today",
              "What does ILO say about this temperature?"
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); }}
                className="bg-gray-800 hover:bg-orange-500 text-xs px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
              >{q}</button>
            ))}
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}>
                {m.role === "assistant" && <span className="text-orange-400 font-bold text-xs block mb-1">🤖 HeatGuard AI</span>}
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-3 rounded-xl text-sm text-orange-400 animate-pulse">
                🤖 Thinking...
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg outline-none border border-gray-700 focus:border-orange-500 text-sm"
            placeholder="Ask about heat safety, schedules, first aid..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={chatLoading || !input.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2 rounded-lg font-bold text-sm"
          >Send</button>
        </div>
      </div>
    </div>
  )
}