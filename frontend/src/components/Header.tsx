import { useState } from 'react'
import bugIcon from '../assets/bug-white-32.svg'
import SignupModal from './SignupModal'
import SigninModal from './SigninModal'
import { useEffect } from 'react'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  useEffect(() => {
    const load = () => setUserEmail(localStorage.getItem('userEmail'))
    load()
    const handler = () => load()
    window.addEventListener('auth:changed', handler as EventListener)
    return () => window.removeEventListener('auth:changed', handler as EventListener)
  }, [])

  const handleSignout = async () => {
    try {
      await fetch(`${location.origin.replace(/\/$/, '')}/auth/signout`, { method: 'POST' })
    } catch {}
    // Clear client auth artifacts
    document.cookie = 'auth_token=; Max-Age=0; path=/; samesite=lax'
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setUserEmail(null)
    window.dispatchEvent(new CustomEvent('auth:changed'))
    // Reload to reset UI state
    location.reload()
  }

  return (
    <>
    <header style={{ paddingBottom: '20px' }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-light">
        <div className="container-fluid container">
          <a className="navbar-brand text-white d-flex align-items-center" href="#">
            <img src={bugIcon} alt="Bug Tracker" className="me-2" style={{ width: '32px', height: '32px' }} />
            <span className="title fw-bold">Issue Tracker</span>
          </a>
          <button 
            className="navbar-toggler border-white d-lg-none" 
            type="button" 
            onClick={toggleMenu}
            aria-controls="navbarNavDropdown" 
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* Desktop Menu */}
          <div className="navbar-collapse d-none d-lg-block" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active text-white fw-bold" aria-current="page" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light" href="#about">
                  Über
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light" href="mailto:peter.stroessler@bluewin.ch?subject=todoapp">
                  Kontakt
                </a>
              </li>
            </ul>
            <div className="ms-auto d-flex align-items-center gap-3">
              {userEmail && <span className="text-light small">Angemeldet als: {userEmail}</span>}
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-light" href="#auth" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Auth
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  {!userEmail && (
                    <>
                      <li><a className="dropdown-item" href="#signin" data-bs-toggle="modal" data-bs-target="#signinModal">Sign in</a></li>
                      <li><a className="dropdown-item" href="#signup" data-bs-toggle="modal" data-bs-target="#signupModal">Sign up</a></li>
                    </>
                  )}
                  {userEmail && (
                    <li><button className="dropdown-item" onClick={handleSignout}>Sign out</button></li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''} d-lg-none`}>
        <div className="mobile-menu-content">
          <ul className="navbar-nav text-center">
            <li className="nav-item">
              <a 
                className="nav-link active text-white fw-bold py-3" 
                aria-current="page" 
                href="#"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link text-light py-3" 
                href="#about"
                onClick={() => setIsMenuOpen(false)}
              >
                Über
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link text-light py-3" 
                href="mailto:peter.stroessler@bluewin.ch?subject=todoapp"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </a>
            </li>
            {/* Auth (mobile) */}
            {userEmail && (
              <li className="nav-item">
                <span className="nav-link text-success py-3">Angemeldet als: {userEmail}</span>
              </li>
            )}
            {!userEmail && (
              <>
                <li className="nav-item">
                  <a
                    className="nav-link text-light py-3"
                    href="#signin"
                    data-bs-toggle="modal"
                    data-bs-target="#signinModal"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link text-light py-3"
                    href="#signup"
                    data-bs-toggle="modal"
                    data-bs-target="#signupModal"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </a>
                </li>
              </>
            )}
            {userEmail && (
              <li className="nav-item">
                <button
                  className="nav-link text-light py-3 btn btn-link w-100"
                  onClick={() => { handleSignout(); setIsMenuOpen(false); }}
                >
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
    <SignupModal />
    <SigninModal />
    </>
  )
}

export default Header
