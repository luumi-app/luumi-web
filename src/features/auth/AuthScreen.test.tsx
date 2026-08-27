import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthScreen } from './AuthScreen'
import { useAuthStore } from '../../store/useAuthStore'

describe('AuthScreen', () => {
  it('renders Google sign in button and switches between Sign In and Create Account tabs', () => {
    render(<AuthScreen />)

    expect(screen.getByText('Luumi')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Sign In/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()

    // Switch to Create Account
    const createAccountTab = screen.getByRole('button', { name: /^Create Account$/i })
    fireEvent.click(createAccountTab)

    expect(screen.getByPlaceholderText('e.g. Jane Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Minimum 6 characters')).toBeInTheDocument()
  })

  it('triggers Google login when Continue with Google is clicked', async () => {
    const googleSpy = vi.spyOn(useAuthStore.getState(), 'loginWithGoogle').mockResolvedValue(undefined)

    render(<AuthScreen />)
    const googleBtn = screen.getByRole('button', { name: /Continue with Google/i })
    fireEvent.click(googleBtn)

    // Fill in Google modal
    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'), {
      target: { value: 'Azzam Fathurrahman' },
    })
    fireEvent.change(screen.getByPlaceholderText('your.email@gmail.com'), {
      target: { value: 'azzam@gmail.com' },
    })

    const modalSubmitBtn = screen.getAllByRole('button', { name: /Continue with Google/i })[1]
    fireEvent.click(modalSubmitBtn)

    expect(googleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'azzam@gmail.com',
        fullName: 'Azzam Fathurrahman',
      })
    )
  })

  it('triggers local login on form submission', async () => {
    const loginSpy = vi.spyOn(useAuthStore.getState(), 'login').mockResolvedValue(undefined)

    render(<AuthScreen />)
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'azzam@luumi.app' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'secretPass123' },
    })

    const buttons = screen.getAllByRole('button', { name: /Sign In/i })
    const submitBtn = buttons[buttons.length - 1]
    fireEvent.click(submitBtn)

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'azzam@luumi.app',
      password: 'secretPass123',
    })
  })

  it('triggers register on form submission when on Create Account tab', async () => {
    const registerSpy = vi.spyOn(useAuthStore.getState(), 'register').mockResolvedValue(undefined)

    render(<AuthScreen />)
    const createAccountTab = screen.getByRole('button', { name: /^Create Account$/i })
    fireEvent.click(createAccountTab)

    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'), {
      target: { value: 'Azzam Fathurrahman' },
    })
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'azzam.new@luumi.app' },
    })
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), {
      target: { value: 'password123' },
    })

    const buttons = screen.getAllByRole('button', { name: /Create Account/i })
    const submitBtn = buttons[buttons.length - 1]
    fireEvent.click(submitBtn)

    expect(registerSpy).toHaveBeenCalledWith({
      fullName: 'Azzam Fathurrahman',
      email: 'azzam.new@luumi.app',
      password: 'password123',
    })
  })
})
