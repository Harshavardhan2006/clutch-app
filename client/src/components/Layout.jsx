import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { MessageCircle, LayoutDashboard, Zap, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
        </nav>

        <div className="flex flex-row md:flex-col items-center gap-4 md:mt-auto relative z-10">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              title={user.name}
              className="w-9 h-9 rounded-full border-2 border-white/10 shadow-lg object-cover"
            />
          ) : (
            <div
              title={user?.isGuest ? 'Guest user' : user?.name}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-clutch-surface to-clutch-surface/80 border border-white/10 shadow-lg flex items-center justify-center text-[13px] text-white font-display font-bold uppercase tracking-wider"
            >
              {initial}
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white/40 hover:text-clutch-red hover:bg-clutch-red/10 hover:border hover:border-clutch-red/20 border border-transparent transition-all duration-300"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-hidden flex flex-col h-full">
        <Outlet />
      </main>
    </div>
  )
}