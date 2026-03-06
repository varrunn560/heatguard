export function detectAnomaly(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  );
  return {
    mean,
    std,
    anomalies: values.map(v => ({
      v,
      z: ((v - mean) / std).toFixed(2),
      isAnomaly: Math.abs(v - mean) > 2 * std
    }))
  };
}

export function generateAlerts(hist, aq, city) {
  const alerts = [];

  if (!hist || !hist.temperature_2m_max) return alerts;

  const { anomalies } = detectAnomaly(hist.temperature_2m_max);
  const today = anomalies.at(-1);

  if (today?.isAnomaly) alerts.push({
    type: 'danger',
    icon: '🌡️',
    title: `Heat Spike Detected in ${city}`,
    message: `Today is ${today.z}σ above the 30-day average — extreme caution required`
  });

  if (aq?.pm25 > 35) alerts.push({
    type: 'warning',
    icon: '🫁',
    title: 'Dangerous Air Quality',
    message: `PM2.5 at ${aq.pm25.toFixed(1)} μg/m³ — above WHO safe limit of 35`
  });

  if (aq?.aqi > 150) alerts.push({
    type: 'warning',
    icon: '😷',
    title: 'High AQI Alert',
    message: `AQI is ${aq.aqi} — outdoor exposure risk is high for vulnerable workers`
  });

  return alerts;
}