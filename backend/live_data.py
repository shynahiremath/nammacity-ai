import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")

TOMTOM_FLOW_URL = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"


async def fetch_live_traffic(latitude: float, longitude: float):
    """Fetch real-time traffic flow for a coordinate using TomTom's Traffic Flow API.
    Returns current speed vs free-flow speed, converted into our high/medium/low scale."""

    params = {
        "point": f"{latitude},{longitude}",
        "key": TOMTOM_API_KEY,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(TOMTOM_FLOW_URL, params=params)
        response.raise_for_status()
        data = response.json()

    segment = data.get("flowSegmentData", {})
    current_speed = segment.get("currentSpeed")
    free_flow_speed = segment.get("freeFlowSpeed")

    if not current_speed or not free_flow_speed or free_flow_speed == 0:
        return {"level": "unknown", "ratio": None, "current_speed": current_speed, "free_flow_speed": free_flow_speed}

    ratio = current_speed / free_flow_speed

    if ratio >= 0.75:
        level = "low"
    elif ratio >= 0.45:
        level = "medium"
    else:
        level = "high"

    return {
        "level": level,
        "ratio": round(ratio, 3),
        "current_speed": current_speed,
        "free_flow_speed": free_flow_speed,
    }
async def fetch_live_weather(latitude: float, longitude: float):
    """Fetch current weather using Open-Meteo — free, no API key required."""

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "precipitation,weather_code",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    current = data.get("current", {})
    precipitation = current.get("precipitation", 0)
    weather_code = current.get("weather_code", 0)

    # Open-Meteo weather codes: 51-67 = rain family, 80-82 = rain showers,
    # 95-99 = thunderstorm. We simplify to our 3-category scale.
    if weather_code in range(95, 100) or precipitation > 4:
        weather = "heavy_rain"
    elif weather_code in list(range(51, 68)) + list(range(80, 83)) or precipitation > 0:
        weather = "rain"
    else:
        weather = "clear"

    return {"weather": weather, "precipitation": precipitation, "weather_code": weather_code}