import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle } from 'lucide-react'
import '../styles/auth.css'
import Logo from '../components/common/Logo'

const LoginPage = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

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
          <h2>Organize.<br />Ship.<br />Repeat.</h2>
          <p>A workspace for teams who ship fast and stay focused.</p>
        </div>
      </div>

      {/* Right form area */}
      <div className="auth-container">
        <div className="auth-inner">
          <div className="auth-header">
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-subtitle">Welcome back. Enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
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
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading && <span className="auth-spinner" />}
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          </form>

          <p className="auth-footer">
            No account?{' '}
            <Link to="/signup" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage