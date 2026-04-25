export default function GuardianLogo({ size = 48, showText = false, animate = false, className = '' }) {
  const scale = size / 48

  return (
    <div className={`guardian-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.25 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? 'guardian-logo-animate' : ''}
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Shield body gradient */}
          <linearGradient id="shieldGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="35%" stopColor="#6366F1" />
            <stop offset="70%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>
          {/* Inner glow */}
          <linearGradient id="shieldInner" x1="14" y1="10" x2="34" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
          </linearGradient>
          {/* Cross/plus gradient */}
          <linearGradient id="crossGrad" x1="20" y1="14" x2="28" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          {/* Outer glow filter */}
          <filter id="shieldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feColorMatrix values="0 0 0 0 0.388 0 0 0 0 0.4 0 0 0 0 0.945 0 0 0 0.4 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Shield shape — modern rounded shield */}
        <g filter="url(#shieldGlow)">
          <path
            d="M24 3L6 11V22C6 33.5 13.5 42.5 24 46C34.5 42.5 42 33.5 42 22V11L24 3Z"
            fill="url(#shieldGrad)"
            stroke="rgba(165,180,252,0.25)"
            strokeWidth="0.75"
          />
        </g>

        {/* Inner highlight layer */}
        <path
          d="M24 5.5L8.5 12.5V22C8.5 32.2 15.2 40.4 24 43.5C32.8 40.4 39.5 32.2 39.5 22V12.5L24 5.5Z"
          fill="url(#shieldInner)"
        />

        {/* Top edge shine */}
        <path
          d="M24 5L9 12V13L24 6L39 13V12L24 5Z"
          fill="rgba(255,255,255,0.15)"
        />

        {/* Cross / Plus symbol — safety/guardian icon */}
        <rect x="21" y="14" width="6" height="20" rx="2.5" fill="url(#crossGrad)" />
        <rect x="14" y="21" width="20" height="6" rx="2.5" fill="url(#crossGrad)" />

        {/* Small diamond accents at cross ends */}
        <circle cx="24" cy="14.5" r="1" fill="rgba(255,255,255,0.6)" />
        <circle cx="24" cy="33.5" r="1" fill="rgba(255,255,255,0.3)" />
        <circle cx="14.5" cy="24" r="1" fill="rgba(255,255,255,0.4)" />
        <circle cx="33.5" cy="24" r="1" fill="rgba(255,255,255,0.4)" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <span style={{
            fontSize: size * 0.48,
            fontWeight: 900,
            letterSpacing: size * 0.06,
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #F1F5F9 0%, #A5B4FC 45%, #818CF8 70%, #6366F1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Inter', sans-serif",
          }}>
            GUARDIAN
          </span>
          {size >= 36 && (
            <span style={{
              fontSize: Math.max(size * 0.16, 8),
              fontWeight: 500,
              color: '#64748B',
              letterSpacing: size * 0.04,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              marginTop: 1,
            }}>
              Emergency Response
            </span>
          )}
        </div>
      )}

      <style>{`
        .guardian-logo-animate svg {
          animation: guardianLogoBreath 3s ease-in-out infinite;
        }
        @keyframes guardianLogoBreath {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(99,102,241,0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(99,102,241,0.5)); }
        }
      `}</style>
    </div>
  )
}
