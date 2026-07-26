import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import axios from 'axios'

const colorMap = {
  high: 'red',
  medium: 'orange',
  low: 'green',
}

const intensityMap = {
  high: 1.0,
  medium: 0.6,
  low: 0.3,
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function createColoredIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function HeatmapLayer({ zones }) {
  const map = useMap()
  const heatLayerRef = useRef(null)

  useEffect(() => {
    if (zones.length === 0) return

    const heatPoints = zones.map((zone) => [
      zone.latitude,
      zone.longitude,
      intensityMap[zone.level],
    ])

    map.whenReady(() => {
      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 45,
        blur: 35,
        maxZoom: 15,
        max: 1.0,
        minOpacity: 0.4,
      }).addTo(map)

      setTimeout(() => {
        map.invalidateSize()
      }, 100)
    })

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
      }
    }
  }, [map, zones])

  return null
}

function PredictionPanel({ zones }) {
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedHour, setSelectedHour] = useState(9)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0].name)
    }
  }, [zones, selectedZone])

  async function handlePredict() {
    setLoading(true)
    setError('')
    setPrediction(null)

    try {
      const response = await axios.get('http://127.0.0.1:8000/predict', {
        params: {
          zone: selectedZone,
          day_of_week: selectedDay,
          hour: selectedHour,
        },
      })
      setPrediction(response.data)
    } catch (err) {
      setError('Could not get prediction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">AI Congestion Predictor</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Zone</label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.name}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {dayNames.map((day, index) => (
              <option key={index} value={index}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hour (24h)</label>
          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i}:00
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || !selectedZone}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
      >
        {loading ? 'Predicting...' : 'Predict Congestion'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {prediction && (
        <div className="mt-4 p-4 rounded bg-gray-50 flex items-center gap-4">
          <span
            className="w-4 h-4 rounded-full inline-block"
            style={{ backgroundColor: colorMap[prediction.predicted_level] }}
          ></span>
          <div>
            <p className="font-semibold capitalize">
              {prediction.predicted_level} congestion expected
            </p>
            <p className="text-sm text-gray-500">
              Confidence: {(prediction.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function MapView() {
  const bangaloreCenter = [12.9716, 77.5946]
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchZones() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/traffic-zones')
        setZones(response.data)
      } catch (err) {
        setError('Failed to load traffic zones')
      } finally {
        setLoading(false)
      }
    }

    fetchZones()
  }, [])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Interactive City Map</h2>

      {loading && <p className="text-gray-500 mb-4">Loading traffic zones...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && zones.length > 0 && <PredictionPanel zones={zones} />}

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

          <HeatmapLayer zones={zones} />

          {zones.map((zone) => (
            <Marker
              key={zone.id}
              position={[zone.latitude, zone.longitude]}
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