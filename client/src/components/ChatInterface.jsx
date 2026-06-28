import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Mic, MicOff, Trash2, Zap } from 'lucide-react'
import { sendMessage, clearHistory } from '../lib/api'
import { useUser } from '../hooks/useUser'
import { useVoice } from '../hooks/useVoice'
import ChatMessage from './ChatMessage'

export default function ChatInterface({ goalId }) {
  const { userId } = useUser()

  const welcomeMessage = {
    id: 'welcome',
    role: 'assistant',
    text: goalId 
      ? "Let's talk about this goal! What do we need to adjust or update? ⚡"
      : "Hey, I'm **Clutch** ⚡\n\nTell me about something you need to get done. A goal, a deadline, an exam — anything. I'll build you a real plan and make sure you actually stick to it.",
    timestamp: new Date()
  }

  const storageKey = `clutch_chat_${userId}${goalId ? `_${goalId}` : ''}`

  const [messages, setMessages] = useState(() => {
    if (!userId) return [welcomeMessage]
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
      } catch (e) {
        return [welcomeMessage]
      }
    }
    return [welcomeMessage]
  })
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const [interimVoice, setInterimVoice] = useState('')

  const handleVoiceResult = useCallback((finalStr, interimStr) => {
    if (finalStr.trim()) {
      setInput(prev => {
        const trimmed = prev.trim()
        return trimmed ? `${trimmed} ${finalStr.trim()}` : finalStr.trim()
      })
    }
    setInterimVoice(interimStr)
    inputRef.current?.focus()
  }, [])

  const { listening, supported, startListening, stopListening } = useVoice(handleVoiceResult)

  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, loading])

  useEffect(() => {
    if (userId && messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    }
  }, [messages, userId, storageKey])

  async function handleSend() {
    if (!input.trim() || !userId || loading) return
    const userMsg = { id: Date.now(), role: 'user', text: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendMessage(userId, userMsg.text, goalId)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: "Something went wrong on my end. Try again?", timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    if (!userId) return
    await clearHistory(userId, goalId)
    localStorage.removeItem(storageKey)
    setMessages([welcomeMessage])
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Centered Header */}
      {!goalId && (
        <div className="flex-shrink-0 px-4 py-4 bg-clutch-surface/30 backdrop-blur-md z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-clutch-green shadow-[0_0_8px_rgba(0,229,160,0.6)] animate-pulse-slow" />
              <span className="font-display font-semibold text-white/90 text-[15px]">Clutch — AI Productivity Agent</span>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/40 hover:text-clutch-red hover:bg-clutch-red/10 transition-all duration-300 text-xs font-semibold uppercase tracking-wider"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
        </div>
      )}

      {goalId && (
        <div className="flex-shrink-0 px-4 py-3 bg-white/5 border-b border-white/5 z-10 flex justify-between items-center rounded-t-2xl">
          <span className="font-display font-semibold text-white/70 text-[13px]">Consult Clutch</span>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-white/40 hover:text-clutch-red hover:bg-clutch-red/10 transition-all duration-300 text-[10px] font-semibold uppercase tracking-wider"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 md:py-8 space-y-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {loading && (
            <div className="flex items-start gap-4 animate-fade-in px-2 py-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br from-clutch-accent to-clutch-accentHover shadow-glow border border-white/20">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <div className="flex items-center gap-1.5 px-5 py-4 bg-clutch-surface/60 backdrop-blur-md border border-white/5 rounded-3xl rounded-tl-sm shadow-xl">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-clutch-accent" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-clutch-accent" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-clutch-accent" />
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      <div className={`px-4 pb-4 md:pb-6 pt-2 bg-gradient-to-t from-clutch-bg via-clutch-bg/80 to-transparent z-10 ${goalId ? 'rounded-b-2xl' : ''}`}>
        <div className="max-w-3xl mx-auto relative">
          
          {interimVoice && listening && (
            <div className="absolute bottom-full mb-3 left-0 bg-clutch-surface/90 px-4 py-2 rounded-2xl text-sm text-white/90 italic animate-fade-in shadow-xl backdrop-blur-md border border-white/10 max-w-full md:max-w-[80%] whitespace-pre-wrap">
              "{interimVoice}"
              <span className="typing-dot w-1 h-1 rounded-full bg-white/50 ml-1 inline-block" />
              <span className="typing-dot w-1 h-1 rounded-full bg-white/50 ml-1 inline-block" />
              <span className="typing-dot w-1 h-1 rounded-full bg-white/50 ml-1 inline-block" />
            </div>
          )}

          <div className="flex items-end gap-2 p-2.5 bg-clutch-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl focus-within:border-clutch-accent/50 focus-within:bg-clutch-surface/80 focus-within:shadow-glow transition-all duration-300 shadow-xl group">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tell me your goal or deadline..."
              rows={1}
              className="flex-1 bg-transparent resize-none text-white placeholder-clutch-textMuted text-sm outline-none px-3 py-2 max-h-32 font-body leading-relaxed custom-scrollbar"
              style={{ minHeight: '44px' }}
            />

            <div className="flex items-center gap-2 pb-1 pr-1">
              {supported && (
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 transform active:scale-90 ${
                    listening
                      ? 'bg-clutch-red/20 text-clutch-red shadow-[0_0_15px_rgba(255,92,92,0.5)] animate-pulse'
                      : 'text-clutch-textSecondary hover:text-white hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}

              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-clutch-accent to-clutch-accentHover hover:from-clutch-accentHover hover:to-clutch-accent disabled:opacity-40 disabled:from-clutch-surface disabled:to-clutch-surface disabled:border disabled:border-white/10 transition-all duration-300 text-white shadow-glow-sm hover:shadow-glow hover:-translate-y-0.5"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
          <p className="text-center text-clutch-textMuted text-[10px] uppercase tracking-wider mt-3 font-semibold opacity-70">
            {listening ? '🎙️ Listening...' : 'Enter to send · Shift+Enter for new line'}
          </p>
        </div>
      </div>
    </div>
  )
}
