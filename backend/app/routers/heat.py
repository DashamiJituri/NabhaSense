from fastapi import APIRouter
from app.models.predictor import HeatPredictor

router = APIRouter()
predictor = HeatPredictor()

@router.get("/analysis/{city}")
async def get_heat_analysis(city: str):
    return predictor.get_city_analysis(city)

@router.get("/hotspots/{city}")
async def get_hotspots(city: str):
    return predictor.get_hotspots(city)

@router.get("/interventions/{city}")
async def get_interventions(city: str):
    return predictor.get_cooling_interventions(city)

@router.post("/predict")
async def predict_heat_risk(data: dict):
    return predictor.predict(data)