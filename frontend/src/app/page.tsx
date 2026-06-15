'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const HeatMap = dynamic(() => import('@/components/map/HeatMap'), { ssr: false });

const cities = ['Mumbai', 'Thane', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];

const getRiskColor = (risk: string) => ({
  low: '#00d4aa', medium: '#ffd700', high: '#ff6b35', extreme: '#ff3d3d'
}[risk] || '#fff');

export default function Home() {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'hotspots' | 'interventions'>('hotspots');

  const analyzeCity = async (city: string) => {
    setLoading(true);
    setSelectedCity(city);
    try {
      const [analysisRes, hotspotsRes, interventionsRes] = await Promise.all([
        fetch(`http://localhost:8000/heat/analysis/${city.toLowerCase()}`),
        fetch(`http://localhost:8000/heat/hotspots/${city.toLowerCase()}`),
        fetch(`http://localhost:8000/heat/interventions/${city.toLowerCase()}`),
      ]);
      const [a, h, i] = await Promise.all([
        analysisRes.json(), hotspotsRes.json(), interventionsRes.json()
      ]);
      setAnalysis(a);
      setHotspots(h.hotspots || []);
      setInterventions(i.interventions || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const interventionIcons: any = {
    urban_greening: '🌳',
    cool_roof: '🏠',
    water_body: '💧',
    ventilation: '💨',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1e', padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#00d4aa', letterSpacing: '0.3em', marginBottom: '0.75rem', fontWeight: 600 }}>
          🛰️ ISRO × BHARATIYA ANTARIKSH HACKATHON 2026
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' }}>
          <span style={{ color: '#f0f4ff' }}>Urban Heat </span>
          <span style={{ background: 'linear-gradient(135deg, #00d4aa, #0099ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Intelligence
          </span>
          <br />
          <span style={{ color: '#f0f4ff' }}>Platform</span>
        </h1>
        <p style={{ color: '#8892b0', fontSize: '1rem', maxWidth: '550px', margin: '0 auto 1.5rem' }}>
          Geospatial AI/ML system to detect heat stress hotspots and generate optimized cooling interventions
        </p>

        {/* City Pills */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {cities.map((city) => (
            <motion.button key={city} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => analyzeCity(city)}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '2rem',
                border: selectedCity === city ? '1.5px solid #00d4aa' : '1.5px solid #1e2d4a',
                background: selectedCity === city ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.03)',
                color: selectedCity === city ? '#00d4aa' : '#8892b0',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              }}>
              {city}
            </motion.button>
          ))}
        </div>

        {/* Analyze Button */}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => analyzeCity(selectedCity)}
          style={{
            padding: '0.85rem 2.5rem', borderRadius: '2rem', border: 'none',
            background: loading ? '#1e2d4a' : 'linear-gradient(135deg, #00d4aa, #0099ff)',
            color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
          {loading ? '🛰️ Analyzing satellite data...' : '🛰️ Analyze Heat Data'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {analysis && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ maxWidth: '1300px', margin: '0 auto' }}>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Avg LST', value: `${analysis.avgLST}°C`, color: '#ff6b35', icon: '🌡️' },
                { label: 'Max LST', value: `${analysis.maxLST}°C`, color: '#ff3d3d', icon: '🔴' },
                { label: 'Heat Hotspots', value: analysis.hotspotCount, color: '#ffd700', icon: '⚠️' },
                { label: 'Cooling Potential', value: `${analysis.coolingPotential}°C`, color: '#00d4aa', icon: '❄️' },
                { label: 'Population at Risk', value: analysis.affectedPopulation?.toLocaleString(), color: '#0099ff', icon: '👥' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(12px)',
                    border: '1px solid #1e2d4a', borderRadius: '14px', padding: '1.2rem', textAlign: 'center',
                  }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '0.7rem', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Map */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#f0f4ff', fontWeight: 700, fontSize: '1rem' }}>
                  🗺️ Heat Stress Map — {analysis.city}
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                  {['low', 'medium', 'high', 'extreme'].map(r => (
                    <span key={r} style={{ color: getRiskColor(r), display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getRiskColor(r), display: 'inline-block' }} />
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <HeatMap city={selectedCity} hotspots={hotspots} />
            </motion.div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {(['hotspots', 'interventions'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.6rem 1.4rem', borderRadius: '2rem', border: 'none', cursor: 'pointer',
                    background: activeTab === tab ? 'linear-gradient(135deg, #00d4aa, #0099ff)' : 'rgba(255,255,255,0.05)',
                    color: activeTab === tab ? '#fff' : '#8892b0', fontWeight: 600, fontSize: '0.85rem',
                  }}>
                  {tab === 'hotspots' ? '🔥 Heat Hotspots' : '❄️ Cooling Interventions'}
                </button>
              ))}
            </div>

            {/* Hotspots Table */}
            {activeTab === 'hotspots' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid #1e2d4a', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e2d4a' }}>
                        {['District', 'LST (°C)', 'NDVI', 'NDBI', 'Humidity', 'Risk Level'].map(h => (
                          <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#8892b0', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hotspots.map((h: any, i: number) => (
                        <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          style={{ borderBottom: '1px solid #0d1628' }}>
                          <td style={{ padding: '0.8rem 1rem', color: '#f0f4ff' }}>{h.district}</td>
                          <td style={{ padding: '0.8rem 1rem', color: '#ff6b35', fontWeight: 700 }}>{h.lst}</td>
                          <td style={{ padding: '0.8rem 1rem', color: '#00d4aa' }}>{h.ndvi}</td>
                          <td style={{ padding: '0.8rem 1rem', color: '#ffd700' }}>{h.ndbi}</td>
                          <td style={{ padding: '0.8rem 1rem', color: '#0099ff' }}>{h.humidity}%</td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700,
                              background: `${getRiskColor(h.heatRisk)}20`, color: getRiskColor(h.heatRisk),
                              border: `1px solid ${getRiskColor(h.heatRisk)}40`,
                            }}>
                              {h.heatRisk.toUpperCase()}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Interventions */}
            {activeTab === 'interventions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {interventions.map((inv: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      background: 'rgba(17,24,39,0.8)', border: '1px solid #1e2d4a',
                      borderRadius: '14px', padding: '1.2rem',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>{interventionIcons[inv.type]}</div>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700,
                        background: getRiskColor(inv.priority) + '20', color: getRiskColor(inv.priority),
                        border: `1px solid ${getRiskColor(inv.priority)}40`,
                      }}>
                        {inv.priority.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                      {inv.type.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8892b0', marginBottom: '0.75rem' }}>📍 {inv.area}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#00d4aa' }}>❄️ -{inv.tempReduction}°C</span>
                      <span style={{ color: '#ffd700' }}>Impact: {(inv.impactScore * 100).toFixed(0)}%</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}