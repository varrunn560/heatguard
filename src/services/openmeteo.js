const BASE = "https://api.open-meteo.com/v1";
const GEO = "https://geocoding-api.open-meteo.com/v1";

export async function geocodeCity(name) {
  const res = await fetch(`${GEO}/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
  const data = await res.json();
  if (!data.results?.length) return null;
  const r = data.results[0];
  return { lat: r.latitude, lon: r.longitude, name: r.name, country: r.country };
}

export async function getCurrentWeather(lat, lon) {
  const res = await fetch(
    `${BASE}/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,windspeed_10m,direct_radiation,apparent_temperature` +
    `&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,direct_radiation` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&forecast_days=7&timezone=auto`
  );
  return res.json();
}

export async function getHistoricalWeather(lat, lon) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const fmt = d => d.toISOString().split("T")[0];

  const res = await fetch(
    `${BASE}/archive?latitude=${lat}&longitude=${lon}` +
    `&start_date=${fmt(start)}&end_date=${fmt(end)}` +
    `&daily=temperature_2m_max,precipitation_sum` +
    `&timezone=auto`
  );
  return res.json();
}

export async function getAirQuality(lat, lon) {
  const res = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&current=pm10,pm2_5,european_aqi`
  );
  const data = await res.json();
  return {
    pm25: data.current?.pm2_5 ?? 0,
    pm10: data.current?.pm10 ?? 0,
    aqi: data.current?.european_aqi ?? 0,
  };
}