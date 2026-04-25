import { useState, useEffect } from 'react'
import { Calculator, X } from 'lucide-react'

export default function SafeScreen({ onExit }) {
  const [display, setDisplay] = useState('0')
  const [tapCount, setTapCount] = useState(0)
  const [lastTap, setLastTap] = useState(0)

  const handleTitleTap = () => {
    const now = Date.now()
    if (now - lastTap < 400) {
      setTapCount(prev => {
        if (prev + 1 >= 4) {
          onExit?.()
          return 0
        }
        return prev + 1
      })
    } else {
      setTapCount(1)
    }
    setLastTap(now)
  }

  const handleCalcBtn = (val) => {
    if (val === 'C') { setDisplay('0'); return }
    if (val === '=') {
      try { setDisplay(String(eval(display))) } catch { setDisplay('Error') }
      return
    }
    if (val === '⌫') { setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return }
    setDisplay(d => d === '0' ? val : d + val)
  }

  const buttons = ['C', '⌫', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=']

  return (
    <div className="safe-screen-overlay" id="safe-screen" onClick={e => e.stopPropagation()}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '40px 20px 20px' }}>
        <div onClick={handleTitleTap} style={{ textAlign: 'center', marginBottom: 20, cursor: 'default' }}>
          <span style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>Calculator</span>
        </div>

        <div style={{
          background: '#222', borderRadius: 16, padding: '24px 20px', marginBottom: 16,
          textAlign: 'right', fontSize: display.length > 10 ? 28 : 40, fontWeight: 300,
          color: '#fff', minHeight: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          fontFamily: "'Inter', monospace"
        }}>
          {display}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {buttons.map(b => {
            const isOp = ['÷', '×', '-', '+', '='].includes(b)
            const isZero = b === '0'
            return (
              <button key={b} onClick={() => {
                const map = { '÷': '/', '×': '*' }
                handleCalcBtn(map[b] || b)
              }}
                style={{
                  gridColumn: isZero ? 'span 2' : undefined,
                  padding: '18px 0', border: 'none', borderRadius: 12, fontSize: 22,
                  fontWeight: isOp ? 500 : 400, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  background: isOp ? '#ff9500' : b === 'C' || b === '⌫' || b === '%' ? '#333' : '#444',
                  color: '#fff', transition: 'all 0.15s',
                }}
              >{b}</button>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#555' }}>
          Tap title 4 times quickly to return
        </p>
      </div>
    </div>
  )
}
