export default function LoadingSpinner({ size = 40, color = 'var(--accent-blue)' }) {
  return (
    <div className="spinner-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <svg width={size} height={size} viewBox="0 0 50 50" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle cx="25" cy="25" r="20" fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray="80, 200" strokeDashoffset="0"
          style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
        />
      </svg>
    </div>
  )
}
