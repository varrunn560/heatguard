# 🔥 HeatGuard — Occupational Heat Stress Intelligence

> The only free tool that computes WBGT — the WHO and ILO standard for safe working hours — for India's 380 million informal outdoor workers.

---

## 🚨 The Problem

Between 2001 and 2020, India lost **259 billion labour hours worth ₹46 lakh crore** due to extreme heat. In 2024 alone, **247 billion hours** were lost — a single-year record.

- **71 million construction workers** have zero legal heat protection
- The BOCW Act 1996 is **completely silent on heat**
- IMD defines heatwave at 40°C — ILO recommends stopping work at 30°C
- **₹70,000 crore** in worker welfare funds sits unspent
- Every existing tool shows temperature — **none compute WBGT**

---

## ✅ What HeatGuard Does Differently

Instead of temperature, HeatGuard computes **Wet Bulb Globe Temperature (WBGT)** — the metric used by WHO, ILO, NIOSH, US Military, and Olympic committees to determine safe working hours.

**WBGT = 0.7 × Wet Bulb Temp + 0.2 × Globe Temp + 0.1 × Dry Bulb Temp**

This accounts for all 4 factors that affect the human body:
- 🌡️ Air temperature
- 💧 Humidity — how well sweat evaporates
- 💨 Wind speed — cooling effect
- ☀️ Solar radiation — direct sun load

A normal thermometer captures 1 of these 4 factors. HeatGuard captures all 4.

---

## 🧠 Features

### Dashboard
- Live WBGT value with ILO risk tier (Green / Yellow / Orange / Red)
- Job-type specific thresholds — Heavy / Moderate / Light work
- Real-time stats: Temperature, Humidity, Wind Speed, AQI
- Anomaly alerts — z-score detection when today is abnormally hot
- Plain language break schedule: *"15min work / 45min break"*
- Hydration reminders calibrated to risk level

### Map
- Live AQI map across 15 major Indian cities
- Circle size = pollution intensity
- Click any city → AI worker advisory powered by Groq LLaMA
- Map flies to searched city and highlights it

### Trends
- WBGT gauge — semicircle meter showing live risk position
- Hourly safe work windows — color coded bar chart for today
- 30-day WBGT trend with anomaly detection
- 7-day forecast with safest day to work highlighted

### Compare
- Side by side WBGT comparison of any two cities
- Bar chart comparing WBGT, Temperature, Humidity, AQI
- Highlights which city is safer in green

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Map | React Leaflet |
| Weather API | Open-Meteo (free, no key) |
| Air Quality | WAQI API |
| AI Advisory | Groq LLaMA 3.1 |
| WBGT Formula | Stull 2011 approximation |
| Hosting | Vercel |

---

## 📡 Data Sources

- **Open-Meteo** — temperature, humidity, wind speed, solar radiation, 7-day forecast, 30-day historical — completely free, no API key
- **Open-Meteo Air Quality API** — PM2.5, PM10, European AQI
- **WAQI** — real-time AQI for 15 Indian cities
- **Groq** — LLaMA 3.1 for AI worker advisories

---

## ⚡ Zero Cost Architecture

- All WBGT computation runs in the browser — no server needed
- Open-Meteo is fully free and open source
- Hosting on Vercel free tier
- Works on any ₹3,000 Android on basic 4G
- No app install, no registration, shareable via WhatsApp

---

## 🏗️ ILO Risk Thresholds

| WBGT | Heavy Work | Moderate Work | Light Work | Action |
|---|---|---|---|---|
| < 25°C | Safe | Safe | Safe | Normal breaks |
| 25–28°C | Caution | Safe | Safe | 45min/15min |
| 28–30°C | Warning | Caution | Safe | 30min/30min |
| 30–32°C | Danger | Warning | Caution | 15min/45min |
| > 32°C | STOP | Danger | Warning | Halt all heavy work |

---

## 🚀 Run Locally
```bash
git clone https://github.com/varrunn560/heatguard
cd heatguard
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 👥 Team

Built in 6 hours at [Hackathon Name]

| Person | Role |
|---|---|
| P1 | Project Lead · APIs · WBGT Logic · App.jsx |
| P2 | Map · Geospatial · Leaflet · AI Advisory |
| P3 | Charts · WBGT Gauge · Visualizations |
| P4 | UI · Work Advisor · Alerts · Compare |

---

## 📊 Impact

- **380 million** informal outdoor workers in India
- **₹46 lakh crore** lost to heat 2001–2020
- **10% reduction** in heat-lost hours = ₹4.6 lakh crore recovered
- **₹0** cost to run — zero server, zero API cost, zero install

---

## 🎯 Who Uses This

- **Site contractors** — check WBGT at 7am, share WhatsApp link to workers
- **NDMA / State DMAs** — city hotspot maps for pre-positioning medical teams
- **BOCW Welfare Boards** — direct ₹70,000 crore unspent cess toward heat interventions
- **NGOs like SEWA** — automate parametric insurance triggers using WBGT
- **Labour Departments** — build India's first heat vulnerability database

---

## 📜 Policy Context

- BOCW Act 1996 — completely silent on heat
- ILO recommends outdoor work limit at 30°C
- IMD defines heatwave at 40°C — 10°C gap with zero legal protection
- Qatar bans outdoor work 10am–3:30pm in summer
- US OSHA 2025 mandates water/shade at 80°F
- **India has nothing equivalent**

---

*Built for Problem Statement 2.3 — Environmental Intelligence Dashboard*
