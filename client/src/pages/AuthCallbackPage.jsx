import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Zap } from 'lucide-react'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)

  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (!code) {
      setError('No authorization code received.')
      return
    }

    axios.post('/api/auth/google/callback', { code, state })
      .then(res => {
        login(res.data.user)
        navigate('/chat', { replace: true })
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Authentication failed.')
      })
  }, [login, navigate])

  if (error) {
    return (
      <div className="absolute inset-0 bg-clutch-bg flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[30rem] h-[30rem] bg-clutch-accent/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
        <div className="relative z-10 bg-black/40 backdrop-blur-2xl border border-clutch-red/20 rounded-[2rem] p-10 max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,92,92,0.1)]">
          <p className="text-clutch-red font-medium mb-6">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-semibold hover:-translate-y-0.5"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-clutch-bg flex flex-col items-center justify-center overflow-hidden">
      {/* Global Ambient Background Orbs */}
      <div className="absolute top-[20%] left-[30%] w-[30rem] h-[30rem] bg-clutch-accent/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob pointer-events-none" />
      <div className="absolute bottom-[20%] right-[30%] w-[30rem] h-[30rem] bg-clutch-green/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-clutch-accent to-clutch-accentHover shadow-glow border border-white/10">
          <div className="absolute inset-0 bg-white/20 rounded-3xl animate-ping opacity-20" />
          <Zap size={36} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse" fill="white" />
        </div>
        <div className="bg-black/30 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-lg">
          <p className="text-white/80 font-medium tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-clutch-accent animate-pulse" />
            Authenticating your session...
          </p>
        </div>
      </div>
    </div>
  )
}