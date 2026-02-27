import joblib
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# ✅ Enable CORS (important for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hackathon safe
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load trained model
model = joblib.load("irrigation_model.pkl")

# ✅ Your OpenWeather API Key
WEATHER_API_KEY = "370405cd8200d2aa615e9abaee7f014b"


# ✅ Input schema
class PredictionInput(BaseModel):
    location: str
    crop_type: str
    growth_stage: str
    soil_type: str
    irrigation_method: str


@app.get("/")
def root():
    return {"message": "Irrigation Prediction API Running 🚀"}


@app.post("/predict")
def predict(data: PredictionInput):
    try:
        # 🌦 Fetch weather data
        weather_url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?q={data.location}&appid={WEATHER_API_KEY}&units=metric"
        )

        response = requests.get(weather_url, timeout=10)
        weather_res = response.json()

        if response.status_code != 200 or "main" not in weather_res:
            raise HTTPException(status_code=400, detail="Weather API error")

        temperature = float(weather_res["main"]["temp"])
        humidity = float(weather_res["main"]["humidity"])
        wind_speed = float(weather_res["wind"]["speed"])

        rainfall = float(weather_res.get("rain", {}).get("1h", 0.0))

        # ✅ Model Input (Exact 8 Features)
        model_input = pd.DataFrame([{
            "temperature": temperature,
            "humidity": humidity,
            "rainfall": rainfall,
            "wind_speed": wind_speed,
            "crop_type": data.crop_type,
            "growth_stage": data.growth_stage,
            "soil_type": data.soil_type,
            "irrigation_method": data.irrigation_method
        }])

        # 🤖 Predict irrigation minutes
        irrigation_minutes = int(model.predict(model_input)[0])

        # 📅 Generate 7-day irrigation plan
        irrigation_plan: List[dict] = []

        for day in range(1, 8):
            projected = int(irrigation_minutes * (1 + 0.03 * day))
            irrigation_plan.append({
                "day": day,
                "projected_irrigation_minutes": projected
            })

        return {
            "weather": {
                "temperature": temperature,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "rainfall": rainfall
            },
            "prediction": {
                "today_irrigation_minutes": irrigation_minutes,
                "7_day_irrigation_plan": irrigation_plan
            }
        }

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))