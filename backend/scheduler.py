import asyncio
from datetime import datetime
from database import database
from live_data import fetch_live_traffic, fetch_live_weather

REFRESH_INTERVAL_SECONDS = 900  # 15 minutes


async def refresh_all_zones():
    """Fetch live traffic for every zone in the database and update their
    congestion level and last-refreshed timestamp. Also fetches one
    citywide weather reading (Bangalore is small enough that weather
    doesn't meaningfully vary zone to zone for our purposes)."""

    zones = await database.traffic_zones.find().to_list(length=None)

    if not zones:
        print("[scheduler] No zones found, skipping refresh")
        return

    weather_data = await fetch_live_weather(zones[0]["latitude"], zones[0]["longitude"])

    for zone in zones:
        try:
            traffic_data = await fetch_live_traffic(zone["latitude"], zone["longitude"])
            await database.traffic_zones.update_one(
                {"_id": zone["_id"]},
                {
                    "$set": {
                        "level": traffic_data["level"],
                        "live_ratio": traffic_data["ratio"],
                        "live_weather": weather_data["weather"],
                        "last_updated": datetime.utcnow().isoformat(),
                    }
                },
            )
            print(f"[scheduler] Updated {zone['name']}: {traffic_data['level']}")
        except Exception as e:
            print(f"[scheduler] Failed to update {zone['name']}: {e}")


async def start_scheduler():
    """Runs forever in the background, refreshing zones on an interval."""
    while True:
        await refresh_all_zones()
        await asyncio.sleep(REFRESH_INTERVAL_SECONDS)