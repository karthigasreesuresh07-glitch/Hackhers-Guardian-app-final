import { useEmergency } from '../contexts/EmergencyContext'
import BackButton from '../components/BackButton'
import { formatDateTime, formatDuration } from '../utils/formatters'
import { formatCoordinates } from '../utils/locationUtils'
import {
  Clock, MapPin, Users, Shield, Radio, AlertCircle, CheckCircle, ChevronRight
} from 'lucide-react'

export default function HistoryScreen() {
  const { history } = useEmergency()

  return (
    <div className="page" id="history-screen">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton />
          <h1 className="page-title">History</h1>
        </div>
        <span className="badge badge-info">{history.length} Events</span>
      </div>

      {history.length === 0 ? (
        <div className="empty-state animate-fadeInUp">
          <div className="empty-state-icon">
            <Clock size={32} />
          </div>
          <p className="empty-state-title">No Emergency History</p>
          <p className="empty-state-desc">Past emergency events will appear here as a timeline</p>
        </div>
      ) : (
        <div className="history-timeline">
          {history.map((entry, i) => (
            <div key={entry.id} className="history-item animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
              {/* Timeline connector */}
              <div className="history-timeline-line">
                <div className={`history-timeline-dot ${entry.status}`}>
                  {entry.status === 'active' ? <Radio size={12} /> : <CheckCircle size={12} />}
                </div>
                {i < history.length - 1 && <div className="history-connector" />}
              </div>

              {/* Content */}
              <div className="history-content">
                <div className="history-card">
                  <div className="history-card-header">
                    <span className={`badge ${entry.status === 'active' ? 'badge-danger' : 'badge-safe'}`}>
                      {entry.status === 'active' ? 'Active' : 'Resolved'}
                    </span>
                    <span className="history-time">{formatDateTime(entry.startTime)}</span>
                  </div>

                  <div className="history-card-stats">
                    <div className="history-stat">
                      <div className="history-stat-icon" style={{ background: 'var(--accent-blue-surface)', color: 'var(--accent-blue)' }}>
                        <Users size={13} />
                      </div>
                      <span>{entry.contactsAlerted} contacts alerted</span>
                    </div>
                    {entry.location && (
                      <div className="history-stat">
                        <div className="history-stat-icon" style={{ background: 'var(--accent-green-surface)', color: 'var(--accent-green)' }}>
                          <MapPin size={13} />
                        </div>
                        <span>{formatCoordinates(entry.location.lat, entry.location.lng)}</span>
                      </div>
                    )}
                    {entry.duration && (
                      <div className="history-stat">
                        <div className="history-stat-icon" style={{ background: 'var(--accent-amber-surface)', color: 'var(--accent-amber)' }}>
                          <Clock size={13} />
                        </div>
                        <span>Duration: {formatDuration(entry.duration)}</span>
                      </div>
                    )}
                  </div>

                  {entry.trackingLink && (
                    <div className="history-tracking-link">
                      <span>{entry.trackingLink}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .history-timeline {
          position: relative;
        }
        .history-item {
          display: flex;
          gap: 16px;
          margin-bottom: 4px;
        }
        .history-timeline-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 30px;
        }
        .history-timeline-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 1;
        }
        .history-timeline-dot.active {
          background: var(--accent-red-surface);
          color: var(--accent-red);
          animation: glow 2s ease-in-out infinite;
          border: 1px solid rgba(244,63,94,0.15);
          box-shadow: 0 0 16px rgba(244,63,94,0.2);
        }
        .history-timeline-dot.resolved {
          background: var(--accent-green-surface);
          color: var(--accent-green);
          border: 1px solid rgba(16,185,129,0.12);
        }
        .history-connector {
          width: 2px;
          flex: 1;
          min-height: 20px;
          background: linear-gradient(180deg, var(--glass-border-strong), var(--glass-border));
          margin: 4px 0;
          border-radius: 1px;
        }
        .history-content {
          flex: 1;
          padding-bottom: 16px;
          min-width: 0;
        }
        .history-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 18px;
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }
        .history-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
        }
        .history-card:hover {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-strong);
        }
        .history-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .history-time {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .history-card-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .history-stat {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .history-stat-icon {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .history-tracking-link {
          margin-top: 12px;
          padding: 10px 14px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          font-size: 11px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  )
}
