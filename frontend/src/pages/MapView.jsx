import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

function MapView() {
  const bangaloreCenter = [12.9716, 77.5946]

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Interactive City Map</h2>

      <div className="rounded-lg overflow-hidden shadow" style={{ height: '500px' }}>
        <MapContainer
          center={bangaloreCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={bangaloreCenter}>
            <Popup>Bangalore City Center</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  )
}

export default MapView