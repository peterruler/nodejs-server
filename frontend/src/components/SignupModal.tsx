import { useState } from 'react'
import { API_BASE_URL } from '../services/config'

export default function SignupModal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!email || !password) {
      setError('Bitte Email und Passwort angeben.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = json?.message || `Fehler: ${res.status}`
        setError(Array.isArray(msg) ? msg.join(', ') : String(msg))
        return
      }
      // Save token for later authenticated requests
      if (json?.token) {
        localStorage.setItem('token', json.token)
      }
      setMessage('Registrierung erfolgreich. Sie können nun fortfahren.')
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setError(err?.message || 'Unbekannter Fehler bei der Registrierung')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal fade" id="signupModal" tabIndex={-1} aria-labelledby="signupModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title" id="signupModalLabel">Registrieren</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              {message && <div className="alert alert-success" role="alert">{message}</div>}
              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              <div className="mb-3">
                <label htmlFor="signupEmail" className="form-label">Email</label>
                <input
                  id="signupEmail"
                  type="email"
                  className="form-control bg-dark text-white"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="signupPassword" className="form-label">Passwort</label>
                <input
                  id="signupPassword"
                  type="password"
                  className="form-control bg-dark text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Schliessen</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registrieren…' : 'Registrieren'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
