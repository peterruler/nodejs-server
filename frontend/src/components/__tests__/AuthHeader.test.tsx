import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../Header'

describe('Auth in Header', () => {
  beforeEach(() => {
    // reset storage
    localStorage.clear()
    // reset jsdom cookies
    document.cookie = 'auth_token=; Max-Age=0; path=/'
    jest.restoreAllMocks()
  })

  test('shows Auth dropdown with Sign in/Sign up when logged out', () => {
    render(<Header />)
    // Auth dropdown exists
    expect(screen.getByText('Auth')).toBeInTheDocument()
    // Menu items are rendered in DOM
    expect(screen.getAllByText('Sign in').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sign up').length).toBeGreaterThan(0)
    // No logged-in email
    expect(screen.queryByText(/Angemeldet als:/)).not.toBeInTheDocument()
  })

  test('shows user email and Sign out when logged in, and performs reload on sign out', async () => {
    localStorage.setItem('userEmail', 'tester@example.com')
    const user = userEvent.setup()

    // mock fetch for signout
    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as any)
    ;(globalThis as any).fetch = fetchMock
    // mock reload
    const reload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      writable: true,
    })

    render(<Header />)

    const loggedInBadges = await screen.findAllByText('Angemeldet als: tester@example.com')
    expect(loggedInBadges.length).toBeGreaterThan(0)

    const authToggle = screen.getByText('Auth')
    await user.click(authToggle)
    const dropdown = authToggle.closest('.dropdown') as HTMLElement
    const signoutBtn = within(dropdown).getByText('Sign out')
    await user.click(signoutBtn)

    expect(fetchMock).toHaveBeenCalled()
    expect(reload).toHaveBeenCalled()
  })

  test('submitting Sign in stores token, email and reloads', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const fakeToken = 'abc.def.ghi'
    const fetchMock = jest.fn().mockImplementation(async (url: any, init?: any) => {
      if (String(url).includes('/auth/signin') && init?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({ token: fakeToken, user: { email: 'login@example.com' } }),
        } as any
      }
      return { ok: true, json: async () => ({}) } as any
    })
    ;(globalThis as any).fetch = fetchMock
    const reload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      writable: true,
    })

    render(<Header />)

    // Open Auth dropdown and click Sign in (modal exists regardless, but emulate user path)
    await user.click(screen.getByText('Auth'))
    const dropdowns = document.querySelectorAll('.dropdown-menu')
    const desktopDropdown = dropdowns[0] as HTMLElement
    const signInLink = within(desktopDropdown).getByText('Sign in')
    await user.click(signInLink)

    // Fill and submit the Sign in form
    const modal = document.getElementById('signinModal') as HTMLElement
    const emailInput = within(modal).getByLabelText('Email') as HTMLInputElement
    const pwInput = within(modal).getByLabelText('Passwort') as HTMLInputElement
    await user.type(emailInput, 'login@example.com')
    await user.type(pwInput, 'password')

    const submitBtn = modal.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(submitBtn).toBeTruthy()
    await user.click(submitBtn)

    // timers for delayed reload
    jest.advanceTimersByTime(200)

    expect(fetchMock).toHaveBeenCalled()
    expect(document.cookie).toMatch(/auth_token=/)
    expect(localStorage.getItem('userEmail')).toBe('login@example.com')
    expect(reload).toHaveBeenCalled()
    jest.useRealTimers()
  })
})
