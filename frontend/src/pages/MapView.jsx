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
  const [weather, setWeather] = useState('clear')
  const [isEvent, setIsEvent] = useState(false)

  const [simMode, setSimMode] = useState(false)
  const [compareHour, setCompareHour] = useState(18)
  const [compareWeather, setCompareWeather] = useState('clear')
  const [compareEvent, setCompareEvent] = useState(false)

  const [prediction, setPrediction] = useState(null)
  const [comparePrediction, setComparePrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0].name)
    }
  }, [zones, selectedZone])

  async function fetchPrediction(hour, weatherVal, eventVal) {
    const response = await axios.get('http://127.0.0.1:8000/predict', {
      params: {
        zone: selectedZone,
        day_of_week: selectedDay,
        hour,
        weather: weatherVal,
        is_event: eventVal,
      },
    })
    return response.data
  }

  async function handlePredict() {
    setLoading(true)
    setError('')
    setPrediction(null)
    setComparePrediction(null)

    try {
      const result = await fetchPrediction(selectedHour, weather, isEvent)
      setPrediction(result)

      if (simMode) {
        const compareResult = await fetchPrediction(compareHour, compareWeather, compareEvent)
        setComparePrediction(compareResult)
      }
    } catch (err) {
      setError('Could not get prediction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function ResultCards({ data }) {
    if (!data) return null
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {['congestion', 'pollution', 'infrastructure_stress'].map((key) => {
          const label = key === 'infrastructure_stress' ? 'Infra Stress' : key[0].toUpperCase() + key.slice(1)
          return (
            <div key={key} className="p-3 rounded bg-gray-50 flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                style={{ backgroundColor: colorMap[data[key].level] }}
              ></span>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-semibold capitalize text-sm">{data[key].level}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Congestion Predictor</h3>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={simMode}
            onChange={(e) => setSimMode(e.target.checked)}
          />
          What-if comparison mode
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Zone</label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.name}>{zone.name}</option>
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
              <option key={index} value={index}>{day}</option>
            ))}
          </select>
        </div>
        <div></div>
      </div>

      <div className={`grid grid-cols-1 ${simMode ? 'sm:grid-cols-2' : ''} gap-6`}>
        <div className={simMode ? 'border-r border-gray-200 pr-6' : ''}>
          {simMode && <p className="text-xs font-semibold text-gray-500 mb-2">SCENARIO A</p>}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium mb-1">Hour</label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i}:00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Weather</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                <option value="clear">Clear</option>
                <option value="rain">Rain</option>
                <option value="heavy_rain">Heavy Rain</option>
              </select>
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={isEvent} onChange={(e) => setIsEvent(e.target.checked)} />
                Event
              </label>
            </div>
          </div>
          {prediction && <ResultCards data={prediction} />}
        </div>

        {simMode && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">SCENARIO B</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Hour</label>
                <select
                  value={compareHour}
                  onChange={(e) => setCompareHour(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Weather</label>
                <select
                  value={compareWeather}
                  onChange={(e) => setCompareWeather(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="clear">Clear</option>
                  <option value="rain">Rain</option>
                  <option value="heavy_rain">Heavy Rain</option>
                </select>
              </div>
              <div className="flex items-end pb-1.5">
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={compareEvent} onChange={(e) => setCompareEvent(e.target.checked)} />
                  Event
                </label>
              </div>
            </div>
            {comparePrediction && <ResultCards data={comparePrediction} />}
          </div>
        )}
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || !selectedZone}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50 mt-4"
      >
        {loading ? 'Predicting...' : simMode ? 'Compare Scenarios' : 'Predict Congestion'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {prediction && prediction.insight && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-700">AI Analysis Summary</p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                prediction.insight.severity === 'critical' ? 'bg-red-100 text-red-700' :
                prediction.insight.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                prediction.insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}
            >
              {prediction.insight.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded">
            {prediction.insight.summary}
          </p>
        </div>
      )}

      {prediction && prediction.recommendations && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Recommended Actions {simMode ? '(Scenario A)' : ''}
          </p>
          <div className="space-y-2">
            {prediction.recommendations.map((rec, i) => (
              <div key={i} className="text-sm p-2 rounded bg-gray-50 flex gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 h-fit ${
                    rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  {rec.priority}
                </span>
                <div>
                  <p className="font-medium">{rec.action}</p>
                  <p className="text-gray-500 text-xs">{rec.reason}</p>
                </div>
              </div>
            ))}
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