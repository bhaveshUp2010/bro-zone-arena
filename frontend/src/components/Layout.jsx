import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'

function Layout({ title, subtitle, children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Top Header Banner */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                <span className="text-lg font-black text-emerald-600">⚡</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  BRO ZONE
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-widest border border-emerald-200">
                  ARENA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 tracking-wider uppercase font-medium">Sports & Turf Booking</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex bg-slate-100 p-1.5 rounded-full border border-slate-200">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`
              }
            >
              🏟️ Explore Facilities
            </NavLink>

            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`
              }
            >
              📅 My Bookings
            </NavLink>

            <NavLink
              to="/change-password"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`
              }
            >
              🔒 Security
            </NavLink>
          </nav>

          {/* User Section / Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800">{user.name || user.email || 'Player'}</p>
                  <p className="text-[10px] font-bold text-emerald-600">Verified Member</p>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-slate-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-50 text-slate-700'
                }`
              }
            >
              🏟️ Explore Facilities
            </NavLink>
            <NavLink
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-50 text-slate-700'
                }`
              }
            >
              📅 My Bookings
            </NavLink>
            <NavLink
              to="/change-password"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-50 text-slate-700'
                }`
              }
            >
              🔒 Security & Password
            </NavLink>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">{user?.email || 'Logged in'}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 text-xs font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {title && (
          <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600" />
            
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">{subtitle}</p>}
            </div>
          </div>
        )}

        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-10 text-slate-600 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3">
                <span className="text-emerald-600">⚡</span> Bro Zone Arena
              </div>
              <p className="text-slate-600 leading-relaxed">
                The premier sports facility booking network for players, teams, and tournament hosts. Instant court reservation with transparent slot management.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">Quick Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Find Venues & Courts</Link></li>
                <li><Link to="/bookings" className="hover:text-emerald-600 transition-colors">Manage Reservations</Link></li>
                <li><Link to="/change-password" className="hover:text-emerald-600 transition-colors">Account Settings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">Supported Sports</h4>
              <ul className="space-y-2">
                <li>⚽ Football & Futsal Turfs</li>
                <li>🏸 Indoor Badminton Courts</li>
                <li>🏏 Box Cricket Arenas</li>
                <li>🏀 Basketball Courts</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">Platform Guarantee</h4>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <span>✓</span> Instant Slot Lock
                </div>
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <span>✓</span> Zero Hidden Charges
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <span>✓</span> Easy 1-Click Cancellation
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500">
            <p>© {new Date().getFullYear()} Bro Zone Arena Platform. White-Green-Blue Design System.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-slate-800 cursor-pointer">Partner Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
