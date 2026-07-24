function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">NammaCity AI</h1>
      <div className="flex gap-6 text-sm">
        <span className="cursor-pointer hover:text-blue-400">Dashboard</span>
        <span className="cursor-pointer hover:text-blue-400">Map</span>
        <span className="cursor-pointer hover:text-blue-400">Reports</span>
        <span className="cursor-pointer hover:text-blue-400">Settings</span>
      </div>
    </nav>
  )
}

export default Navbar