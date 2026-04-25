export default function GlassCard({ children, className = '', style = {}, onClick, hover = true, padding = true }) {
  return (
    <div
      className={`card ${hover ? '' : 'no-hover'} ${className}`}
      style={{
        ...(!padding && { padding: 0 }),
        ...(!hover && { cursor: 'default' }),
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
