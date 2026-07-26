import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const trafficZones = [
  { id: 1, name: 'MG Road', position: [12.9758, 77.6045], level: 'high' },
  { id: 2, name: 'Whitefield', position: [12.9698, 77.7500], level: 'medium' },
  { id: 3, name: 'Koramangala', position: [12.9352, 77.6245], level: 'low' },
  { id: 4, name: 'Electronic City', position: [12.8452, 77.6602], level: 'high' },
  { id: 5, name: 'Indiranagar', position: [12.9719, 77.6412], level: 'medium' },
]

const colorMap = {
  high: 'red',
  medium: 'orange',
  low: 'green',
}

function createColoredIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function MapView() {
  const bangaloreCenter = [12.9716, 77.5946]

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Interactive City Map</h2>

      <div className="rounded-lg overflow-hidden shadow" style={{ height: '500px' }}>
        <MapContainer
          center={bangaloreCenter}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {trafficZones.map((zone) => (
            <Marker
              key={zone.id}
              position={zone.position}
              icon={createColoredIcon(colorMap[zone.level])}
            >
              <Popup>
                <strong>{zone.name}</strong>
                <br />
                Congestion: {zone.level}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          High
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
          Medium
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
          Low
        </div>
      </div>
    </div>
  )
}

export default MapView