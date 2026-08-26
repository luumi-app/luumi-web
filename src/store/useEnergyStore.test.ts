import { describe, it, expect, beforeEach } from 'vitest'
import { useEnergyStore } from './useEnergyStore'

describe('useEnergyStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useEnergyStore.setState({
      currentCheckIn: null,
      isCheckInModalOpen: false,
    })
  })

  it('records daily check-in with condition and closes modal', () => {
    useEnergyStore.getState().openCheckInModal()
    expect(useEnergyStore.getState().isCheckInModalOpen).toBe(true)

    useEnergyStore.getState().setDailyEnergy('HIGH', 'Feeling focused and rested')

    const state = useEnergyStore.getState()
    expect(state.currentCheckIn?.condition).toBe('HIGH')
    expect(state.currentCheckIn?.note).toBe('Feeling focused and rested')
    expect(state.isCheckInModalOpen).toBe(false)
  })

  it('detects if today check-in is needed', () => {
    expect(useEnergyStore.getState().hasCheckedInToday()).toBe(false)

    useEnergyStore.getState().setDailyEnergy('MEDIUM')
    expect(useEnergyStore.getState().hasCheckedInToday()).toBe(true)
  })
})
