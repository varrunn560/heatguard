import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';

const CITIES = [
  { name: 'Delhi',      lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai',     lat: 19.0760, lon: 72.8777 },
  { name: 'Chennai',    lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata',    lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad',  lat: 17.3850, lon: 78.4867 },
  { name: 'Bengaluru',  lat: 12.9716, lon: 77.5946 },
  { name: 'Ahmedabad',  lat: 23.0225, lon: 72.5714 },
  { name: 'Pune',       lat: 18.5204, lon: 73.8567 },
  { name: 'Jaipur',     lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow',    lat: 26.8467, lon: 80.9462 },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { name: 'Bhopal',     lat: 23.2599, lon: 77.4126 },
  { name: 'Patna',      lat: 25.5941, lon: 85.1376 },
  { name: 'Kochi',      lat: 9.9312,  lon: 76.2673 },
  { name: 'Guwahati',   lat: 26.1445, lon: 91.7362 },
];

const WAQI_TOKEN = 'b20b4b2b6a74e467a9a650691a9e5f291fd258ca';

function getColor(aqi) {
  if (!aqi || aqi < 0) return '#888';
  if (aqi <= 50)  return '#00e400';
  if (aqi <= 100) return '#ffff00';
  if (aqi <= 150) return '#ff7e00';
  if (aqi <= 200) return '#ff0000';
  if (aqi <= 300) return '#8f3f97';
  return '#7e0023';
}

function getLabel(aqi) {
  if (!aqi || aqi < 0) return 'Unknown';
  if (aqi <= 50)  return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// inject global CSS to remove white leaflet popup borders
const popupStyle = `
  .leaflet-popup-content-wrapper {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 12px !important;
    padding: 0 !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    line-height: 1.4 !important;
  }
  .leaflet-popup-tip-container {
    display: none !important;
  }
  .leaflet-popup-close-button {
    color: #888 !important;
    top: 8px !important;
    right: 8px !important;
    font-size: 16px !important;
    z-index: 10;
  }
`;

function FlyToCity({ location, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.flyTo([location.lat, location.lon], 8, { duration: 1.5 });
      // auto open popup after fly
      setTimeout(() => {
        const ref = markerRefs.current[location.name];
        if (ref) ref.openPopup();
      }, 1800);
    }
  }, [location]);
  return null;
}

function Legend() {
  const levels = [
    { label: 'Good',               color: '#00e400', range: '0–50'    },
    { label: 'Moderate',           color: '#ffff00', range: '51–100'  },
    { label: 'Sensitive Groups',   color: '#ff7e00', range: '101–150' },
    { label: 'Unhealthy',          color: '#ff0000', range: '151–200' },
    { label: 'Very Unhealthy',     color: '#8f3f97', range: '201–300' },
    { label: 'Hazardous',          color: '#7e0023', range: '300+'    },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: '24px', left: '12px', zIndex: 9999,
      background: 'rgba(8,8,12,0.92)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '12px 14px',
      backdropFilter: 'blur(12px)', minWidth: '190px',
    }}>
      <p style={{ color: '#555', fontSize: '9px', letterSpacing: '0.15em', marginBottom: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
        AQI Index
      </p>
      {levels.map(l => (
        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color, flexShrink: 0, boxShadow: `0 0 6px ${l.color}` }} />
          <span style={{ fontSize: '11px', color: '#ccc', fontFamily: 'sans-serif', flex: 1 }}>{l.label}</span>
          <span style={{ fontSize: '10px', color: '#444', fontFamily: 'monospace' }}>{l.range}</span>
        </div>
      ))}
    </div>
  );
}

export default function Map({ location }) {
  const [cityData, setCityData] = useState([]);
  const markerRefs = useRef({});

  useEffect(() => {
    // inject popup CSS once
    if (!document.getElementById('leaflet-popup-override')) {
      const style = document.createElement('style');
      style.id = 'leaflet-popup-override';
      style.innerHTML = popupStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.all(
        CITIES.map(async (city) => {
          try {
            const res = await fetch(
              `https://api.waqi.info/feed/geo:${city.lat};${city.lon}/?token=${WAQI_TOKEN}`
            );
            const json = await res.json();
            return {
              ...city,
              aqi: json?.data?.aqi,
              pm25: json?.data?.iaqi?.pm25?.v,
              dominant: json?.data?.dominentpol,
            };
          } catch {
            return { ...city, aqi: null };
          }
        })
      );
      setCityData(results);
    }
    fetchAll();
  }, []);

  const isSearched = (name) =>
    location?.name?.toLowerCase() === name.toLowerCase();

  return (
    <div style={{ position: 'relative' }} className="h-[600px] w-full rounded-xl">
      <MapContainer
        center={[20, 78]}
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        key={location?.name}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CartoDB'
        />

        <FlyToCity location={location} markerRefs={markerRefs} />

        {cityData.map((city) => {
          const searched = isSearched(city.name);
          const color = getColor(city.aqi);
          return (
            <CircleMarker
              key={city.name}
              center={[city.lat, city.lon]}
              radius={searched ? 16 : (city.aqi ? 8 + city.aqi / 28 : 8)}
              pathOptions={{
                color: searched ? '#ffffff' : color,
                fillColor: color,
                fillOpacity: searched ? 1 : 0.85,
                weight: searched ? 2.5 : 1,
              }}
              ref={(r) => { if (r) markerRefs.current[city.name] = r; }}
            >
              <Popup>
                <div style={{
                  background: 'linear-gradient(135deg, #0f0f18 0%, #1a1a2e 100%)',
                  border: `1px solid ${color}44`,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  minWidth: '170px',
                  fontFamily: 'sans-serif',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                      {city.name}
                    </span>
                    {searched && (
                      <span style={{
                        fontSize: '9px', background: '#ff6600', color: '#fff',
                        borderRadius: '4px', padding: '2px 6px', letterSpacing: '0.05em'
                      }}>LIVE</span>
                    )}
                  </div>

                  {/* AQI big number */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '900', color, lineHeight: 1 }}>
                      {city.aqi ?? '—'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#555', fontFamily: 'monospace' }}>AQI</span>
                  </div>

                  {/* Label */}
                  <div style={{ fontSize: '11px', color, fontWeight: '600', marginBottom: '10px', letterSpacing: '0.03em' }}>
                    {getLabel(city.aqi)}
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '8px' }} />

                  {/* Stats */}
                  {city.pm25 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ color: '#555' }}>PM2.5</span>
                      <span style={{ color: '#ccc', fontFamily: 'monospace' }}>{city.pm25} µg/m³</span>
                    </div>
                  )}
                  {city.dominant && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#555' }}>Dominant</span>
                      <span style={{ color: '#ccc', fontFamily: 'monospace', textTransform: 'uppercase' }}>{city.dominant}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <Legend />
    </div>
  );
}