export interface HeatDataPoint {
  lat: number;
  lng: number;
  lst: number; // Land Surface Temperature
  ndvi: number; // Vegetation Index
  ndbi: number; // Built-up Index
  humidity: number;
  heatRisk: 'low' | 'medium' | 'high' | 'extreme';
  district: string;
  city: string;
}

export interface CoolingIntervention {
  id: string;
  type: 'urban_greening' | 'cool_roof' | 'water_body' | 'ventilation';
  lat: number;
  lng: number;
  impactScore: number;
  tempReduction: number;
  area: string;
  priority: 'low' | 'medium' | 'high';
}

export interface HeatAnalysis {
  city: string;
  avgLST: number;
  maxLST: number;
  hotspotCount: number;
  riskLevel: string;
  dominantDriver: string;
  coolingPotential: number;
}

export interface CityData {
  name: string;
  lat: number;
  lng: number;
  state: string;
  population: number;
}