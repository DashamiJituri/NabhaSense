'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CityComparison() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(['mumbai', 'delhi', 'bangalore', 'chennai', 'pune']);

  const cities = ['mumbai', 'thane', 'delhi', 'bangalore', 'chennai', 'hyderabad', 'pune'];

  const compare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://nabhasense-backend.onrender.com/heat/compare?cities=${selected.join(',')}`);
      const json = await res.json();
      setData(json.comparison || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getColor = (val: number, min: number, max: number) => {
    const ratio = (val - min) / (max - min);
    if (ratio < 0.33) return '#00d4aa';
    if (ratio < 0.66) return '#ffd700';
    return '#ff3d3d';
  };

  const maxLST = data.length ? Math.max(...data.map(d => d.avgLST)) : 50;
  const minLST = data.length ? Math.min(...data.map(d => d.avgLST)) : 25;

  return (
    <div style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '1.5rem' }}>
      <h3 style={{ color: '#f0f4ff', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
        🏙️ City Heat Comparison — Real Data
      </h3>
      <p style={{ color: '#8892b0', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
        Compare urban heat stress across Indian cities using live satellite data
      </p>

      {/* City selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {cities.map(city => (
          <button key={city} onClick={() => setSelected(prev =>
            prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
          )}
            style={{
              padding: '0.4rem 1rem', borderRadius: '2rem', border: 'none', cursor: 'pointer',
              background: selected.includes(city) ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.05)',
              color: selected.includes(city) ? '#00d4aa' : '#8892b0',
              fontSize: '0.82rem', fontWeight: 500,
              outline: selected.includes(city) ? '1.5px solid #00d4aa' : '1.5px solid #1e2d4a',
            }}>
            {city.charAt(0).toUpperCase() + city.slice(1)}
          </button>
        ))}
      </div>

      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={compare}
        style={{
          padding: '0.75rem 2rem', borderRadius: '2rem', border: 'none',
          background: loading ? '#1e2d4a' : 'linear-gradient(135deg, #00d4aa, #0099ff)',
          color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem', marginBottom: '1.5rem',
        }}>
        {loading ? '🛰️ Fetching real data...' : '🛰️ Compare Cities'}
      </motion.button>

      {data.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Bar Chart — LST */}
          <div style={{ background: '#0d1628', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #1e2d4a' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '1rem' }}>
              🌡️ Average LST Comparison (30-day)
            </div>
            {data.map((city, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#f0f4ff', fontWeight: 600 }}>{city.city}</span>
                  <span style={{ fontSize: '0.82rem', color: getColor(city.avgLST, minLST, maxLST), fontWeight: 700 }}>
                    {city.avgLST}°C
                  </span>
                </div>
                <div style={{ height: '8px', background: '#1e2d4a', borderRadius: '4px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((city.avgLST - minLST) / (maxLST - minLST)) * 100}%` }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.8 }}
                    style={{ height: '8px', borderRadius: '4px', background: getColor(city.avgLST, minLST, maxLST) }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {data.map((city, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ background: '#0d1628', borderRadius: '12px', padding: '1rem', border: '1px solid #1e2d4a' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '0.75rem' }}>
                  {city.city}
                </div>
                {[
                  { label: 'Avg LST', value: `${city.avgLST}°C`, color: getColor(city.avgLST, minLST, maxLST) },
                  { label: 'SUHII', value: `${city.suhii}°C`, color: '#bf5af2' },
                  { label: 'NDVI', value: city.ndvi, color: '#00d4aa' },
                  { label: 'NDBI', value: city.ndbi, color: '#ff6b35' },
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8892b0' }}>{stat.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                  background: city.dataQuality === 'real' ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,53,0.1)',
                  color: city.dataQuality === 'real' ? '#00d4aa' : '#ff6b35', textAlign: 'center' }}>
                  {city.dataQuality === 'real' ? '✅ Live Data' : '⚠️ Estimated'}
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      )}
    </div>
  );
}