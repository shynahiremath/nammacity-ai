import asyncio
from live_data import fetch_live_traffic, fetch_live_weather

async def main():
    traffic = await fetch_live_traffic(12.9758, 77.6045)  # MG Road
    print("Traffic:", traffic)

    weather = await fetch_live_weather(12.9758, 77.6045)
    print("Weather:", weather)

asyncio.run(main())