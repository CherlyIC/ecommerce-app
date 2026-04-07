import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    try {
      logout()
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Something went wrong during logout')
    } finally {
      setMenuOpen(false)
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <div className="bg-orange-500 text-white font-bold text-xl px-3 py-1 rounded-lg">
              Z
            </div>
            <span className="text-orange-500 font-bold text-xl tracking-wide">
              ZuriShop
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-200"
            >
              Home
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-full transition-colors duration-200"
              >
                Login
              </Link>
            )}

            {isAuthenticated && !isAdmin && (
              <>
                <Link
                  to="/cart"
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium transition-colors duration-200"
                >
                  🛒 My Cart
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">
                    Hi, <span className="text-orange-500 font-semibold">{user?.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-4 py-2 rounded-full transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium transition-colors duration-200"
                >
                  ⚙️ Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">
                    Admin: <span className="text-orange-500 font-semibold">{user?.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-4 py-2 rounded-full transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-orange-50 transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-orange-500 transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-orange-500 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-orange-500 transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-orange-100 px-4 py-4 flex flex-col gap-4 shadow-lg">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
          >
            🏠 Home
          </Link>

          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-orange-500 text-white text-center font-semibold px-5 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              Login
            </Link>
          )}

          {isAuthenticated && !isAdmin && (
            <>
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                🛒 My Cart
              </Link>
              <div className="border-t border-orange-100 pt-3">
                <p className="text-sm text-gray-500 mb-2">
                  Hi, <span className="text-orange-500 font-semibold">{user?.name}</span>
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-4 py-2 rounded-full transition-all"
                >
                  Logout
                </button>
              </div>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                ⚙️ Admin Dashboard
              </Link>
              <div className="border-t border-orange-100 pt-3">
                <p className="text-sm text-gray-500 mb-2">
                  Admin: <span className="text-orange-500 font-semibold">{user?.name}</span>
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-4 py-2 rounded-full transition-all"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  )
}