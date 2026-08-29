'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface ForecastPanelProps {
  city: string;
}

const tierColor = (tier: string) => ({
  Low: '#00d4aa',
  Moderate: '#ffd700',
  High: '#ff6b35',
  Critical: '#ff3d3d',
}[tier] || '#fff');

const cardStyle: React.CSSProperties = {
  background: 'rgba(13,22,40,0.75)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(30,45,74,0.8)',
  borderRadius: '16px',
  padding: '1.25rem',
};

const dayLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function ForecastPanel({ city }: ForecastPanelProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const d = await api.getForecast(city.toLowerCase(), 5);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError('Could not load forecast. Try again.');
        console.error(e);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [city]);

  if (loading) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', color: '#6b7a90' }}>
        📅 Fetching 5-day forecast...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', color: '#ff6b35' }}>
        {error || 'No forecast available.'}
      </div>
    );
  }

  const maxMortality = Math.max(...data.forecast.map((d: any) => d.mortalityRiskIndex), 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Worst-day headline ── */}
      {data.worstDay && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{
            ...cardStyle,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
            borderColor: `${tierColor(data.worstDay.riskTier)}40`,
          }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#5a6b82', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
              ⚠️ Highest-Risk Day Ahead
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0f4ff' }}>
              {dayLabel(data.worstDay.date)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#5a6b82', textTransform: 'uppercase' }}>WBGT</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ff6b35' }}>{data.worstDay.wbgt}°C</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#5a6b82', textTransform: 'uppercase' }}>Mortality Risk</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: tierColor(data.worstDay.riskTier) }}>
                {data.worstDay.mortalityRiskIndex}/100
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#5a6b82', textTransform: 'uppercase' }}>Tier</div>
              <span style={{ padding: '0.2rem 0.65rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, background: `${tierColor(data.worstDay.riskTier)}18`, color: tierColor(data.worstDay.riskTier), border: `1px solid ${tierColor(data.worstDay.riskTier)}35` }}>
                {data.worstDay.riskTier.toUpperCase()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Day-by-day cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem' }}>
        {data.forecast.map((day: any, i: number) => {
          const color = tierColor(day.riskTier);
          const barHeight = Math.max(8, (day.mortalityRiskIndex / maxMortality) * 60);
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ ...cardStyle, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d0e0f0', marginBottom: '0.6rem' }}>{dayLabel(day.date)}</div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '70px', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '28px', height: `${barHeight}px`,
                  background: `linear-gradient(180deg, ${color}, ${color}80)`,
                  borderRadius: '6px 6px 2px 2px',
                  boxShadow: `0 0 14px ${color}50`,
                }} />
              </div>

              <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{day.mortalityRiskIndex}<span style={{ fontSize: '0.75rem' }}>/100</span></div>
              <div style={{ fontSize: '0.7rem', color, fontWeight: 700, marginBottom: '0.5rem' }}>{day.riskTier}</div>

              <div style={{ fontSize: '0.72rem', color: '#8892b0', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span>🌡️ Peak {day.peakTemp}°C</span>
                <span>💧 {day.peakHumidity}%</span>
                <span>WBGT {day.wbgt}°C ({day.stressCategory})</span>
                <span>🚑 Spike {day.hospitalizationSpikeProbability}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ fontSize: '0.7rem', color: '#5a6b82', textAlign: 'center' }}>
        📡 Source: {data.source}
      </div>
    </div>
  );
}
