# 🛰️ NabhaSense — Urban Heat Intelligence Platform

[![Live Demo]](https://nabha-sense.vercel.app)
[![API Docs]](https://nabhasense-backend.onrender.com/docs)
[![ISRO BAH 2026]](https://hack2skill.com/event/bah2026)

> Physics-informed AI/ML system to identify urban heat stress hotspots, quantify heating drivers, and generate optimized cooling interventions — built for ISRO BAH 2026.

---

## ⚡ Features
- 🌡️ Real-time LST + weather data via Open-Meteo API
- 🤖 Random Forest ML — heat risk prediction (Low/Medium/High/Extreme)
- 🗺️ Interactive geospatial heat map with pulsing hotspot markers
- 🧪 Physics-based scenario simulator (trees, cool roofs, water bodies)
- 🏙️ Multi-city comparison — 7 Indian cities with live data
- 📊 SUHII, NDVI, NDBI physics metrics

## 🛠️ Stack
**Frontend:** Next.js 14 + TypeScript + Framer Motion + Leaflet  
**Backend:** FastAPI + Scikit-learn + Open-Meteo API  
**Deploy:** Vercel + Render

## 🚀 Local Setup
```bash
# Backend
cd backend && python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

## 👥 Team NabhaSense
UMIT, SNDT Women's University, Mumbai — ISRO BAH 2026
