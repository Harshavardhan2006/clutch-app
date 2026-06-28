import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { MessageCircle, LayoutDashboard, Zap, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initial = user?.isGuest ? '?' : (user?.name?.[0] || '?')

  return (
    <div className="fixed inset-0 flex flex-col-reverse md:flex-row bg-clutch-bg overflow-hidden selection:bg-clutch-accent/30">
      {/* Global Ambient Background Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[30rem] h-[30rem] bg-clutch-accent/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute top-[20%] right-[20%] w-[30rem] h-[30rem] bg-clutch-green/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-[10%] left-[30%] w-[30rem] h-[30rem] bg-clutch-amber/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" style={{ animationDelay: '4s' }} />

      <aside className="relative z-20 w-full h-16 md:w-16 md:h-full flex flex-row md:flex-col items-center justify-around md:justify-start px-4 md:px-0 md:py-6 md:gap-6 bg-clutch-surface/80 md:bg-clutch-surface/40 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl flex-shrink-0">
        <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-clutch-accent to-clutch-accentHover shadow-glow">
          <Zap size={20} className="text-white" fill="white" />
        </div>

        <nav className="flex flex-row md:flex-col gap-2 md:mt-4 relative z-10 w-full md:w-auto justify-center">
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-clutch-accent/20 text-clutch-accent shadow-glow-sm border border-clutch-accent/30'
                  : 'text-white/40 hover:text-white hover:bg-white/10 border border-transparent'
              }`
            }
            title="Chat with Clutch"
          >
            <MessageCircle size={20} />
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-clutch-accent/20 text-clutch-accent shadow-glow-sm border border-clutch-accent/30'
                  : 'text-white/40 hover:text-white hover:bg-white/10 border border-transparent'
              }`
            }
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-clutch-accent/20 text-clutch-accent shadow-glow-sm border border-clutch-accent/30'
                  : 'text-white/40 hover:text-white hover:bg-white/10 border border-transparent'
              }`
            }
            title="Settings"
          >
            <Settings size={20} />
          </NavLink>
        </nav>

        <div className="md:mt-auto relative z-10" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative outline-none rounded-full transition-transform hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-white/20 focus:ring-clutch-accent"
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-9 h-9 rounded-full border-2 border-white/10 shadow-lg object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-clutch-surface to-clutch-surface/80 border border-white/10 shadow-lg flex items-center justify-center text-[13px] text-white font-display font-bold uppercase tracking-wider">
                {initial}
              </div>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute bottom-full mb-4 md:bottom-0 md:left-full md:mb-0 md:ml-4 w-56 bg-clutch-surface/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 animate-slide-up origin-bottom-left z-50">
              <div className="p-3 border-b border-white/5 mb-2">
                <div className="font-semibold text-white truncate">{user?.isGuest ? 'Guest User' : user?.name}</div>
                <div className="text-xs text-clutch-textSecondary truncate">{user?.isGuest ? 'Not signed in' : user?.email}</div>
              </div>
              
              <Link 
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-clutch-textSecondary hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings size={16} />
                <span className="text-sm font-medium">Settings</span>
              </Link>
              
              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  setShowLogoutConfirm(true)
                }}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-clutch-red/80 hover:text-clutch-red hover:bg-clutch-red/10 transition-colors mt-1"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-y-auto flex flex-col h-full">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-clutch-card border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-clutch-red/10 border border-clutch-red/20 flex items-center justify-center mb-6">
              <LogOut size={24} className="text-clutch-red" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Sign Out?</h2>
            <p className="text-clutch-textSecondary mb-8 text-sm leading-relaxed">
              Are you sure you want to sign out? Your tasks and progress will be securely saved and waiting for you.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl font-semibold text-clutch-red bg-clutch-red/10 border border-clutch-red/30 hover:bg-clutch-red/20 hover:border-clutch-red/50 hover:shadow-[0_0_20px_rgba(255,92,92,0.3)] transition-all active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}