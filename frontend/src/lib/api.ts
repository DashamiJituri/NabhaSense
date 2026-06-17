const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nabhasense-backend.onrender.com';

export const api = {
  async getHeatData(city: string) {
    const res = await fetch(`${API_URL}/heat/analysis/${city}`);
    if (!res.ok) throw new Error('Failed to fetch heat data');
    return res.json();
  },

  async getHotspots(city: string) {
    const res = await fetch(`${API_URL}/heat/hotspots/${city}`);
    if (!res.ok) throw new Error('Failed to fetch hotspots');
    return res.json();
  },

  async getCoolingInterventions(city: string) {
    const res = await fetch(`${API_URL}/heat/interventions/${city}`);
    if (!res.ok) throw new Error('Failed to fetch interventions');
    return res.json();
  },

  async predictHeatRisk(data: object) {
    const res = await fetch(`${API_URL}/heat/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Prediction failed');
    return res.json();
  }
};