import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleGoogleLogin() {
    setLoading(true)
    try {
      const res = await axios.get('/api/auth/google/login-url')
      window.location.href = res.data.url
    } catch {
      setLoading(false)
    }
  }

  function handleGuestLogin() {
    setGuestLoading(true)
    const guestId = localStorage.getItem('clutch_guest_id') || 'guest_' + Math.random().toString(36).slice(2, 11)
    localStorage.setItem('clutch_guest_id', guestId)
    login({ id: guestId, name: 'Guest', email: null, picture: null, isGuest: true })
    navigate('/chat', { replace: true })
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-clutch-bg overflow-hidden selection:bg-clutch-accent/30 px-4">
      <div className="absolute top-[10%] left-[20%] w-[40rem] h-[40rem] bg-clutch-accent/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute top-[20%] right-[20%] w-[35rem] h-[35rem] bg-clutch-green/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-[10%] left-[30%] w-[45rem] h-[45rem] bg-clutch-amber/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-clutch-accent to-clutch-accentHover shadow-glow mb-4 border border-white/10">
            <Zap size={32} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" fill="white" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Clutch</h1>
          <p className="text-white/60 text-sm mt-2 text-center font-medium tracking-wide">
            Never miss a deadline again.
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-[2rem]" />

          <div className="text-center mb-5 relative z-10">
            <h2 className="font-display font-semibold text-xl text-white">Welcome</h2>
            <p className="text-white/50 text-sm mt-1">Sign in to access your goals and plans</p>
          </div>

          <div className="space-y-3 relative z-10">
            <button
              onClick={handleGoogleLogin}
              disabled={loading || guestLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg width="20" height="20" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleGuestLogin}
              disabled={loading || guestLoading}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-clutch-accent/50 hover:bg-clutch-accent/10 text-white font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(108,99,255,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Zap size={17} className="text-clutch-accent" />
              {guestLoading ? 'Loading...' : 'Continue as Guest'}
            </button>
          </div>

          <p className="text-center text-white/30 text-xs leading-relaxed pt-4 relative z-10">
            Guest sessions are saved locally. Sign in with Google to sync across devices and connect your calendar.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'AI Planning', desc: 'Gemini builds your plan' },
            { label: 'Auto Replan', desc: 'Adapts when you slip' },
            { label: 'Cal Sync', desc: 'Tasks in your calendar' }
          ].map(({ label, desc }) => (
            <div key={label} className="bg-black/20 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-black/40 transition-all duration-300 rounded-2xl p-3 text-center">
              <p className="text-clutch-accent text-[10px] uppercase tracking-wider font-display font-bold mb-1">{label}</p>
              <p className="text-white/50 text-[10px] leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}