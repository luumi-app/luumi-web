import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DailyEnergyBanner } from './DailyEnergyBanner'
import { useEnergyStore } from '../../store/useEnergyStore'
import { useAuthStore } from '../../store/useAuthStore'

describe('DailyEnergyBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    useEnergyStore.setState({
      currentCheckIn: null,
      isCheckInModalOpen: false,
    })
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'azzam@luumi.app',
        fullName: 'Azzam Fathurrahman',
        authProvider: 'GOOGLE',
      },
      token: 'jwt-token',
      isAuthenticated: true,
      isLoading: false,
    })
    vi.restoreAllMocks()
  })

  it('renders 1-tap options when user has not checked in today', () => {
    render(<DailyEnergyBanner />)

    expect(screen.getByText(/How is your focus battery today\?/i)).toBeInTheDocument()
    expect(screen.getByText(/● Deep/i)).toBeInTheDocument()
    expect(screen.getByText(/◐ Steady/i)).toBeInTheDocument()
    expect(screen.getByText(/○ Light/i)).toBeInTheDocument()
  })

  it('sets energy to HIGH on click and disappears', () => {
    const setEnergySpy = vi.spyOn(useEnergyStore.getState(), 'setDailyEnergy')

    render(<DailyEnergyBanner />)
    fireEvent.click(screen.getByText(/● Deep/i))

    expect(setEnergySpy).toHaveBeenCalledWith('HIGH')
  })

  it('hides when user dismisses the banner', () => {
    render(<DailyEnergyBanner />)

    const dismissButton = screen.getByLabelText(/Dismiss banner/i)
    fireEvent.click(dismissButton)

    expect(screen.queryByText(/How is your focus battery today\?/i)).not.toBeInTheDocument()
  })
})
