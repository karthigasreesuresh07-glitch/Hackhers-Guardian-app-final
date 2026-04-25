import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import GuardianLogo from '../components/GuardianLogo'

export default function SplashScreen() {
  const [phase, setPhase] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 900)
    const t3 = setTimeout(() => setPhase(3), 1600)
    const t4 = setTimeout(() => {
      if (user) navigate('/dashboard', { replace: true })
      else navigate('/onboarding', { replace: true })
    }, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [navigate, user])

  return (
    <div className="splash-screen" id="splash-screen">
      {/* Animated mesh background */}
      <div className="splash-mesh" />
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />
      <div className="splash-orb splash-orb-3" />

      {/* Animated particles */}
      <div className="splash-particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="splash-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 3}px`,
            height: `${1 + Math.random() * 3}px`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 6}s`,
            opacity: 0.2 + Math.random() * 0.4
          }} />
        ))}
      </div>

      {/* Shield icon with glow rings */}
      <div className={`splash-icon ${phase >= 1 ? 'visible' : ''}`}>
        <div className="splash-icon-ring splash-icon-ring-1" />
        <div className="splash-icon-ring splash-icon-ring-2" />
        <div className="splash-icon-glow" />
        <div className="splash-icon-inner">
          <GuardianLogo size={56} animate />
        </div>
      </div>

      {/* Logo text */}
      <div className={`splash-text ${phase >= 2 ? 'visible' : ''}`}>
        <h1 className="splash-title">GUARDIAN</h1>
        <div className="splash-divider" />
        <p className="splash-subtitle">Emergency Response System</p>
      </div>

      {/* Loading bar */}
      <div className={`splash-loader ${phase >= 3 ? 'visible' : ''}`}>
        <div className="splash-loader-track">
          <div className="splash-loader-bar" />
        </div>
        <p className="splash-loader-text">Initializing secure connection...</p>
      </div>

      <style>{`
        .splash-screen {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #06080F;
          position: relative;
          overflow: hidden;
          gap: 36px;
        }

        .splash-mesh {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(167, 139, 250, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(244, 63, 94, 0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .splash-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: breathe 6s ease-in-out infinite;
        }
        .splash-orb-1 {
          width: 300px; height: 300px;
          background: rgba(99, 102, 241, 0.08);
          top: -100px; right: -50px;
          animation-delay: 0s;
        }
        .splash-orb-2 {
          width: 250px; height: 250px;
          background: rgba(167, 139, 250, 0.06);
          bottom: -80px; left: -60px;
          animation-delay: 2s;
        }
        .splash-orb-3 {
          width: 200px; height: 200px;
          background: rgba(244, 63, 94, 0.05);
          top: 40%; left: 50%;
          transform: translateX(-50%);
          animation-delay: 4s;
        }

        .splash-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .splash-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(165, 180, 252, 0.5);
          animation: float 5s ease-in-out infinite;
        }

        .splash-icon {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.3) rotate(-10deg);
          transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 2;
        }
        .splash-icon.visible {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
        .splash-icon-inner {
          position: relative;
          z-index: 2;
          color: var(--accent-blue);
          filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
        }
        .splash-icon-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25), rgba(167, 139, 250, 0.1), transparent);
          animation: breathe 3s ease-in-out infinite;
        }
        .splash-icon-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(99, 102, 241, 0.15);
          animation: radar 4s ease-out infinite;
        }
        .splash-icon-ring-1 {
          width: 140px; height: 140px;
          animation-delay: 0s;
        }
        .splash-icon-ring-2 {
          width: 140px; height: 140px;
          animation-delay: 2s;
        }

        .splash-text {
          text-align: center;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 2;
        }
        .splash-text.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .splash-title {
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 10px;
          background: linear-gradient(135deg, #F1F5F9 0%, #A5B4FC 40%, #818CF8 70%, #6366F1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          filter: drop-shadow(0 4px 20px rgba(99, 102, 241, 0.3));
        }
        .splash-divider {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-blue), transparent);
          margin: 0 auto 14px;
          border-radius: 2px;
        }
        .splash-subtitle {
          font-size: 13px;
          color: var(--text-tertiary);
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .splash-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 2;
        }
        .splash-loader.visible { opacity: 1; }
        .splash-loader-track {
          width: 80px;
          height: 2px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
        }
        .splash-loader-bar {
          height: 100%;
          width: 40%;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple-light), var(--accent-blue));
          background-size: 200% 100%;
          animation: shimmer 1.2s ease-in-out infinite;
        }
        .splash-loader-text {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.5px;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
