import { useEffect, useState } from 'react'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { useEmergency } from '../contexts/EmergencyContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mic, MicOff, AlertCircle } from 'lucide-react'

export default function VoiceTriggerHandler() {
  const { voiceTriggerEnabled, triggerSOS, isEmergencyActive } = useEmergency()
  const { user } = useAuth()
  const { isListening, triggered, supported, error, permissionState, startListening, stopListening, resetTrigger } = useVoiceRecognition('help me')
  const navigate = useNavigate()
  const location = useLocation()
  const [showIndicator, setShowIndicator] = useState(false)

  // Pages where we should NOT show the indicator
  const hiddenPaths = ['/', '/onboarding', '/login', '/register', '/splash']
  const isHiddenPage = hiddenPaths.includes(location.pathname)

  // Auto-start listening when enabled and user is logged in
  useEffect(() => {
    if (voiceTriggerEnabled && !isEmergencyActive && !isListening && user && !isHiddenPage) {
      startListening()
    } else if ((!voiceTriggerEnabled || isHiddenPage || !user) && isListening) {
      stopListening()
    }
  }, [voiceTriggerEnabled, isEmergencyActive, isListening, user, isHiddenPage, startListening, stopListening])

  // Show indicator once user is on an app page
  useEffect(() => {
    setShowIndicator(!isHiddenPage && user && supported)
  }, [isHiddenPage, user, supported])

  // Handle trigger
  useEffect(() => {
    if (triggered) {
      resetTrigger()
      triggerSOS()
      navigate('/sos')
    }
  }, [triggered, resetTrigger, triggerSOS, navigate])

  // Don't render anything on auth/splash pages or if speech not supported
  if (!showIndicator) return null

  return (
    <div className="voice-indicator-wrapper" id="voice-indicator">
      <div className={`voice-indicator ${isListening ? 'listening' : ''} ${permissionState === 'denied' ? 'denied' : ''}`}>
        {permissionState === 'denied' ? (
          <AlertCircle size={12} />
        ) : isListening ? (
          <Mic size={12} />
        ) : (
          <MicOff size={12} />
        )}
        <span className="voice-indicator-text">
          {permissionState === 'denied' ? 'Mic blocked' : isListening ? 'Listening' : 'Mic off'}
        </span>
        {isListening && (
          <span className="voice-indicator-dot" />
        )}
      </div>

      <style>{`
        .voice-indicator-wrapper {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 250;
          pointer-events: none;
        }
        .voice-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px 5px 8px;
          border-radius: 20px;
          background: rgba(6, 8, 15, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 600;
          font-family: var(--font-family);
          letter-spacing: 0.02em;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          pointer-events: auto;
        }
        .voice-indicator.listening {
          color: var(--accent-green);
          border-color: rgba(16, 185, 129, 0.15);
          background: rgba(16, 185, 129, 0.08);
          box-shadow: 0 2px 16px rgba(16, 185, 129, 0.15);
        }
        .voice-indicator.denied {
          color: var(--accent-amber);
          border-color: rgba(245, 158, 11, 0.15);
        }
        .voice-indicator-text {
          white-space: nowrap;
        }
        .voice-indicator-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent-green);
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
          animation: voiceDotPulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes voiceDotPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
