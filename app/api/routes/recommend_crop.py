# app/api/routes/data.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict
from ...current_data.current_data import fetch_realtime_data
from ...profit_calculation.profit_calc import calculate_profit, CROP_DATA
from ...mkulima_ai.insight_generator import generate_crop_insight
from ...mkulima_ai.chatbot import chatbot
import joblib
import pandas as pd
from pathlib import Path


current_dir = Path(__file__).resolve().parent
router = APIRouter()

models= {
    'maize': joblib.load(current_dir.parent.parent / "data" / "models" / "models" / "maize_model.pkl"),
    'beans': joblib.load(current_dir.parent.parent / "data" / "models" / "models" / "beans_model.pkl"),
    'potato': joblib.load(current_dir.parent.parent / "data" / "models" / "models" / "potato_model.pkl")
}

prediction_cache = {}

class CropRequest(BaseModel):
    county: str
    farm_size: float

class CropSelectionOwn(BaseModel):
    crop_name: str
    seed_cost_per_acre: Optional[float] = None
    fertilizer_cost_per_acre: Optional[float] = None
    labor_cost_per_acre: Optional[float] = None

class CropSelectionDefault(BaseModel):
    crop_name: str

class ChatRequest(BaseModel):
    message: str
    history: List[Dict] = []

@router.post("/crop/predict-yield")
def predict_yield(request: CropRequest):
    location = request.county
    farm_size = request.farm_size

    #Fetch environmental data
    data = fetch_realtime_data(location).set_index("County")
    if data is None or data.empty:
        return {"error": "No environmental data found for this county."}

    #Predict yield
    predictions = {}
    for crop_name, model in models.items():
        prediction_in_ha = float(model.predict(data)[0])
        # Convert t/ha to t/acre
        prediction_in_acres = prediction_in_ha * 0.404686
        market_price = CROP_DATA.get(crop_name, {}).get("market_price", None)

        predictions[crop_name] = {
            #"prediction_in_ha": round(prediction_in_ha, 2),
            "prediction_in_acres": round(prediction_in_acres, 2),
            "market_price": market_price
        }

    prediction_cache["latest"] = {
    "county": location,
    "farm_size": farm_size,
    "predictions": predictions,
    "input_data": data.to_dict(orient="records")[0],
    }

    return {
    "message": "Predictions generated successfully.",
    "data": prediction_cache["latest"],
    }

@router.post("/crop/calculate-own-profit")
def calculate_own_profit(request: CropSelectionOwn):
    cache = prediction_cache.get('latest')
    
    if not cache:
        return {"error": "No previous prediction found. Run /crop/predict_yield first."}

    county = cache["county"]
    farm_size = cache["farm_size"]
    predictions = cache["predictions"]

    crop_name = request.crop_name.lower()
    
    if crop_name not in predictions:
        return {"error": f"No prediction found for {crop_name}."}

    predicted_yield_acres = predictions[crop_name]["prediction_in_acres"]

    # Use the previously predicted yield
    profit = calculate_profit(
        crop_name,
        farm_size,
        predicted_yield_acres,
        seed_cost=request.seed_cost_per_acre,
        fertilizer_cost=request.fertilizer_cost_per_acre,
        labor_cost=request.labor_cost_per_acre
    )

    # Ensure values are numeric
    total_profit = float(profit["total_profit"])
    total_revenue = float(profit["total_revenue"])
    
    profit_margin = (
        (total_profit / total_revenue) * 100
        if total_revenue > 0
        else 0
    )

    prediction_cache["profit_analysis"] = {
        "crop": crop_name,
        "predicted_yield": predicted_yield_acres,
        "profit": profit,
        "profit_margin": round(profit_margin, 2),
        "market_price": CROP_DATA[crop_name]["market_price"],
    }

    return {
        "county": county,
        "farm_size": farm_size,
        "crop": crop_name,
        "profit": profit,
        "profit_margin": round(profit_margin, 2),
        "prediction": predicted_yield_acres,
        "market_price": CROP_DATA[crop_name]["market_price"],
        "cache": prediction_cache
    }

@router.post("/crop/calculate-default-profit")
def calculate_default_profit(request: CropSelectionDefault):
    """Calculate profit using default/AI-optimized costs"""
    cache = prediction_cache.get('latest')
    crop_name = prediction_cache.get("profit_analysis", {}).get("crop")
    
    if not cache:
        return {"error": "No previous prediction found. Run /crop/predict-yield first."}

    county = cache["county"]
    farm_size = cache["farm_size"]
    predictions = cache["predictions"]

    # Get crop from cache or use first available
    
    if crop_name not in predictions:
        return {"error": f"No prediction found for {crop_name}."}

    predicted_yield_acres = predictions[crop_name]["prediction_in_acres"]

    # Use default costs from CROP_DATA
    profit = calculate_profit(
        crop_name,
        farm_size,
        predicted_yield_acres,
        # No custom costs - uses defaults from calculate_profit
    )

    total_profit = float(profit["total_profit"])
    total_revenue = float(profit["total_revenue"])
    profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

    prediction_cache["profit_analysis"] = {
        "crop": crop_name,
        "predicted_yield": predicted_yield_acres,
        "profit": profit,
        "profit_margin": round(profit_margin, 2),
        "market_price": CROP_DATA[crop_name]["market_price"],
    }

    return {
        "county": county,
        "farm_size": farm_size,
        "crop": crop_name,
        "profit": profit,
        "profit_margin": round(profit_margin, 2),
        "prediction": predicted_yield_acres,
        "market_price": CROP_DATA[crop_name]["market_price"],
        "cache": prediction_cache
    }

@router.get("/crop/insight")
def crop_insight():
    cache = prediction_cache

    insights = generate_crop_insight(cache)

    return{"Insights": insights}

@router.post("/crop/ai-chat")
def chat_endpoint(request: ChatRequest):
    # System prompt
    messages = [
        {
            "role": "system",
            "content": "You are MkuliMA, an expert agronomist AI assistant helping Kenyan farmers with crop planning, soil health, and profitability, part of the Mkulima app."
        }
    ]

    # Add chat history
    for entry in request.history:
        messages.append({"role": "user", "content": entry.get("request", "")})
        messages.append({"role": "assistant", "content": entry.get("response", "")})

    # Current user message
    messages.append({"role": "user", "content": request.message})

    # Call your chatbot function
    reply = chatbot(messages)

    return {
        "reply": reply,
        "messages": messages + [{"role": "assistant", "content": reply}]
    }


@router.get("/crop/list")
def list_crops():
    return {"crops": list(models.keys())}