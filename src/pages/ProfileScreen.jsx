import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEmergency } from '../contexts/EmergencyContext'
import SafeScreen from '../components/SafeScreen'
import BackButton from '../components/BackButton'
import {
  User, Mail, Phone, Shield, LogOut, Mic, MicOff, Eye, EyeOff,
  Bell, MapPin, ChevronRight, Settings, Lock, Info, Volume2, Heart
} from 'lucide-react'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { triggerSOS, voiceTriggerEnabled, setVoiceTriggerEnabled } = useEmergency()
  const navigate = useNavigate()
  const [showSafeScreen, setShowSafeScreen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const toggleVoice = () => {
    setVoiceTriggerEnabled(!voiceTriggerEnabled)
  }


  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const settingsGroups = [
    {
      title: 'Safety Features',
      items: [
        {
          icon: voiceTriggerEnabled ? Mic : MicOff,
          label: 'Voice Trigger',
          desc: voiceTriggerEnabled ? 'Listening for "Help me"' : 'Say "Help me" to activate SOS',
          color: 'var(--accent-amber)',
          surface: 'var(--accent-amber-surface)',
          action: toggleVoice,
          toggle: true,
          toggleState: voiceTriggerEnabled,
          disabled: false // Assuming supported or handled by hook
        },
        {
          icon: EyeOff,
          label: 'Safe Screen',
          desc: 'Disguise app as a calculator',
          color: 'var(--accent-purple)',
          surface: 'var(--accent-purple-surface)',
          action: () => setShowSafeScreen(true)
        }
      ]
    },
    {
      title: 'Permissions',
      items: [
        {
          icon: MapPin,
          label: 'Location Access',
          desc: 'Required for GPS tracking',
          color: 'var(--accent-green)',
          surface: 'var(--accent-green-surface)',
          action: () => {}
        },
        {
          icon: Volume2,
          label: 'Microphone',
          desc: 'For voice trigger & recording',
          color: 'var(--accent-blue)',
          surface: 'var(--accent-blue-surface)',
          action: () => {}
        },
        {
          icon: Bell,
          label: 'Notifications',
          desc: 'For emergency alerts',
          color: 'var(--accent-red)',
          surface: 'var(--accent-red-surface)',
          action: () => {}
        }
      ]
    }
  ]

  return (
    <div className="page" id="profile-screen">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton />
          <h1 className="page-title">Profile</h1>
        </div>
        <button className="profile-settings-btn">
          <Settings size={18} />
        </button>
      </div>

      {/* User Card */}
      <div className="profile-card animate-fadeInUp">
        <div className="profile-card-bg" />
        <div className="profile-avatar">
          <span>{user?.avatar || user?.name?.charAt(0) || 'U'}</span>
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.name || 'User'}</h2>
          <div className="profile-detail">
            <Mail size={13} />
            <span>{user?.email || 'email@example.com'}</span>
          </div>
          {user?.phone && (
            <div className="profile-detail">
              <Phone size={13} />
              <span>{user.phone}</span>
            </div>
          )}
        </div>
        <div className="profile-card-badge">
          <Shield size={12} />
          <span>Protected</span>
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map(group => (
        <div key={group.title} className="profile-section animate-fadeInUp">
          <h3 className="profile-section-title">{group.title}</h3>
          <div className="profile-settings-list">
            {group.items.map(item => (
              <button key={item.label} className="profile-setting-item"
                onClick={item.action} disabled={item.disabled}
              >
                <div className="profile-setting-icon" style={{ background: item.surface, color: item.color }}>
                  <item.icon size={17} />
                </div>
                <div className="profile-setting-info">
                  <span className="profile-setting-label">{item.label}</span>
                  <span className="profile-setting-desc">{item.desc}</span>
                </div>
                {item.toggle ? (
                  <div className={`profile-toggle ${item.toggleState ? 'active' : ''}`}>
                    <div className="profile-toggle-dot" />
                  </div>
                ) : (
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button className="profile-logout animate-fadeInUp" onClick={() => setShowLogoutConfirm(true)}>
        <LogOut size={17} />
        <span>Sign Out</span>
      </button>

      {/* App version */}
      <div className="profile-footer">
        <p className="profile-version">GUARDIAN v1.0.0</p>
        <p className="profile-credits">
          Built with <Heart size={10} fill="var(--accent-red)" color="var(--accent-red)" style={{ display: 'inline', verticalAlign: 'middle' }} /> for safety
        </p>
      </div>

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Sign Out?</h3>
            <p className="modal-body">You will need to sign in again to use GUARDIAN.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Screen */}
      {showSafeScreen && <SafeScreen onExit={() => setShowSafeScreen(false)} />}

      <style>{`
        .profile-settings-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .profile-settings-btn:hover {
          background: var(--glass-bg-strong);
          color: var(--text-secondary);
        }
        .profile-card {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 24px;
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-2xl);
          margin-bottom: 28px;
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }
        .profile-card-bg {
          position: absolute;
          top: 0; right: 0;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%);
          pointer-events: none;
        }
        .profile-avatar {
          width: 68px;
          height: 68px;
          border-radius: var(--radius-2xl);
          background: var(--gradient-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0 4px 20px rgba(99,102,241,0.25);
        }
        .profile-avatar span { position: relative; z-index: 1; }
        .profile-info { min-width: 0; flex: 1; position: relative; }
        .profile-name {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 6px;
          letter-spacing: -0.03em;
        }
        .profile-detail {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--text-tertiary);
          margin-bottom: 2px;
        }
        .profile-card-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: var(--accent-green-surface);
          color: var(--accent-green);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: 1px solid rgba(16,185,129,0.12);
        }
        .profile-section {
          margin-bottom: 24px;
        }
        .profile-section-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
          padding-left: 4px;
        }
        .profile-settings-list {
          display: flex;
          flex-direction: column;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-2xl);
          overflow: hidden;
        }
        .profile-setting-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: none;
          border: none;
          border-bottom: 1px solid var(--glass-border);
          cursor: pointer;
          transition: background var(--transition-fast);
          font-family: var(--font-family);
          text-align: left;
          color: var(--text-primary);
          width: 100%;
        }
        .profile-setting-item:last-child { border-bottom: none; }
        .profile-setting-item:hover { background: rgba(255,255,255,0.02); }
        .profile-setting-item:disabled { opacity: 0.45; }
        .profile-setting-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .profile-setting-info { flex: 1; min-width: 0; }
        .profile-setting-label {
          display: block;
          font-weight: 600;
          font-size: 14px;
        }
        .profile-setting-desc {
          display: block;
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 1px;
        }
        .profile-toggle {
          width: 48px;
          height: 26px;
          border-radius: 13px;
          background: var(--glass-border-strong);
          position: relative;
          transition: background 0.35s;
          flex-shrink: 0;
        }
        .profile-toggle.active {
          background: var(--accent-green);
          box-shadow: 0 0 12px rgba(16,185,129,0.3);
        }
        .profile-toggle-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .profile-toggle.active .profile-toggle-dot {
          transform: translateX(22px);
        }
        .profile-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 15px;
          background: var(--accent-red-surface);
          border: 1px solid rgba(244,63,94,0.1);
          border-radius: var(--radius-xl);
          color: var(--accent-red);
          font-family: var(--font-family);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          margin-bottom: 20px;
        }
        .profile-logout:hover {
          background: rgba(244,63,94,0.12);
          border-color: rgba(244,63,94,0.2);
          transform: translateY(-1px);
        }
        .profile-footer {
          text-align: center;
          margin-bottom: 20px;
        }
        .profile-version {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .profile-credits {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }
      `}</style>
    </div>
  )
}
