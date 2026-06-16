from fastapi import APIRouter
from app.models.predictor import HeatPredictor
from app.data.real_data import get_real_city_data

router = APIRouter()
predictor = HeatPredictor()

@router.get("/analysis/{city}")
async def get_heat_analysis(city: str):
    # Real data fetch karo
    real_data = get_real_city_data(city)
    
    # ML prediction real data se
    ml_input = {
        "lst": real_data["historical_lst"]["avg_lst"],
        "ndvi": real_data["derived_metrics"]["ndvi"],
        "ndbi": real_data["derived_metrics"]["ndbi"],
        "humidity": real_data["real_weather"]["humidity"],
        "buildingDensity": 65.0,
    }
    ml_result = predictor.predict(ml_input)
    
    # Synthetic hotspots real LST se calibrate karo
    base_analysis = predictor.get_city_analysis(city)
    
    return {
        "city": real_data["city"],
        "state": real_data["state"],
        
        # Real data
        "currentTemp": real_data["real_weather"]["temperature"],
        "apparentTemp": real_data["real_weather"]["apparent_temp"],
        "humidity": real_data["real_weather"]["humidity"],
        "windSpeed": real_data["real_weather"]["wind_speed"],
        
        # Historical LST — real
        "avgLST": real_data["historical_lst"]["avg_lst"],
        "maxLST": real_data["historical_lst"]["max_lst"],
        "minLST": real_data["historical_lst"]["min_lst"],
        "lstPeriod": real_data["historical_lst"]["period"],
        
        # Physics metrics
        "ndvi": real_data["derived_metrics"]["ndvi"],
        "ndbi": real_data["derived_metrics"]["ndbi"],
        "suhii": real_data["derived_metrics"]["suhii"],
        "heatStressIndex": real_data["derived_metrics"]["heat_stress_index"],
        
        # ML results
        "mlRiskLevel": ml_result["riskLevel"],
        "mlConfidence": ml_result["confidence"],
        "recommendations": ml_result["recommendations"],
        
        # Synthetic augmented
        "hotspotCount": base_analysis["hotspotCount"],
        "riskDistribution": base_analysis["riskDistribution"],
        "dominantDriver": base_analysis["dominantDriver"],
        "coolingPotential": base_analysis["coolingPotential"],
        "affectedPopulation": base_analysis["affectedPopulation"],
        
        # Data quality
        "dataSource": real_data["real_weather"]["source"],
        "dataQuality": real_data["data_quality"],
        "lastUpdated": real_data["last_updated"],
    }

@router.get("/hotspots/{city}")
async def get_hotspots(city: str):
    return predictor.get_hotspots(city)

@router.get("/interventions/{city}")
async def get_interventions(city: str):
    return predictor.get_cooling_interventions(city)

@router.post("/predict")
async def predict_heat_risk(data: dict):
    return predictor.predict(data)

@router.get("/realdata/{city}")
async def get_real_data(city: str):
    return get_real_city_data(city)

@router.get("/compare")
async def compare_cities(cities: str = "mumbai,delhi,bangalore"):
    city_list = [c.strip() for c in cities.split(",")]
    results = []
    for city in city_list[:5]:
        real_data = get_real_city_data(city)
        results.append({
            "city": real_data["city"],
            "currentTemp": real_data["real_weather"]["temperature"],
            "avgLST": real_data["historical_lst"]["avg_lst"],
            "suhii": real_data["derived_metrics"]["suhii"],
            "ndvi": real_data["derived_metrics"]["ndvi"],
            "ndbi": real_data["derived_metrics"]["ndbi"],
            "dataQuality": real_data["data_quality"],
        })
    return {"comparison": results}

@router.post("/simulate")
async def simulate_cooling(data: dict):
    city = data.get("city", "mumbai")
    base_lst = data.get("baseLST", 38.0)
    
    # Intervention parameters
    tree_cover_increase = data.get("treeCoverIncrease", 0)      # %
    cool_roof_percentage = data.get("coolRoofPercentage", 0)    # %
    water_body_increase = data.get("waterBodyIncrease", 0)      # %
    albedo_increase = data.get("albedoIncrease", 0)             # 0-1

    # Physics-informed cooling calculations
    # Based on actual urban climate research papers

    # 1. Urban Greening — each 10% tree cover = ~0.5°C cooling
    tree_cooling = (tree_cover_increase / 10) * 0.5

    # 2. Cool Roofs — Stefan-Boltzmann inspired
    # Albedo increase from 0.2 to 0.7 = ~2-4°C cooling
    cool_roof_cooling = (cool_roof_percentage / 100) * (albedo_increase * 8)

    # 3. Water Bodies — evaporative cooling
    # Each 5% water body = ~0.3°C cooling
    water_cooling = (water_body_increase / 5) * 0.3

    # Total cooling
    total_cooling = round(tree_cooling + cool_roof_cooling + water_cooling, 2)
    new_lst = round(base_lst - total_cooling, 2)

    # New risk level
    if new_lst < 33:
        new_risk = "Low"
    elif new_lst < 38:
        new_risk = "Medium"
    elif new_lst < 44:
        new_risk = "High"
    else:
        new_risk = "Extreme"

    return {
        "city": city.capitalize(),
        "baseLST": base_lst,
        "newLST": new_lst,
        "totalCooling": total_cooling,
        "breakdown": {
            "treeCooling": round(tree_cooling, 2),
            "coolRoofCooling": round(cool_roof_cooling, 2),
            "waterCooling": round(water_cooling, 2),
        },
        "originalRisk": data.get("originalRisk", "High"),
        "newRisk": new_risk,
        "co2Saved": round(tree_cover_increase * 2.5, 1),
        "populationBenefited": round(data.get("population", 100000) * (total_cooling / 10), 0),
    }