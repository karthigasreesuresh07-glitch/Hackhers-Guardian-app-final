import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Shield, Users, Clock, User, AlertTriangle } from 'lucide-react'
import { useEmergency } from '../contexts/EmergencyContext'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/sos', icon: AlertTriangle, label: 'SOS', isSos: true },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/profile', icon: User, label: 'Profile' }
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isEmergencyActive } = useEmergency()

  // Hide on certain screens
  const hiddenPaths = ['/', '/onboarding', '/login', '/register', '/splash']
  if (hiddenPaths.includes(location.pathname)) return null

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      {navItems.map(item => {
        const Icon = item.icon
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''} ${item.isSos ? 'sos-nav' : ''}`}
            onClick={() => navigate(item.path)}
            id={`nav-${item.label.toLowerCase()}`}
            style={item.isSos ? {
              background: isEmergencyActive ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.06)',
              borderRadius: '16px',
              margin: '0 -2px'
            } : {}}
          >
            <Icon size={item.isSos ? 22 : 20} strokeWidth={isActive ? 2.5 : 1.5}
              style={item.isSos && isEmergencyActive ? { animation: 'glowPulse 1.5s infinite' } : {}}
            />
            <span className="nav-item-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
