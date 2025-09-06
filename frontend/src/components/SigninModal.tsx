import { useState } from 'react'
import { API_BASE_URL } from '../services/config'

export default function SigninModal() {
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
      const res = await fetch(`${API_BASE_URL}/auth/signin`, {
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
      // Save JWT as session cookie and email for display
      if (json?.token) {
        document.cookie = `auth_token=${json.token}; path=/; samesite=lax`
      }
      if (json?.user?.email) {
        localStorage.setItem('userEmail', json.user.email)
      }
      // notify app
      window.dispatchEvent(new CustomEvent('auth:changed'))
      setMessage('Anmeldung erfolgreich.')
      // Close the modal
      try {
        const el = document.getElementById('signinModal')
        const anyWin = window as any
        if (el && anyWin?.bootstrap?.Modal) {
          const modal = anyWin.bootstrap.Modal.getOrCreateInstance(el)
          modal.hide()
        } else if (el) {
          // fallback: trigger close button
          const btn = el.querySelector('[data-bs-dismiss="modal"]') as HTMLButtonElement | null
          btn?.click()
        }
      } catch {}
      setPassword('')
      // Reload to fetch user-scoped data (projects/issues)
      setTimeout(() => location.reload(), 150)
    } catch (err: any) {
      setError(err?.message || 'Unbekannter Fehler bei der Anmeldung')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal fade" id="signinModal" tabIndex={-1} aria-labelledby="signinModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title" id="signinModalLabel">Anmelden</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              {message && <div className="alert alert-success" role="alert">{message}</div>}
              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              <div className="mb-3">
                <label htmlFor="signinEmail" className="form-label">Email</label>
                <input
                  id="signinEmail"
                  type="email"
                  className="form-control bg-dark text-white"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="signinPassword" className="form-label">Passwort</label>
                <input
                  id="signinPassword"
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
                {loading ? 'Anmelden…' : 'Anmelden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
