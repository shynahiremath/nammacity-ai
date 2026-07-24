import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">NammaCity AI</h1>
      <div className="flex gap-6 text-sm">
        <Link to="/dashboard" className="cursor-pointer hover:text-blue-400">
          Dashboard
        </Link>
        <Link to="/map" className="cursor-pointer hover:text-blue-400">
          Map
        </Link>
        <Link to="/reports" className="cursor-pointer hover:text-blue-400">
          Reports
        </Link>
        <Link to="/settings" className="cursor-pointer hover:text-blue-400">
          Settings
        </Link>
      </div>
    </nav>
  )
}

export default Navbar