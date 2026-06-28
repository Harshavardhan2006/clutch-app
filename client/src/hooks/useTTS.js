import { useState, useCallback, useEffect } from 'react'

export function useTTS() {
  const [supported] = useState('speechSynthesis' in window)
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('clutch_tts_enabled')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('clutch_tts_enabled', JSON.stringify(enabled))
  }, [enabled])

  const speak = useCallback((text) => {
    if (!supported || !enabled) return
    window.speechSynthesis.cancel()
    
    // Clean up text (remove emojis and markdown)
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
                          .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
                          .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
                          .replace(/[\u{2600}-\u{26FF}]/gu, '')
                          .replace(/[\u{2700}-\u{27BF}]/gu, '')
                          .replace(/\*\*/g, '')
                          .replace(/\*/g, '')
                          .replace(/_/g, '')
                          .trim()
                          
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en')) || 
                           voices.find(v => v.lang === 'en-US')
                           
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.rate = 1.05
    utterance.pitch = 1.0
    
    window.speechSynthesis.speak(utterance)
  }, [supported, enabled])
  
  const toggleTTS = useCallback(() => {
    setEnabled(prev => {
      if (prev) window.speechSynthesis.cancel()
      return !prev
    })
  }, [])

  return { enabled, toggleTTS, speak, supported }
}
