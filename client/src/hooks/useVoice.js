import { useState, useCallback, useRef, useEffect } from 'react'

export function useVoice(onResult) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recognitionRef = useRef(null)
  const lastFinalRef = useRef('')

  useEffect(() => {
    if (!supported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // Set to continuous so it doesn't stop when the user pauses
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setListening(true)
      lastFinalRef.current = ''
    }
    
    recognition.onend = () => setListening(false)

    recognition.onresult = (event) => {
      let sessionFinal = ''
      let interimStr = ''
      
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          sessionFinal += transcript + ' '
        } else {
          interimStr += transcript
        }
      }

      let newFinal = ''
      if (sessionFinal.startsWith(lastFinalRef.current)) {
        newFinal = sessionFinal.slice(lastFinalRef.current.length)
      } else {
        newFinal = sessionFinal
      }
      
      lastFinalRef.current = sessionFinal
      onResult(newFinal, interimStr)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed' || event.error === 'no-speech') {
        setListening(false)
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [supported, onResult])

  const startListening = useCallback(() => {
    if (!supported || !recognitionRef.current) return
    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('Error starting speech recognition:', err)
    }
  }, [supported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setListening(false)
  }, [])

  return { listening, supported, startListening, stopListening }
}
