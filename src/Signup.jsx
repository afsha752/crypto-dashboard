import { useState } from 'react'

function Signup({ switchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Could not connect to server.')
    }
  }

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>

      {success ? (
        <div>
          <p>Account created! You can now log in.</p>
          <button onClick={switchToLogin}>Go to Login</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit">Sign Up</button>
        </form>
      )}

      <p>
        Already have an account?{' '}
        <span className="auth-link" onClick={switchToLogin}>
          Login
        </span>
      </p>
    </div>
  )
}

export default Signup