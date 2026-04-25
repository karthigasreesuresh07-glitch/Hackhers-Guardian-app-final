import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEmergency } from '../contexts/EmergencyContext'
import { useLocation } from '../contexts/LocationContext'
import {
  Shield, AlertTriangle, Users, MapPin, FileText, Clock,
  ChevronRight, Mic, EyeOff, Zap, Radio, Plus, Activity,
  Sparkles, TrendingUp, Lock
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import GuardianLogo from '../components/GuardianLogo'
import SafeScreen from '../components/SafeScreen'
import { getTimeOfDay, formatDate } from '../utils/formatters'

export default function DashboardScreen() {
  const { user } = useAuth()
  const { isEmergencyActive, contacts, history } = useEmergency()
  const { position, getCurrentPosition } = useLocation()
  const navigate = useNavigate()
  const [showSafeScreen, setShowSafeScreen] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => { getCurrentPosition() }, [])
  
  useEffect(() => {
    setGreeting(`Good ${getTimeOfDay()}`)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const quickActions = [
    { icon: AlertTriangle, label: 'SOS', color: '#F43F5E', bg: 'rgba(244,63,94,0.1)', glow: 'rgba(244,63,94,0.2)', path: '/sos' },
    { icon: Users, label: 'Contacts', color: '#6366F1', bg: 'rgba(99,102,241,0.1)', glow: 'rgba(99,102,241,0.2)', path: '/contacts' },
    { icon: FileText, label: 'Evidence', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', glow: 'rgba(167,139,250,0.2)', path: '/evidence' },
    { icon: MapPin, label: 'Tracking', color: '#10B981', bg: 'rgba(16,185,129,0.1)', glow: 'rgba(16,185,129,0.2)', path: '/tracking' },
  ]

  const stats = [
    { label: 'Contacts', value: contacts.length, icon: Users, color: 'var(--accent-blue)' },
    { label: 'Events', value: history.length, icon: Activity, color: 'var(--accent-amber)' },
    { label: 'Status', value: isEmergencyActive ? 'Alert' : 'Safe', icon: Shield, color: isEmergencyActive ? 'var(--accent-red)' : 'var(--accent-green)' },
  ]

  return (
    <div className="page" id="dashboard-screen">
      {/* Header */}
      <div className="dash-header animate-fadeInDown">
        <div className="dash-header-left">
          <p className="dash-greeting">{greeting}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <GuardianLogo size={28} />
            <h1 className="dash-username">{user?.name || 'User'}</h1>
          </div>
          <p className="dash-time">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="dash-avatar" onClick={() => navigate('/profile')}>
          <span>{user?.avatar || user?.name?.charAt(0) || 'U'}</span>
          <div className="dash-avatar-status" />
        </div>
      </div>

      {/* Status Banner */}
      <div className={`dash-status ${isEmergencyActive ? 'danger' : 'safe'} animate-fadeInUp`}>
        <div className="dash-status-icon">
          {isEmergencyActive ? <Radio size={20} /> : <Shield size={20} />}
        </div>
        <div className="dash-status-text">
          <span className="dash-status-title">
            {isEmergencyActive ? 'Emergency Active' : 'All Clear'}
          </span>
          <span className="dash-status-desc">
            {isEmergencyActive ? 'Alerts sent to your contacts' : 'GUARDIAN is actively watching'}
          </span>
        </div>
        {isEmergencyActive ? (
          <button className="dash-status-btn danger" onClick={() => navigate('/tracking')}>
            View <ChevronRight size={14} />
          </button>
        ) : (
          <div className="dash-status-pulse" />
        )}
      </div>

      {/* Stats Row */}
      <div className="dash-stats animate-fadeInUp stagger-1">
        {stats.map((stat, i) => (
          <div key={stat.label} className="dash-stat-item">
            <stat.icon size={16} style={{ color: stat.color }} />
            <span className="dash-stat-value" style={{ color: stat.color }}>{stat.value}</span>
            <span className="dash-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="dash-section animate-fadeInUp stagger-2">
        <h3 className="dash-section-title">Quick Actions</h3>
        <div className="dash-actions-grid">
          {quickActions.map((action, i) => (
            <button key={action.label} className="dash-action-card" onClick={() => navigate(action.path)}
              style={{ '--action-glow': action.glow }}
            >
              <div className="dash-action-icon" style={{ background: action.bg, color: action.color }}>
                <action.icon size={22} />
              </div>
              <span className="dash-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contacts Preview */}
      <div className="dash-section animate-fadeInUp stagger-3">
        <div className="dash-section-header">
          <h3 className="dash-section-title">Emergency Contacts</h3>
          <button className="dash-section-link" onClick={() => navigate('/contacts')}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        {contacts.length === 0 ? (
          <button className="dash-empty-contacts" onClick={() => navigate('/contacts')}>
            <div className="dash-empty-icon">
              <Plus size={20} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Add contacts</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Set up your emergency network</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
          </button>
        ) : (
          <div className="dash-contacts-list">
            {contacts.slice(0, 3).map((c, i) => (
              <div key={c.id} className="dash-contact-chip" onClick={() => navigate('/contacts')}
                style={{ animationDelay: `${0.18 + i * 0.06}s` }}
              >
                <div className="dash-contact-avatar" style={{
                  background: c.tier === 1 ? 'var(--gradient-red)' : c.tier === 2 ? 'linear-gradient(135deg, var(--accent-amber), var(--accent-amber-dark))' : 'var(--gradient-blue)'
                }}>
                  {c.name.charAt(0)}
                </div>
                <div className="dash-contact-info">
                  <p className="dash-contact-name">{c.name}</p>
                  <p className="dash-contact-phone">{c.phone}</p>
                </div>
                <span className="dash-contact-tier" style={{
                  color: c.tier === 1 ? 'var(--accent-red)' : c.tier === 2 ? 'var(--accent-amber)' : 'var(--accent-blue)',
                  background: c.tier === 1 ? 'var(--accent-red-surface)' : c.tier === 2 ? 'var(--accent-amber-surface)' : 'var(--accent-blue-surface)'
                }}>
                  T{c.tier}
                </span>
              </div>
            ))}
            {contacts.length > 3 && (
              <div className="dash-contact-more">+{contacts.length - 3} more contacts</div>
            )}
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="dash-section animate-fadeInUp stagger-4">
        <h3 className="dash-section-title">Features</h3>
        <div className="dash-features">
          <button className="dash-feature-card" onClick={() => navigate('/profile')}>
            <div className="dash-feature-icon" style={{ background: 'var(--accent-amber-surface)', color: 'var(--accent-amber)' }}>
              <Mic size={20} />
            </div>
            <div className="dash-feature-info">
              <p className="dash-feature-name">Voice Trigger</p>
              <p className="dash-feature-desc">Say "Help me" to activate</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </button>

          <button className="dash-feature-card" onClick={() => setShowSafeScreen(true)}>
            <div className="dash-feature-icon" style={{ background: 'var(--accent-purple-surface)', color: 'var(--accent-purple)' }}>
              <EyeOff size={20} />
            </div>
            <div className="dash-feature-info">
              <p className="dash-feature-name">Safe Screen</p>
              <p className="dash-feature-desc">Stealth mode — hide the app</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </button>

          <button className="dash-feature-card" onClick={() => navigate('/evidence')}>
            <div className="dash-feature-icon" style={{ background: 'var(--accent-cyan-surface)', color: 'var(--accent-cyan)' }}>
              <Lock size={20} />
            </div>
            <div className="dash-feature-info">
              <p className="dash-feature-name">Evidence Vault</p>
              <p className="dash-feature-desc">Secure audio & video capture</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {history.length > 0 && (
        <div className="dash-section animate-fadeInUp stagger-5">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Recent Activity</h3>
            <button className="dash-section-link" onClick={() => navigate('/history')}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          {history.slice(0, 2).map(h => (
            <div key={h.id} className="dash-history-item">
              <div className={`dash-history-dot ${h.status}`} />
              <div className="dash-history-info">
                <p className="dash-history-title">
                  Emergency {h.status === 'active' ? 'Active' : 'Resolved'}
                </p>
                <p className="dash-history-time">{formatDate(h.startTime)}</p>
              </div>
              <span className={`badge ${h.status === 'active' ? 'badge-danger' : 'badge-safe'}`}>
                {h.status === 'active' ? 'Active' : 'Done'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Safe Screen Overlay */}
      {showSafeScreen && (
        <SafeScreen onExit={() => setShowSafeScreen(false)} />
      )}

      <style>{`
        .dash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-top: 12px;
        }
        .dash-header-left { flex: 1; }
        .dash-greeting {
          font-size: 13px;
          color: var(--text-tertiary);
          font-weight: 500;
          margin-bottom: 2px;
          letter-spacing: 0.02em;
        }
        .dash-username {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          margin-bottom: 2px;
        }
        .dash-time {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .dash-avatar {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-xl);
          background: var(--gradient-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          cursor: pointer;
          transition: all var(--transition-base);
          position: relative;
          box-shadow: 0 4px 20px rgba(99,102,241,0.25);
          flex-shrink: 0;
        }
        .dash-avatar span { position: relative; z-index: 1; }
        .dash-avatar:hover { transform: scale(1.05); box-shadow: 0 6px 25px rgba(99,102,241,0.35); }
        .dash-avatar-status {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent-green);
          border: 3px solid var(--bg-primary);
          box-shadow: 0 0 8px rgba(16,185,129,0.4);
        }
        .dash-status {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          border-radius: var(--radius-2xl);
          margin-bottom: 24px;
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }
        .dash-status::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          pointer-events: none;
        }
        .dash-status.safe {
          background: rgba(16,185,129,0.06);
          border: 1px solid rgba(16,185,129,0.1);
        }
        .dash-status.safe::before {
          background: linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent);
        }
        .dash-status.danger {
          background: rgba(244,63,94,0.06);
          border: 1px solid rgba(244,63,94,0.12);
          animation: borderGlow 2.5s infinite;
        }
        .dash-status.danger::before {
          background: linear-gradient(90deg, transparent, rgba(244,63,94,0.2), transparent);
        }
        .dash-status-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dash-status.safe .dash-status-icon {
          background: rgba(16,185,129,0.12);
          color: var(--accent-green);
        }
        .dash-status.danger .dash-status-icon {
          background: rgba(244,63,94,0.12);
          color: var(--accent-red);
          animation: glowPulse 2s ease-in-out infinite;
        }
        .dash-status-text { flex: 1; }
        .dash-status-title {
          display: block;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: -0.01em;
        }
        .dash-status.safe .dash-status-title { color: var(--accent-green); }
        .dash-status.danger .dash-status-title { color: var(--accent-red); }
        .dash-status-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 1px;
          display: block;
        }
        .dash-status-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-family);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .dash-status-btn.danger {
          background: rgba(244,63,94,0.15);
          color: var(--accent-red);
          border: 1px solid rgba(244,63,94,0.2);
        }
        .dash-status-btn.danger:hover {
          background: rgba(244,63,94,0.25);
        }
        .dash-status-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-green);
          box-shadow: 0 0 12px rgba(16,185,129,0.4);
          animation: glow 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .dash-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 28px;
        }
        .dash-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 16px 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          text-align: center;
          backdrop-filter: blur(12px);
        }
        .dash-stat-value {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .dash-stat-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dash-section {
          margin-bottom: 28px;
        }
        .dash-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .dash-section-title {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
          color: var(--text-primary);
        }
        .dash-section-header .dash-section-title {
          margin-bottom: 0;
        }
        .dash-section-link {
          display: flex;
          align-items: center;
          gap: 2px;
          background: none;
          border: none;
          color: var(--accent-blue);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-family);
          transition: all var(--transition-fast);
          letter-spacing: 0.01em;
        }
        .dash-section-link:hover { color: var(--accent-blue-light); gap: 6px; }

        .dash-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .dash-action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 8px;
          cursor: pointer;
          text-align: center;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-family);
          position: relative;
          overflow: hidden;
        }
        .dash-action-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        }
        .dash-action-card:hover {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-strong);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px var(--action-glow, rgba(0,0,0,0.2));
        }
        .dash-action-card:active { transform: scale(0.96); }
        .dash-action-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dash-action-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.01em;
        }

        .dash-empty-contacts {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          cursor: pointer;
          background: var(--glass-bg);
          border: 1px dashed var(--glass-border-strong);
          border-radius: var(--radius-xl);
          font-family: var(--font-family);
          text-align: left;
          color: var(--text-primary);
          width: 100%;
          transition: all var(--transition-base);
        }
        .dash-empty-contacts:hover {
          background: var(--glass-bg-strong);
          border-color: var(--accent-blue);
          transform: translateY(-1px);
        }
        .dash-empty-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          background: var(--accent-blue-surface);
          border: 1px solid rgba(99,102,241,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
          flex-shrink: 0;
        }
        .dash-contacts-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dash-contact-chip {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .dash-contact-chip:hover {
          background: var(--glass-bg-hover);
          transform: translateX(4px);
          border-color: var(--glass-border-strong);
        }
        .dash-contact-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          color: white;
          flex-shrink: 0;
        }
        .dash-contact-info { flex: 1; min-width: 0; }
        .dash-contact-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .dash-contact-phone {
          font-size: 12px;
          color: var(--text-tertiary);
        }
        .dash-contact-tier {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          flex-shrink: 0;
        }
        .dash-contact-more {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          padding: 8px;
          font-weight: 500;
        }
        .dash-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dash-feature-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          cursor: pointer;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          transition: all var(--transition-base);
          font-family: var(--font-family);
          text-align: left;
          color: var(--text-primary);
          width: 100%;
        }
        .dash-feature-card:hover {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-strong);
          transform: translateX(4px);
        }
        .dash-feature-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dash-feature-info { flex: 1; min-width: 0; }
        .dash-feature-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 1px;
        }
        .dash-feature-desc {
          font-size: 12px;
          color: var(--text-tertiary);
        }
        .dash-history-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          margin-bottom: 6px;
        }
        .dash-history-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dash-history-dot.active {
          background: var(--accent-red);
          box-shadow: 0 0 10px rgba(244,63,94,0.4);
          animation: glow 2s ease-in-out infinite;
        }
        .dash-history-dot.resolved {
          background: var(--accent-green);
          box-shadow: 0 0 8px rgba(16,185,129,0.3);
        }
        .dash-history-info { flex: 1; min-width: 0; }
        .dash-history-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }
        .dash-history-time {
          font-size: 12px;
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  )
}
