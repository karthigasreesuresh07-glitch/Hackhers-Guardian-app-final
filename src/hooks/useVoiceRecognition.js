import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Voice recognition hook with Web Speech API fallback.
 * Tries Capacitor SpeechRecognition plugin first; if unavailable (web),
 * falls back to the browser's native webkitSpeechRecognition / SpeechRecognition.
 */
export function useVoiceRecognition(keyword = 'help me') {
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const [error, setError] = useState(null)
  const [permissionState, setPermissionState] = useState('prompt') // prompt | granted | denied
  const recognitionRef = useRef(null)
  const isCapacitorRef = useRef(false)
  const restartTimeoutRef = useRef(null)
  const intentionalStopRef = useRef(false)

  // Detect support on mount
  useEffect(() => {
    const detect = async () => {
      // 1. Try Capacitor plugin
      try {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
        const result = await SpeechRecognition.available()
        if (result.available) {
          isCapacitorRef.current = true
          setSupported(true)
          return
        }
      } catch {
        // Capacitor not available — expected on web
      }

      // 2. Fallback: Web Speech API
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        setSupported(true)
      } else {
        setSupported(false)
      }
    }
    detect()

    return () => {
      clearTimeout(restartTimeoutRef.current)
    }
  }, [])

  // ---- Web Speech API implementation ----
  const startWebSpeech = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    // Clean up any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        for (let j = 0; j < result.length; j++) {
          const transcript = result[j].transcript.toLowerCase().trim()
          if (transcript.includes(keyword.toLowerCase())) {
            setTriggered(true)
            intentionalStopRef.current = true
            try { recognition.stop() } catch {}
            setIsListening(false)
            return
          }
        }
      }
    }

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are non-fatal — just restart
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Auto-restart after brief pause
        if (!intentionalStopRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            startWebSpeech()
          }, 500)
        }
        return
      }

      if (event.error === 'not-allowed') {
        setPermissionState('denied')
        setError('Microphone permission denied')
        setIsListening(false)
        return
      }

      console.warn('Speech recognition error:', event.error)
      setError(event.error)

      // Auto-restart on other transient errors
      if (!intentionalStopRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          startWebSpeech()
        }, 1000)
      }
    }

    recognition.onend = () => {
      // Auto-restart for continuous listening (unless intentionally stopped)
      if (!intentionalStopRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          startWebSpeech()
        }, 300)
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setPermissionState('granted')
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setError(err.message)
    }
  }, [keyword])

  // ---- Capacitor implementation ----
  const startCapacitor = useCallback(async () => {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')

      const permission = await SpeechRecognition.requestPermissions()
      if (permission.speechRecognition !== 'granted') {
        setPermissionState('denied')
        setError('Microphone permission denied')
        return
      }

      setPermissionState('granted')
      setIsListening(true)
      setTriggered(false)

      await SpeechRecognition.start({
        language: 'en-US',
        partialResults: true,
        popup: false
      })

      await SpeechRecognition.addListener('partialResults', (data) => {
        if (data.matches && data.matches.length > 0) {
          const transcript = data.matches[0].toLowerCase()
          if (transcript.includes(keyword.toLowerCase())) {
            setTriggered(true)
            SpeechRecognition.stop().catch(() => {})
            setIsListening(false)
          }
        }
      })
    } catch (err) {
      console.error('Capacitor speech recognition failed', err)
      setError(err.message)
      setIsListening(false)
    }
  }, [keyword])

  // ---- Public API ----
  const startListening = useCallback(async () => {
    if (!supported) return

    intentionalStopRef.current = false
    setError(null)

    if (isCapacitorRef.current) {
      await startCapacitor()
    } else {
      // Request mic permission first via getUserMedia
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(t => t.stop()) // Release immediately
        setPermissionState('granted')
        startWebSpeech()
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          setPermissionState('denied')
          setError('Microphone permission denied')
        } else {
          setError(err.message)
        }
      }
    }
  }, [supported, startCapacitor, startWebSpeech])

  const stopListening = useCallback(async () => {
    intentionalStopRef.current = true
    clearTimeout(restartTimeoutRef.current)

    if (isCapacitorRef.current) {
      try {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
        await SpeechRecognition.stop()
        await SpeechRecognition.removeAllListeners()
      } catch {}
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
        recognitionRef.current = null
      }
    }

    setIsListening(false)
  }, [])

  const resetTrigger = useCallback(() => {
    setTriggered(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalStopRef.current = true
      clearTimeout(restartTimeoutRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }
      if (isCapacitorRef.current) {
        import('@capacitor-community/speech-recognition').then(({ SpeechRecognition }) => {
          SpeechRecognition.stop().catch(() => {})
          SpeechRecognition.removeAllListeners().catch(() => {})
        }).catch(() => {})
      }
    }
  }, [])

  return {
    isListening,
    supported,
    triggered,
    error,
    permissionState,
    startListening,
    stopListening,
    resetTrigger
  }
}
