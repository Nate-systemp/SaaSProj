import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const SignUpPage = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '360px' }}>
        <h1>FlowBoard</h1>
        <h2>Create an account</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label><br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
            />
          </div>
          <div>
            <label>Password</label><br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  )
}

export default SignUpPage