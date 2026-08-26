import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DailyCheckInModal } from './DailyCheckInModal'
import { useEnergyStore } from '../../store/useEnergyStore'

describe('DailyCheckInModal', () => {
  it('renders check-in options when open', () => {
    render(<DailyCheckInModal isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Daily Energy Check-In')).toBeInTheDocument()
    expect(screen.getByText(/\[ ● Deep \]/i)).toBeInTheDocument()
    expect(screen.getByText(/\[ ◐ Steady \]/i)).toBeInTheDocument()
    expect(screen.getByText(/\[ ○ Light \]/i)).toBeInTheDocument()
  })

  it('selects energy condition and saves to store', () => {
    const setDailySpy = vi.spyOn(useEnergyStore.getState(), 'setDailyEnergy')

    render(<DailyCheckInModal isOpen={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText(/\[ ● Deep \]/i))

    expect(setDailySpy).toHaveBeenCalledWith('HIGH', undefined)
  })
})
