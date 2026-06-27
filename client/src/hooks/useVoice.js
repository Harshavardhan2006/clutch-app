import { useState, useCallback, useRef, useEffect } from 'react'

export function useVoice(onResult) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!supported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    // Set to continuous so it doesn't stop when the user pauses
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)

    recognition.onresult = (event) => {
      // Get the latest finalized transcript
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      onResult(transcript)
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
