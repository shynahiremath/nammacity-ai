function Dashboard() {
  const stats = [
    { label: 'Active Traffic Zones', value: '24', color: 'bg-blue-500' },
    { label: 'Congestion Alerts', value: '5', color: 'bg-red-500' },
    { label: 'Avg. Pollution Index', value: '68', color: 'bg-yellow-500' },
    { label: 'Predictions Today', value: '312', color: 'bg-green-500' },
  ]

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6 border-l-4 border-transparent hover:shadow-lg transition"
          >
            <div className={`w-10 h-10 rounded-full ${stat.color} mb-4`}></div>
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard