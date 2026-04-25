import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Fingerprint } from 'lucide-react'
import GuardianLogo from '../components/GuardianLogo'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen" id="login-screen">
      {/* Background effects */}
      <div className="auth-bg-mesh" />
      <div className="auth-bg-orb auth-orb-1" />
      <div className="auth-bg-orb auth-orb-2" />

      <div className="auth-header animate-fadeInDown">
        <div className="auth-logo">
          <div className="auth-logo-glow" />
          <GuardianLogo size={32} />
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your GUARDIAN account</p>
      </div>

      <form className="auth-form animate-fadeInUp" onSubmit={handleSubmit}>
        {error && (
          <div className="auth-error animate-shakeX">
            <div className="auth-error-icon">!</div>
            <span>{error}</span>
          </div>
        )}

        <div className={`auth-input-group ${focused === 'email' ? 'focused' : ''}`}>
          <div className="auth-input-icon"><Mail size={17} /></div>
          <input type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            className="auth-input" id="login-email" autoComplete="email"
          />
          <div className="auth-input-highlight" />
        </div>

        <div className={`auth-input-group ${focused === 'password' ? 'focused' : ''}`}>
          <div className="auth-input-icon"><Lock size={17} /></div>
          <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            className="auth-input" id="login-password" autoComplete="current-password"
          />
          <button type="button" className="auth-input-toggle" onClick={() => setShowPass(!showPass)}>
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
          <div className="auth-input-highlight" />
        </div>

        <button className="auth-forgot" type="button">Forgot password?</button>

        <button type="submit" className="auth-submit" disabled={loading} id="login-submit">
          {loading ? <Loader2 size={20} className="auth-spinner" /> : (
            <>Sign In <ArrowRight size={17} /></>
          )}
        </button>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="auth-social-row">
          <button type="button" className="auth-social-btn">
            <Fingerprint size={20} />
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </form>

      <style>{`
        .auth-screen {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          position: relative;
          overflow: hidden;
        }
        .auth-bg-mesh {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1), transparent 60%),
            radial-gradient(ellipse at 20% 100%, rgba(167,139,250,0.06), transparent 50%);
          pointer-events: none;
        }
        .auth-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: breathe 8s ease-in-out infinite;
        }
        .auth-orb-1 {
          width: 350px; height: 350px;
          background: rgba(99,102,241,0.08);
          top: -150px; right: -100px;
        }
        .auth-orb-2 {
          width: 280px; height: 280px;
          background: rgba(167,139,250,0.05);
          bottom: -120px; left: -80px;
          animation-delay: 3s;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 44px;
          position: relative;
          z-index: 1;
        }
        .auth-logo {
          width: 68px;
          height: 68px;
          border-radius: var(--radius-2xl);
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04));
          border: 1px solid rgba(99,102,241,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: var(--accent-blue);
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(99,102,241,0.1);
        }
        .auth-logo-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.2), transparent);
        }
        .auth-title {
          font-size: 30px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-subtitle {
          font-size: 14px;
          color: var(--text-tertiary);
          font-weight: 500;
        }
        .auth-form {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          z-index: 1;
        }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-radius: var(--radius-lg);
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.15);
          color: var(--accent-red-light);
          font-size: var(--font-size-sm);
          animation: shakeX 0.5s;
        }
        .auth-error-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(244,63,94,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .auth-input-group {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }
        .auth-input-group.focused {
          transform: translateY(-1px);
        }
        .auth-input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
          pointer-events: none;
          z-index: 2;
          transition: color var(--transition-base);
        }
        .auth-input-group.focused .auth-input-icon {
          color: var(--accent-blue);
        }
        .auth-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 14px;
          outline: none;
          transition: all var(--transition-base);
        }
        .auth-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 4px 20px rgba(0,0,0,0.2);
          background: rgba(255,255,255,0.04);
        }
        .auth-input::placeholder { color: var(--text-muted); }
        .auth-input-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          transition: color var(--transition-fast);
          z-index: 2;
        }
        .auth-input-toggle:hover { color: var(--text-secondary); }
        .auth-input-highlight {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--gradient-blue);
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-input-group.focused .auth-input-highlight {
          width: 60%;
        }
        .auth-forgot {
          align-self: flex-end;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: var(--font-family);
          transition: color var(--transition-fast);
          margin-top: -4px;
        }
        .auth-forgot:hover { color: var(--accent-blue); }
        .auth-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border: none;
          border-radius: var(--radius-lg);
          background: var(--gradient-blue);
          color: white;
          font-family: var(--font-family);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
          margin-top: 4px;
          letter-spacing: 0.01em;
          position: relative;
          overflow: hidden;
        }
        .auth-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.1), transparent);
          pointer-events: none;
        }
        .auth-submit:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 30px rgba(99,102,241,0.4); 
        }
        .auth-submit:active { transform: scale(0.98); }
        .auth-submit:disabled { opacity: 0.6; pointer-events: none; }
        .auth-spinner { animation: spin 1s linear infinite; }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 8px 0;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--glass-border-strong), transparent);
        }
        .auth-divider span {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .auth-social-row {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .auth-social-btn {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
        }
        .auth-social-btn:hover {
          background: var(--glass-bg-strong);
          border-color: var(--glass-border-strong);
          transform: translateY(-2px);
        }
        .auth-switch {
          text-align: center;
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          margin-top: 8px;
        }
        .auth-switch a {
          color: var(--accent-blue);
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
