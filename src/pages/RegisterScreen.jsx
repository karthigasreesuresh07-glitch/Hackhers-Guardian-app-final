import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Lock, Phone, ArrowRight, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import GuardianLogo from '../components/GuardianLogo'

export default function RegisterScreen() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const nextStep = () => {
    if (step === 1 && (!name || !email)) { setError('Please fill in all fields'); return }
    if (step === 1 && !email.includes('@')) { setError('Enter a valid email'); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone || !password) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      await register(name, email, password, phone)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen" id="register-screen">
      <div className="auth-bg-mesh" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(99,102,241,0.05), transparent 50%)'
      }} />
      <div className="auth-bg-orb auth-orb-1" style={{ background: 'rgba(16,185,129,0.06)' }} />
      <div className="auth-bg-orb auth-orb-2" style={{ background: 'rgba(99,102,241,0.04)' }} />

      <div className="auth-header animate-fadeInDown">
        <div className="auth-logo" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))', borderColor: 'rgba(16,185,129,0.15)' }}>
          <GuardianLogo size={32} />
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Set up your Guardian profile</p>

        {/* Progress steps */}
        <div className="register-steps">
          <div className={`register-step ${step >= 1 ? 'active' : ''}`}>
            <div className="register-step-dot">
              {step > 1 ? <CheckCircle size={14} /> : '1'}
            </div>
            <span>Identity</span>
          </div>
          <div className="register-step-line" style={{ background: step >= 2 ? 'var(--accent-green)' : 'var(--glass-border-strong)' }} />
          <div className={`register-step ${step >= 2 ? 'active' : ''}`}>
            <div className="register-step-dot">2</div>
            <span>Security</span>
          </div>
        </div>
      </div>

      <form className="auth-form animate-fadeInUp" onSubmit={step === 1 ? (e) => { e.preventDefault(); nextStep() } : handleSubmit}>
        {error && (
          <div className="auth-error">
            <div className="auth-error-icon">!</div>
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <div key="step1" className="animate-fadeInUp">
            <div className={`auth-input-group ${focused === 'name' ? 'focused' : ''}`} style={{ marginBottom: 14 }}>
              <div className="auth-input-icon"><User size={17} /></div>
              <input type="text" placeholder="Full name" value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                className="auth-input" id="register-name" autoComplete="name"
              />
              <div className="auth-input-highlight" />
            </div>
            <div className={`auth-input-group ${focused === 'email' ? 'focused' : ''}`}>
              <div className="auth-input-icon"><Mail size={17} /></div>
              <input type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                className="auth-input" id="register-email" autoComplete="email"
              />
              <div className="auth-input-highlight" />
            </div>
          </div>
        ) : (
          <div key="step2" className="animate-fadeInUp">
            <div className={`auth-input-group ${focused === 'phone' ? 'focused' : ''}`} style={{ marginBottom: 14 }}>
              <div className="auth-input-icon"><Phone size={17} /></div>
              <input type="tel" placeholder="Phone number" value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                className="auth-input" id="register-phone" autoComplete="tel"
              />
              <div className="auth-input-highlight" />
            </div>
            <div className={`auth-input-group ${focused === 'password' ? 'focused' : ''}`}>
              <div className="auth-input-icon"><Lock size={17} /></div>
              <input type={showPass ? 'text' : 'password'} placeholder="Create password (min 6 chars)" value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                className="auth-input" id="register-password" autoComplete="new-password"
              />
              <button type="button" className="auth-input-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              <div className="auth-input-highlight" />
            </div>
          </div>
        )}

        <button type="submit" className="auth-submit" disabled={loading}
          style={{ background: 'var(--gradient-blue)' }} id="register-submit"
        >
          {loading ? <Loader2 size={20} className="auth-spinner" /> : (
            <>{step === 1 ? 'Continue' : 'Create Account'} <ArrowRight size={17} /></>
          )}
        </button>

        {step === 2 && (
          <button type="button" className="btn btn-ghost btn-full" onClick={() => { setStep(1); setError('') }}>
            Back
          </button>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>

      <style>{`
        .register-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-top: 28px;
        }
        .register-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .register-step span {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          transition: color 0.3s;
        }
        .register-step.active span {
          color: var(--accent-green);
        }
        .register-step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--glass-bg-strong);
          border: 1.5px solid var(--glass-border-strong);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          transition: all 0.4s;
        }
        .register-step.active .register-step-dot {
          background: rgba(16,185,129,0.12);
          border-color: rgba(16,185,129,0.3);
          color: var(--accent-green);
          box-shadow: 0 0 16px rgba(16,185,129,0.2);
        }
        .register-step-line {
          width: 48px;
          height: 2px;
          border-radius: 2px;
          margin: 0 8px;
          margin-bottom: 20px;
          transition: background 0.5s;
        }
      `}</style>
    </div>
  )
}
