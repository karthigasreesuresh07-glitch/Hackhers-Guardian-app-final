import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmergency } from '../contexts/EmergencyContext'
import { useLocation } from '../contexts/LocationContext'
import { useAuth } from '../contexts/AuthContext'
import SOSButton from '../components/SOSButton'
import BackButton from '../components/BackButton'
import { formatTime } from '../utils/formatters'
import {
  Shield, X, Check, MapPin, Send, Users, Radio, Volume2,
  AlertTriangle, PhoneCall, MessageSquare, Video, Mic
} from 'lucide-react'

export default function SOSScreen() {
  const { user } = useAuth()
  const { isEmergencyActive, contacts, triggerSOS, cancelSOS, alertedContacts,
          autoRecordingActive, autoRecordingType, autoRecordingDuration } = useEmergency()
  const { position } = useLocation()
  const navigate = useNavigate()
  const [phase, setPhase] = useState('ready') // ready, countdown, sending, active
  const [countdown, setCountdown] = useState(3)
  const [showCancel, setShowCancel] = useState(false)
  const [alertLog, setAlertLog] = useState([])

  // If emergency is already active (e.g. triggered via voice), show active state
  useEffect(() => {
    if (isEmergencyActive && phase === 'ready') {
      setPhase('active')
    }
  }, [isEmergencyActive])

  const handleTrigger = useCallback(async () => {
    setPhase('countdown')
    setCountdown(3)

    let count = 3
    const interval = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        executeSOS()
      }
    }, 1000)
  }, [])

  const executeSOS = async () => {
    setPhase('sending')
    setAlertLog([{ text: 'Capturing GPS location...', icon: 'map', status: 'loading' }])

    await new Promise(r => setTimeout(r, 600))
    setAlertLog(prev => [
      { ...prev[0], status: 'done' },
      { text: 'Starting evidence recording...', icon: 'rec', status: 'loading' }
    ])

    await new Promise(r => setTimeout(r, 400))
    setAlertLog(prev => [
      prev[0],
      { ...prev[1], status: 'done' },
      { text: 'Sending emergency alerts...', icon: 'sms', status: 'loading' }
    ])

    const result = await triggerSOS(user?.name)

    await new Promise(r => setTimeout(r, 500))
    setAlertLog(prev => [
      prev[0],
      prev[1],
      { ...prev[2], status: 'done' },
      { text: `${result.contactsAlerted} contacts alerted`, icon: 'users', status: 'done' },
      { text: 'Live tracking started', icon: 'radio', status: 'done' },
    ])

    await new Promise(r => setTimeout(r, 400))
    setPhase('active')
  }

  const handleCancel = () => {
    cancelSOS()
    setPhase('ready')
    setAlertLog([])
    setShowCancel(false)
  }

  return (
    <div className="sos-page" id="sos-screen">
      {/* Background radial glow */}
      <div className="sos-bg-glow" style={{
        opacity: phase === 'active' || phase === 'countdown' ? 0.7 : 0.15
      }} />
      <div className="sos-bg-mesh" />

      {/* Back button — only in ready phase */}
      {phase === 'ready' && (
        <div className="sos-back-btn-wrap">
          <BackButton />
        </div>
      )}

      {/* Auto Recording Indicator — shown during active emergency */}
      {(phase === 'active' || phase === 'sending') && autoRecordingActive && (
        <div className="sos-recording-overlay animate-fadeInDown">
          <div className="sos-rec-dot" />
          {autoRecordingType === 'video' ? <Video size={13} /> : <Mic size={13} />}
          <span>Recording evidence…</span>
          <span className="sos-rec-timer">{formatTime(autoRecordingDuration)}</span>
        </div>
      )}

      {phase === 'ready' && (
        <div className="sos-ready animate-fadeInUp">
          <div className="sos-header">
            <div className="sos-header-badge">
              <AlertTriangle size={14} />
              <span>EMERGENCY</span>
            </div>
            <h1 className="sos-title">Emergency SOS</h1>
            <p className="sos-subtitle">
              Hold the button for 2 seconds to activate
            </p>
          </div>

          <SOSButton onTrigger={handleTrigger} disabled={contacts.length === 0} />

          {contacts.length === 0 && (
            <div className="sos-warning animate-fadeInUp">
              <AlertTriangle size={16} />
              <div>
                <span style={{ fontWeight: 600 }}>No contacts added</span>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Add emergency contacts first</p>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => navigate('/contacts')} style={{ marginLeft: 'auto' }}>
                Add
              </button>
            </div>
          )}

          <div className="sos-info-cards">
            <div className="sos-info-card">
              <div className="sos-info-icon" style={{ background: 'var(--accent-blue-surface)', color: 'var(--accent-blue)' }}>
                <Users size={16} />
              </div>
              <div>
                <p className="sos-info-value">{contacts.length}</p>
                <p className="sos-info-label">Contacts Ready</p>
              </div>
            </div>
            <div className="sos-info-card">
              <div className="sos-info-icon" style={{ background: 'var(--accent-green-surface)', color: 'var(--accent-green)' }}>
                <MapPin size={16} />
              </div>
              <div>
                <p className="sos-info-value">{position ? 'Active' : '...'}</p>
                <p className="sos-info-label">GPS Status</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="sos-countdown-view animate-scaleIn">
          <div className="sos-countdown-ring">
            <div className="sos-countdown-number" style={{ animation: 'countdownPulse 1s ease-in-out infinite' }}>
              {countdown}
            </div>
          </div>
          <p style={{ color: 'var(--accent-red-light)', fontSize: 16, fontWeight: 600, marginTop: 20, letterSpacing: '0.05em' }}>
            Activating SOS...
          </p>
          <button className="btn btn-ghost" style={{ marginTop: 28 }} onClick={() => {
            setPhase('ready')
            setCountdown(3)
          }}>
            Cancel
          </button>
        </div>
      )}

      {phase === 'sending' && (
        <div className="sos-sending-view animate-fadeInUp">
          <div className="sos-sending-icon">
            <Send size={28} style={{ animation: 'glow 1.5s ease-in-out infinite' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.02em' }}>Sending Alerts</h2>
          <div className="sos-alert-log">
            {alertLog.map((log, i) => (
              <div key={i} className="sos-log-item animate-fadeInUp" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`sos-log-status ${log.status}`}>
                  {log.status === 'loading' ? (
                    <div className="loading-dots"><span/><span/><span/></div>
                  ) : <Check size={14} />}
                </div>
                <span>{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'active' && (
        <div className="sos-active-view animate-fadeInUp">
          <div className="sos-active-badge">
            <Radio size={14} />
            <span>EMERGENCY ACTIVE</span>
          </div>

          <div className="sos-active-icon">
            <Shield size={44} />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em' }}>Help is on the way</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32, textAlign: 'center', lineHeight: 1.6 }}>
            Your contacts have been alerted and can see your live location
          </p>

          <div className="sos-active-actions">
            <button className="btn btn-primary btn-full" onClick={() => navigate('/tracking')}>
              <MapPin size={18} /> View Live Tracking
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => navigate('/evidence')}>
              <Volume2 size={18} /> View Evidence Vault
            </button>
            <button className="sos-cancel-btn" onClick={() => setShowCancel(true)}>
              <X size={18} /> Cancel Emergency
            </button>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div className="modal-overlay" onClick={() => setShowCancel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Cancel Emergency?</h3>
            <p className="modal-body">Are you sure you're safe? This will stop all alerts, tracking, and evidence recording.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowCancel(false)}>Keep Active</button>
              <button className="btn btn-danger" onClick={handleCancel}>I'm Safe</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sos-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          padding-bottom: calc(var(--bottom-nav-height) + 24px);
          position: relative;
          overflow: hidden;
        }
        .sos-back-btn-wrap {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
        }
        .sos-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(244,63,94,0.12), transparent 70%);
          pointer-events: none;
          transition: opacity 0.6s;
        }
        .sos-bg-mesh {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 20%, rgba(244,63,94,0.04), transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(167,139,250,0.03), transparent 50%);
          pointer-events: none;
        }
        /* Recording overlay */
        .sos-recording-overlay {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: var(--accent-red);
          font-size: 12px;
          font-weight: 600;
          z-index: 10;
          box-shadow: 0 4px 20px rgba(244, 63, 94, 0.15);
        }
        .sos-rec-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-red);
          box-shadow: 0 0 8px rgba(244, 63, 94, 0.6);
          animation: voiceDotPulse 1s ease-in-out infinite;
        }
        .sos-rec-timer {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent-red-light);
        }
        .sos-ready {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .sos-header {
          text-align: center;
          margin-bottom: 16px;
        }
        .sos-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: var(--radius-full);
          background: var(--accent-red-surface);
          border: 1px solid rgba(244,63,94,0.12);
          color: var(--accent-red);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }
        .sos-title {
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sos-subtitle {
          color: var(--text-tertiary);
          font-size: 14px;
          margin-top: 6px;
          font-weight: 500;
        }
        .sos-warning {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: var(--accent-amber-surface);
          border: 1px solid rgba(245,158,11,0.12);
          border-radius: var(--radius-xl);
          color: var(--accent-amber);
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          max-width: 340px;
        }
        .sos-info-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
          max-width: 320px;
          margin-top: 12px;
        }
        .sos-info-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(12px);
        }
        .sos-info-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sos-info-value {
          font-weight: 700;
          font-size: 16px;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .sos-info-label {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }
        .sos-countdown-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .sos-countdown-ring {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(244,63,94,0.06);
          border: 2px solid rgba(244,63,94,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 60px rgba(244,63,94,0.15);
        }
        .sos-countdown-number {
          font-size: 100px;
          font-weight: 900;
          color: var(--accent-red);
          text-shadow: 0 0 50px rgba(244,63,94,0.5);
          line-height: 1;
          font-family: var(--font-family);
          letter-spacing: -0.05em;
        }
        .sos-sending-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 320px;
        }
        .sos-sending-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-red);
          margin-bottom: 20px;
          box-shadow: 0 0 40px rgba(244,63,94,0.1);
        }
        .sos-alert-log {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sos-log-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          font-size: 14px;
          font-weight: 500;
        }
        .sos-log-status {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sos-log-status.loading {
          background: rgba(245,158,11,0.12);
          color: var(--accent-amber);
        }
        .sos-log-status.done {
          background: rgba(16,185,129,0.12);
          color: var(--accent-green);
        }
        .sos-active-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 340px;
        }
        .sos-active-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border-radius: var(--radius-full);
          background: rgba(244,63,94,0.1);
          border: 1px solid rgba(244,63,94,0.15);
          color: var(--accent-red);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          margin-bottom: 28px;
          animation: glow 2s ease-in-out infinite;
        }
        .sos-active-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-green);
          margin-bottom: 20px;
          animation: pulse-red 3s infinite;
          box-shadow: 0 0 40px rgba(16,185,129,0.15);
        }
        .sos-active-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sos-cancel-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: var(--accent-red-surface);
          border: 1px solid rgba(244,63,94,0.12);
          border-radius: var(--radius-lg);
          color: var(--accent-red);
          font-family: var(--font-family);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }
        .sos-cancel-btn:hover {
          background: rgba(244,63,94,0.12);
          border-color: rgba(244,63,94,0.2);
        }
      `}</style>
    </div>
  )
}
