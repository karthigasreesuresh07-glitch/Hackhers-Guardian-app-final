import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useLocation } from '../contexts/LocationContext'
import { useEmergency } from '../contexts/EmergencyContext'
import { formatCoordinates } from '../utils/locationUtils'
import { formatTime } from '../utils/formatters'
import BackButton from '../components/BackButton'
import {
  MapPin, Copy, Check, Share2, Radio, Users, Clock, Navigation, ChevronDown, ChevronUp, Shield
} from 'lucide-react'

// Custom marker icon
const createPulseIcon = () => L.divIcon({
  className: '',
  html: `<div style="
    width: 20px; height: 20px; background: #6366F1; border-radius: 50%;
    border: 3px solid white; box-shadow: 0 0 20px rgba(99,102,241,0.6);
    position: relative;
  "><div style="
    position: absolute; inset: -10px; border-radius: 50%;
    border: 2px solid rgba(99,102,241,0.4); animation: radar 2s ease-out infinite;
  "></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function MapUpdater({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 16, { duration: 1 })
  }, [position, map])
  return null
}

export default function LiveTrackingScreen() {
  const { position, positionHistory, tracking, startTracking, stopTracking } = useLocation()
  const { isEmergencyActive, trackingLink, alertedContacts, emergencyStartTime } = useEmergency()
  const [copied, setCopied] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!tracking && !position) startTracking()
  }, [])

  useEffect(() => {
    if (!emergencyStartTime) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - emergencyStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [emergencyStartTime])

  const routePath = useMemo(() =>
    positionHistory.map(p => [p.lat, p.lng]),
    [positionHistory]
  )

  const copyLink = () => {
    if (trackingLink) {
      navigator.clipboard?.writeText(trackingLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const center = position ? [position.lat, position.lng] : [12.9716, 77.5946]

  return (
    <div className="tracking-page" id="tracking-screen">
      {/* Map */}
      <div className="tracking-map">
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}
          zoomControl={false} attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CartoDB'
          />
          {position && (
            <>
              <Marker position={[position.lat, position.lng]} icon={createPulseIcon()}>
                <Popup>
                  <div style={{color: '#333', fontWeight: 600}}>Your Location</div>
                </Popup>
              </Marker>
              <MapUpdater position={position} />
            </>
          )}
          {routePath.length > 1 && (
            <Polyline positions={routePath}
              pathOptions={{ color: '#6366F1', weight: 3, opacity: 0.8, dashArray: '10 5' }}
            />
          )}
        </MapContainer>

        {/* Map overlay header */}
        <div className="tracking-map-header">
          <BackButton fallback="/dashboard" />
          {isEmergencyActive && (
            <div className="tracking-live-badge">
              <Radio size={11} />
              <span>LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <div className={`tracking-panel ${expanded ? 'expanded' : ''}`}>
        <button className="tracking-panel-handle" onClick={() => setExpanded(!expanded)}>
          <div className="tracking-handle-bar" />
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {/* Location Info */}
        <div className="tracking-info-row">
          <div className="tracking-info-item">
            <div className="tracking-info-icon">
              <MapPin size={15} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <span className="tracking-info-label">Current Location</span>
              <span className="tracking-info-value">
                {position ? formatCoordinates(position.lat, position.lng) : 'Acquiring...'}
              </span>
            </div>
          </div>
        </div>

        <div className="tracking-stats">
          <div className="tracking-stat">
            <Clock size={15} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <span className="tracking-stat-value">{formatTime(elapsed)}</span>
              <span className="tracking-stat-label">Duration</span>
            </div>
          </div>
          <div className="tracking-stat">
            <Users size={15} style={{ color: 'var(--accent-green)' }} />
            <div>
              <span className="tracking-stat-value">{alertedContacts.length}</span>
              <span className="tracking-stat-label">Alerted</span>
            </div>
          </div>
          <div className="tracking-stat">
            <Navigation size={15} style={{ color: 'var(--accent-purple)' }} />
            <div>
              <span className="tracking-stat-value">{positionHistory.length}</span>
              <span className="tracking-stat-label">Points</span>
            </div>
          </div>
        </div>

        {/* Share tracking link */}
        {trackingLink && (
          <div className="tracking-share">
            <div className="tracking-share-link">
              <span>{trackingLink}</span>
            </div>
            <button className="tracking-copy-btn" onClick={copyLink}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        {/* Alerted contacts */}
        {expanded && alertedContacts.length > 0 && (
          <div className="tracking-contacts">
            <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Alerted Contacts</h4>
            {alertedContacts.map(c => (
              <div key={c.id} className="tracking-contact-item">
                <div className="tracking-contact-avatar">{c.name.charAt(0)}</div>
                <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{c.name}</span>
                <span className="badge badge-safe" style={{ fontSize: 9 }}>Sent</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .tracking-page {
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .tracking-map {
          flex: 1;
          position: relative;
        }
        .tracking-map-header {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tracking-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: var(--radius-full);
          background: rgba(244,63,94,0.92);
          color: white;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          backdrop-filter: blur(12px);
          animation: glow 2s ease-in-out infinite;
          box-shadow: 0 4px 16px rgba(244,63,94,0.3);
        }
        .tracking-panel {
          background: var(--bg-secondary);
          border-top: 1px solid var(--glass-border);
          border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
          padding: 8px 20px 20px;
          padding-bottom: calc(var(--bottom-nav-height) + 20px);
          position: relative;
          z-index: 1000;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 -12px 40px rgba(0,0,0,0.3);
        }
        .tracking-panel.expanded {
          max-height: 60vh;
        }
        .tracking-panel-handle {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--text-muted);
        }
        .tracking-handle-bar {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: var(--glass-border-strong);
        }
        .tracking-info-row {
          margin-bottom: 16px;
        }
        .tracking-info-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .tracking-info-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--accent-blue-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tracking-info-label {
          display: block;
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        .tracking-info-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-mono);
          letter-spacing: 0.02em;
        }
        .tracking-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .tracking-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
        }
        .tracking-stat-value {
          display: block;
          font-weight: 700;
          font-size: 16px;
          font-family: var(--font-mono);
        }
        .tracking-stat-label {
          font-size: 9px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        .tracking-share {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 16px;
        }
        .tracking-share-link {
          flex: 1;
          padding: 10px 14px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          font-size: 12px;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: var(--font-mono);
        }
        .tracking-copy-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 16px;
          border-radius: var(--radius-md);
          background: var(--gradient-blue);
          border: none;
          color: white;
          font-family: var(--font-family);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(99,102,241,0.25);
        }
        .tracking-copy-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99,102,241,0.35);
        }
        .tracking-contacts {
          margin-top: 8px;
        }
        .tracking-contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid var(--glass-border);
        }
        .tracking-contact-item:last-child { border-bottom: none; }
        .tracking-contact-avatar {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--gradient-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}
