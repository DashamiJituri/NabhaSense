'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import ScenarioSimulator from '@/components/dashboard/ScenarioSimulator';
import CityComparison from '@/components/dashboard/CityComparison';

const HeatMap = dynamic(() => import('@/components/map/HeatMap'), { ssr: false });

const cities = ['Mumbai', 'Thane', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];

const getRiskColor = (risk: string) => ({
  low: '#00d4aa', medium: '#ffd700', high: '#ff6b35', extreme: '#ff3d3d',
  Low: '#00d4aa', Medium: '#ffd700', High: '#ff6b35', Extreme: '#ff3d3d',
}[risk] || '#fff');

export default function Home() {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'hotspots' | 'interventions' | 'predict' | 'simulate' | 'compare'>('hotspots');
  const [predictInput, setPredictInput] = useState({ lst: 38, ndvi: 0.3, ndbi: 0.5, humidity: 60, buildingDensity: 65 });
  const [predictResult, setPredictResult] = useState<any>(null);

  const analyzeCity = async (city: string) => {
    setLoading(true);
    setSelectedCity(city);
    setAnalysis(null);
    try {
      const [a, h, i] = await Promise.all([
        fetch(`https://nabhasense-backend.onrender.com/heat/analysis/${city.toLowerCase()}`).then(r => r.json()),
        fetch(`https://nabhasense-backend.onrender.com/heat/hotspots/${city.toLowerCase()}`).then(r => r.json()),
        fetch(`https://nabhasense-backend.onrender.com/heat/interventions/${city.toLowerCase()}`).then(r => r.json()),
      ]);
      setAnalysis(a);
      setHotspots(h.hotspots || []);
      setInterventions(i.interventions || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handlePredict = async () => {
    try {
      const res = await fetch('https://nabhasense-backend.onrender.com/heat/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictInput),
      });
      setPredictResult(await res.json());
    } catch (e) { console.error(e); }
  };

  const interventionIcons: any = {
    urban_greening: '🌳', cool_roof: '🏠', water_body: '💧', ventilation: '💨',
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
          <span style={{ background: 'linear-gradient(135deg, #00d4aa, #0099ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligence</span>
          <br /><span style={{ color: '#f0f4ff' }}>Platform</span>
        </h1>
        <p style={{ color: '#8892b0', fontSize: '1rem', maxWidth: '550px', margin: '0 auto 1.5rem' }}>
          Physics-informed AI/ML system for urban heat stress detection and cooling intervention optimization
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {cities.map(city => (
            <motion.button key={city} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => analyzeCity(city)}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '2rem',
                border: selectedCity === city ? '1.5px solid #00d4aa' : '1.5px solid #1e2d4a',
                background: selectedCity === city ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.03)',
                color: selectedCity === city ? '#00d4aa' : '#8892b0',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              }}>{city}</motion.button>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => analyzeCity(selectedCity)}
          style={{
            padding: '0.85rem 2.5rem', borderRadius: '2rem', border: 'none',
            background: loading ? '#1e2d4a' : 'linear-gradient(135deg, #00d4aa, #0099ff)',
            color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
          {loading ? '🛰️ Fetching real satellite data...' : '🛰️ Analyze Heat Data'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {analysis && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ maxWidth: '1300px', margin: '0 auto' }}>

            {/* Badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid #00d4aa40', borderRadius: '2rem', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#00d4aa', fontWeight: 600 }}>
                ✅ Live Data — {analysis.dataSource}
              </span>
              <span style={{ background: 'rgba(0,153,255,0.15)', border: '1px solid #0099ff40', borderRadius: '2rem', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#0099ff', fontWeight: 600 }}>
                🤖 ML Risk: {analysis.mlRiskLevel} ({analysis.mlConfidence}% confidence)
              </span>
              <span style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid #ff6b3540', borderRadius: '2rem', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#ff6b35', fontWeight: 600 }}>
                📅 {analysis.lstPeriod}
              </span>
            </motion.div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Current Temp', value: `${analysis.currentTemp}°C`, color: '#ff6b35', icon: '🌡️' },
                { label: 'Feels Like', value: `${analysis.apparentTemp}°C`, color: '#ff3d3d', icon: '🔥' },
                { label: 'Avg LST (30d)', value: `${analysis.avgLST}°C`, color: '#ffd700', icon: '🛰️' },
                { label: 'SUHII', value: `${analysis.suhii}°C`, color: '#bf5af2', icon: '🏙️' },
                { label: 'NDVI', value: analysis.ndvi, color: '#00d4aa', icon: '🌿' },
                { label: 'NDBI', value: analysis.ndbi, color: '#ff6b35', icon: '🏗️' },
                { label: 'Humidity', value: `${analysis.humidity}%`, color: '#0099ff', icon: '💧' },
                { label: 'Heat Stress', value: `+${analysis.heatStressIndex}°C`, color: '#ff3d3d', icon: '⚠️' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(12px)', border: '1px solid #1e2d4a', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '0.68rem', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* AI Recommendations */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#f0f4ff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                🤖 AI Recommendations — {analysis.city}
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {analysis.recommendations?.map((rec: string, i: number) => (
                  <span key={i} style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid #00d4aa30', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', color: '#00d4aa' }}>
                    ✓ {rec}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Map */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ color: '#f0f4ff', fontWeight: 700, fontSize: '0.95rem' }}>🗺️ Heat Stress Map — {analysis.city}</h3>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                  {['low', 'medium', 'high', 'extreme'].map(r => (
                    <span key={r} style={{ color: getRiskColor(r), display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getRiskColor(r), display: 'inline-block' }} />{r}
                    </span>
                  ))}
                </div>
              </div>
              <HeatMap city={selectedCity} hotspots={hotspots} />
            </motion.div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[
                { key: 'hotspots', label: '🔥 Heat Hotspots' },
                { key: 'interventions', label: '❄️ Cooling Interventions' },
                { key: 'predict', label: '🤖 Heat Risk Predictor' },
                { key: 'simulate', label: '🧪 Scenario Simulator' },
                { key: 'compare', label: '🏙️ City Comparison' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    padding: '0.6rem 1.4rem', borderRadius: '2rem', border: 'none', cursor: 'pointer',
                    background: activeTab === tab.key ? 'linear-gradient(135deg, #00d4aa, #0099ff)' : 'rgba(255,255,255,0.05)',
                    color: activeTab === tab.key ? '#fff' : '#8892b0', fontWeight: 600, fontSize: '0.85rem',
                  }}>{tab.label}</button>
              ))}
            </div>

            {/* Hotspots Table */}
            {activeTab === 'hotspots' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #1e2d4a', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e2d4a' }}>
                        {['District', 'LST (°C)', 'NDVI', 'NDBI', 'Humidity', 'Risk Level'].map(h => (
                          <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#8892b0', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
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
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, background: `${getRiskColor(h.heatRisk)}20`, color: getRiskColor(h.heatRisk), border: `1px solid ${getRiskColor(h.heatRisk)}40` }}>
                              {h.heatRisk?.toUpperCase()}
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
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {interventions.map((inv: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #1e2d4a', borderRadius: '14px', padding: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>{interventionIcons[inv.type]}</div>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, background: getRiskColor(inv.priority) + '20', color: getRiskColor(inv.priority), border: `1px solid ${getRiskColor(inv.priority)}40` }}>
                        {inv.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '0.4rem', textTransform: 'capitalize' }}>
                      {inv.type?.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#8892b0', marginBottom: '0.75rem' }}>📍 {inv.area}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#00d4aa' }}>❄️ -{inv.tempReduction}°C</span>
                      <span style={{ color: '#ffd700' }}>Impact: {(inv.impactScore * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#8892b0' }}>
                      💰 Est. ₹{(inv.estimatedCost / 100000).toFixed(1)}L
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Heat Risk Predictor */}
            {activeTab === 'predict' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #1e2d4a', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ color: '#f0f4ff', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                  🤖 Custom Heat Risk Predictor
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  {[
                    { key: 'lst', label: 'Land Surface Temp (°C)', min: 20, max: 60, step: 0.1 },
                    { key: 'ndvi', label: 'NDVI (Vegetation)', min: -0.2, max: 0.9, step: 0.01 },
                    { key: 'ndbi', label: 'NDBI (Built-up)', min: 0.1, max: 0.9, step: 0.01 },
                    { key: 'humidity', label: 'Humidity (%)', min: 10, max: 100, step: 1 },
                    { key: 'buildingDensity', label: 'Building Density (%)', min: 0, max: 100, step: 1 },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: '0.75rem', color: '#8892b0', display: 'block', marginBottom: '0.4rem' }}>{field.label}</label>
                      <input type="range" min={field.min} max={field.max} step={field.step}
                        value={(predictInput as any)[field.key]}
                        onChange={e => setPredictInput(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) }))}
                        style={{ width: '100%', accentColor: '#00d4aa' }} />
                      <div style={{ fontSize: '0.85rem', color: '#00d4aa', fontWeight: 700, textAlign: 'center' }}>
                        {(predictInput as any)[field.key]}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handlePredict}
                  style={{ padding: '0.75rem 2rem', borderRadius: '2rem', border: 'none', background: 'linear-gradient(135deg, #00d4aa, #0099ff)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                  🤖 Predict Heat Risk
                </button>
                {predictResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '1.25rem', padding: '1.25rem', background: '#0d1628', borderRadius: '12px', border: '1px solid #1e2d4a' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getRiskColor(predictResult.riskLevel), marginBottom: '0.5rem' }}>
                      {predictResult.riskLevel} Risk — {predictResult.confidence}% confidence
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {Object.entries(predictResult.probabilities || {}).map(([level, prob]: any) => (
                        <span key={level} style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', borderRadius: '4px', background: `${getRiskColor(level)}15`, color: getRiskColor(level) }}>
                          {level}: {prob}%
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {predictResult.recommendations?.map((r: string, i: number) => (
                        <span key={i} style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem', borderRadius: '6px', background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid #00d4aa30' }}>
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Scenario Simulator */}
            {activeTab === 'simulate' && (
              <ScenarioSimulator
                city={selectedCity}
                baseLST={analysis.avgLST}
                originalRisk={analysis.mlRiskLevel}
                population={analysis.affectedPopulation}
              />
            )}
            {/* City Comparison */}
            {activeTab === 'compare' && (
              <CityComparison />
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}