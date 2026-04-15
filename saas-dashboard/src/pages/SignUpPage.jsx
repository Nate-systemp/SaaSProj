import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle } from 'lucide-react'
import '../styles/auth.css'
import Logo from '../components/common/Logo'

const SignUpPage = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signUp(email, password, fullName)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <Logo size={32} textColor="#fff" />
        </div>
        <div className="auth-brand-tagline">
          <h2>Start shipping<br />from day one.</h2>
          <p>Join teams who use Vantage to stay on top of everything.</p>
        </div>
      </div>

      {/* Right form area */}
      <div className="auth-container">
        <div className="auth-inner">
          <div className="auth-header">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Set up your workspace in seconds.</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading && <span className="auth-spinner" />}
              {loading ? 'Creating…' : 'Get started'}
            </button>
          </form>

          <p className="auth-footer">
            Have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage