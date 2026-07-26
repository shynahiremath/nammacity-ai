import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">NammaCity AI</h1>
      <div className="flex gap-6 text-sm items-center">
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

        {userName && (
          <>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Hi, {userName}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar