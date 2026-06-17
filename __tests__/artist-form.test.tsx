import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToastContext } from '@/context/toast'
import ArtistProfileForm from '@/app/profile/artist/artist-form'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

function renderWithToast(setToast = vi.fn()) {
  const { container } = render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <ArtistProfileForm />
    </ToastContext.Provider>
  )
  return { container, setToast }
}

describe('ArtistProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders all form sections', () => {
    renderWithToast()
    expect(screen.getByText('Location')).toBeDefined()
    expect(screen.getByText('About You')).toBeDefined()
    expect(screen.getByText('Social')).toBeDefined()
  })

  it('renders required fields', () => {
    renderWithToast()
    expect(screen.getByPlaceholderText('Full Name')).toBeDefined()
    expect(screen.getByPlaceholderText('Contact Email')).toBeDefined()
    expect(screen.getByPlaceholderText('Artist Name')).toBeDefined()
    expect(screen.getByPlaceholderText('City')).toBeDefined()
  })

  it('renders submit button with correct initial label', () => {
    renderWithToast()
    expect(screen.getByRole('button', { name: 'Create Profile' })).toBeDefined()
  })

  it('posts form data as JSON to /api/profile/artist', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    const { container } = renderWithToast()

    fireEvent.change(screen.getByPlaceholderText('Artist Name'), {
      target: { value: 'My Band' },
    })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile/artist',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })
  })

  it('shows success toast and redirects on successful submit', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    const { container, setToast } = renderWithToast()

    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: 'Profile created successfully',
        type: 'success',
      })
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })
  })

  it('shows API error message in toast on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Profile already exists' }),
    })
    const { container, setToast } = renderWithToast()

    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: 'Profile already exists',
        type: 'error',
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('shows default error message when API returns no error string', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })
    const { container, setToast } = renderWithToast()

    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: 'Failed to create profile',
        type: 'error',
      })
    })
  })

  it('shows error toast when fetch throws a network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const { container, setToast } = renderWithToast()

    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })
  })

  it('disables submit button and shows pending label during submission', async () => {
    // fetch never resolves — keeps the form in pending state
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}))
    const { container } = renderWithToast()

    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      const button = screen.getByRole('button', { name: 'Creating Profile...' })
      expect(button).toBeDefined()
      expect(button.hasAttribute('disabled')).toBe(true)
    })
  })
})
