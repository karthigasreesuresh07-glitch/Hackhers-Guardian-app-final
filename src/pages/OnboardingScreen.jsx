import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, MapPin, Bell, ChevronRight, Fingerprint, Wifi, Lock } from 'lucide-react'

const slides = [
  {
    icon: Shield,
    color: '#6366F1',
    colorLight: '#A5B4FC',
    title: 'Your Safety Shield',
    description: 'GUARDIAN is your personal emergency response system that keeps you protected around the clock.',
    bg: 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.12), transparent 60%)',
    features: ['24/7 Protection', 'Instant Alerts', 'AI-Powered']
  },
  {
    icon: MapPin,
    color: '#10B981',
    colorLight: '#6EE7B7',
    title: 'Live GPS Tracking',
    description: 'Share your real-time location with trusted contacts during emergencies with pinpoint accuracy.',
    bg: 'radial-gradient(circle at 50% 30%, rgba(16,185,129,0.12), transparent 60%)',
    features: ['Real-Time Updates', 'Route History', 'One-Tap Share']
  },
  {
    icon: Bell,
    color: '#F43F5E',
    colorLight: '#FDA4AF',
    title: 'Instant SOS Alerts',
    description: 'One press sends immediate alerts to your emergency contacts with your exact location.',
    bg: 'radial-gradient(circle at 50% 30%, rgba(244,63,94,0.12), transparent 60%)',
    features: ['Multi-Tier Alerts', 'Auto-Escalation', 'Evidence Capture']
  }
]

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const slide = slides[current]

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1)
    else navigate('/login', { replace: true })
  }

  return (
    <div className="onboarding-screen" id="onboarding-screen">
      {/* Background effects */}
      <div className="onboarding-bg" style={{ background: slide.bg }} />
      <div className="onboarding-mesh" />

      <button className="onboarding-skip" onClick={() => navigate('/login', { replace: true })}>
        Skip <ChevronRight size={14} />
      </button>

      <div className="onboarding-content animate-fadeInUp" key={current}>
        <div className="onboarding-icon-wrap" style={{ '--icon-color': slide.color, '--icon-light': slide.colorLight }}>
          <div className="onboarding-icon-ring" />
          <div className="onboarding-icon-bg" />
          <slide.icon size={48} strokeWidth={1.5} />
        </div>

        <h2 className="onboarding-title">{slide.title}</h2>
        <p className="onboarding-desc">{slide.description}</p>

        {/* Feature pills */}
        <div className="onboarding-features">
          {slide.features.map((f, i) => (
            <span key={i} className="onboarding-feature-pill" style={{
              borderColor: `${slide.color}30`,
              color: slide.colorLight,
              animationDelay: `${0.3 + i * 0.1}s`
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {slides.map((_, i) => (
            <div key={i} className={`onboarding-dot ${i === current ? 'active' : ''}`}
              style={i === current ? { background: slide.color, boxShadow: `0 0 12px ${slide.color}40` } : {}}
            />
          ))}
        </div>

        <button className="onboarding-next" onClick={next}
          style={{ background: `linear-gradient(135deg, ${slide.color}, ${slide.color}dd)`, boxShadow: `0 4px 20px ${slide.color}35` }}
          id="onboarding-next-btn"
        >
          {current === slides.length - 1 ? 'Get Started' : 'Continue'}
          <ChevronRight size={18} />
        </button>
      </div>

      <style>{`
        .onboarding-screen {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 28px;
          position: relative;
          background-color: var(--bg-primary);
          overflow: hidden;
        }
        .onboarding-bg {
          position: absolute;
          inset: 0;
          transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }
        .onboarding-mesh {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 10% 90%, rgba(99, 102, 241, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 10%, rgba(167, 139, 250, 0.04) 0%, transparent 50%);
          pointer-events: none;
        }
        .onboarding-skip {
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-tertiary);
          font-size: var(--font-size-xs);
          font-weight: 600;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-family: var(--font-family);
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all var(--transition-base);
          backdrop-filter: blur(12px);
        }
        .onboarding-skip:hover {
          background: var(--glass-bg-strong);
          color: var(--text-secondary);
        }
        .onboarding-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 20px;
          max-width: 320px;
          position: relative;
          z-index: 1;
        }
        .onboarding-icon-wrap {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--icon-color);
          margin-bottom: 20px;
        }
        .onboarding-icon-bg {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.08;
        }
        .onboarding-icon-ring {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 1px solid currentColor;
          opacity: 0.12;
          animation: breathe 3s ease-in-out infinite;
        }
        .onboarding-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          line-height: 1.1;
        }
        .onboarding-desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.65;
          max-width: 300px;
        }
        .onboarding-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 8px;
        }
        .onboarding-feature-pill {
          padding: 6px 14px;
          border-radius: var(--radius-full);
          border: 1px solid;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .onboarding-footer {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 40px;
          position: relative;
          z-index: 1;
        }
        .onboarding-dots {
          display: flex;
          gap: 8px;
        }
        .onboarding-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .onboarding-dot.active {
          width: 28px;
          border-radius: 4px;
        }
        .onboarding-next {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 14px 32px;
          border: none;
          border-radius: var(--radius-xl);
          color: white;
          font-family: var(--font-family);
          font-weight: 600;
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          letter-spacing: 0.01em;
        }
        .onboarding-next:hover { 
          transform: translateY(-2px); 
          filter: brightness(1.1);
        }
        .onboarding-next:active { transform: scale(0.97); }
      `}</style>
    </div>
  )
}
