import { useState, useEffect } from 'react'
import { CheckCircle2, Zap, Flame, Skull, ChevronLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SettingsPage() {
  const [personality, setPersonality] = useState('no-nonsense')

  useEffect(() => {
    const saved = localStorage.getItem('clutch_personality')
    if (saved) setPersonality(saved)
  }, [])

  function handleSelect(id) {
    setPersonality(id)
    localStorage.setItem('clutch_personality', id)
  }

  const personalities = [
    {
      id: 'no-nonsense',
      title: 'Sharp & Direct',
      subtitle: 'Default Mode',
      description: 'No sugarcoating. Calls you out if you miss a deadline, strictly focused on action.',
      icon: Zap,
      color: 'from-blue-500/20 to-purple-500/20',
      activeColor: 'from-blue-500 to-purple-600',
      border: 'border-blue-500/30'
    },
    {
      id: 'hype-coach',
      title: 'Hype Coach',
      subtitle: 'Cheerleader',
      description: 'Extremely supportive, celebrates every tiny win, enthusiastic and encouraging.',
      icon: Sparkles,
      color: 'from-emerald-500/20 to-teal-500/20',
      activeColor: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-500/30'
    },
    {
      id: 'roast-mode',
      title: 'Roast Mode',
      subtitle: 'Hardcore',
      description: 'Strict accountability. Will brutally roast you if you fall behind. Not for the faint of heart.',
      icon: Flame,
      color: 'from-red-500/20 to-orange-500/20',
      activeColor: 'from-red-500 to-orange-600',
      border: 'border-red-500/30'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in relative z-10">
      <Link to="/dashboard" className="group inline-flex items-center gap-2 text-clutch-textSecondary hover:text-white transition-colors mb-12">
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
          <ChevronLeft size={16} />
        </div>
        <span className="font-medium tracking-wide text-sm uppercase">Back to Dashboard</span>
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
          AI Personality
        </h1>
        <p className="text-clutch-textSecondary text-lg max-w-xl">
          Choose how Clutch talks to you. Your assistant's tone, encouragement level, and strictness will adapt instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {personalities.map((p) => {
          const Icon = p.icon
          const isActive = personality === p.id

          return (
            <label 
              key={p.id}
              className={`relative flex flex-col p-8 rounded-3xl cursor-pointer overflow-hidden transition-all duration-500 border focus-within:ring-2 focus-within:ring-white/50 ${
                isActive 
                  ? `bg-gradient-to-br ${p.activeColor} border-transparent shadow-[0_0_40px_rgba(0,0,0,0.3)] scale-[1.02] z-10` 
                  : `bg-white/5 ${p.border} hover:bg-white/10 hover:scale-[1.01] opacity-70 hover:opacity-100`
              }`}
            >
              <input 
                type="radio" 
                name="personality" 
                value={p.id}
                checked={isActive}
                onChange={() => handleSelect(p.id)}
                className="sr-only"
              />
              
              {isActive && (
                <div className="absolute top-6 right-6">
                  <div className="bg-white text-black p-1 rounded-full shadow-lg">
                    <CheckCircle2 size={16} className="text-black" />
                  </div>
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all duration-300 ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${p.color}`}`}>
                <Icon size={28} className={isActive ? 'text-white' : 'text-white/70'} />
              </div>

              <div className="mb-4">
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-white/80' : 'text-clutch-textSecondary'}`}>
                  {p.subtitle}
                </div>
                <h3 className={`text-2xl font-display font-bold ${isActive ? 'text-white' : 'text-white/90'}`}>
                  {p.title}
                </h3>
              </div>
              
              <p className={`text-sm leading-relaxed mt-auto ${isActive ? 'text-white/90' : 'text-clutch-textSecondary'}`}>
                {p.description}
              </p>
            </label>
          )
        })}
      </div>
    </div>
  )
}
