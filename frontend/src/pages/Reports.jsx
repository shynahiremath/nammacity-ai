import { useEffect, useState } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Reports() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchZones() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/traffic-zones')
        setZones(response.data)
      } catch (err) {
        setError('Failed to load report data')
      } finally {
        setLoading(false)
      }
    }

    fetchZones()
  }, [])

  function handleExportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('NammaCity AI - Traffic Report', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27)

    const tableData = zones.map((zone) => [
      zone.name,
      zone.latitude.toFixed(4),
      zone.longitude.toFixed(4),
      zone.level.toUpperCase(),
    ])

    autoTable(doc, {
      startY: 35,
      head: [['Zone Name', 'Latitude', 'Longitude', 'Congestion Level']],
      body: tableData,
      headStyles: { fillColor: [30, 41, 59] },
    })

    doc.save('nammacity-traffic-report.pdf')
  }

  const levelColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-orange-100 text-orange-700',
    low: 'bg-green-100 text-green-700',
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Traffic Reports</h2>
        <button
          onClick={handleExportPDF}
          disabled={zones.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
        >
          Export as PDF
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading report data...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && zones.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-white text-sm">
              <tr>
                <th className="px-4 py-3">Zone Name</th>
                <th className="px-4 py-3">Latitude</th>
                <th className="px-4 py-3">Longitude</th>
                <th className="px-4 py-3">Congestion Level</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{zone.name}</td>
                  <td className="px-4 py-3">{zone.latitude.toFixed(4)}</td>
                  <td className="px-4 py-3">{zone.longitude.toFixed(4)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${levelColors[zone.level]}`}
                    >
                      {zone.level.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Reports