import { useState, useRef, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import './SOSButton.css'

export default function SOSButton({ onTrigger, size = 140, disabled = false }) {
  const [pressing, setPressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)
  const progressRef = useRef(null)
  const holdDuration = 2000 // 2 seconds to trigger

  const handleStart = useCallback(() => {
    if (disabled) return
    setPressing(true)
    setProgress(0)

    const startTime = Date.now()
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / holdDuration) * 100, 100)
      setProgress(pct)

      if (pct >= 100) {
        clearInterval(progressRef.current)
        setPressing(false)
        setProgress(0)
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
        onTrigger?.()
      }
    }, 16)
  }, [disabled, onTrigger, holdDuration])

  const handleEnd = useCallback(() => {
    setPressing(false)
    setProgress(0)
    if (progressRef.current) {
      clearInterval(progressRef.current)
      progressRef.current = null
    }
  }, [])

  return (
    <div className="sos-button-wrapper" id="sos-button-wrapper">
      {/* Outer radar rings */}
      <div className="sos-ring sos-ring-1" />
      <div className="sos-ring sos-ring-2" />
      <div className="sos-ring sos-ring-3" />

      {/* Progress ring */}
      <svg className="sos-progress-ring" viewBox="0 0 160 160" style={{ width: size + 20, height: size + 20 }}>
        <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="4" />
        <circle cx="80" cy="80" r="72" fill="none" stroke="#EF4444" strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 72}`}
          strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
          style={{ transition: 'stroke-dashoffset 0.05s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>

      {/* Main button */}
      <button
        className={`sos-button ${pressing ? 'pressing' : ''} ${disabled ? 'disabled' : ''}`}
        style={{ width: size, height: size }}
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
        onContextMenu={e => e.preventDefault()}
        id="sos-trigger-button"
        aria-label="Emergency SOS Button - Hold to activate"
      >
        <div className="sos-button-inner">
          <AlertTriangle size={size * 0.3} strokeWidth={2.5} />
          <span className="sos-button-text">SOS</span>
          <span className="sos-button-subtext">
            {pressing ? 'Keep holding...' : 'Hold to activate'}
          </span>
        </div>
      </button>
    </div>
  )
}
