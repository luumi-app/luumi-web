import { create } from 'zustand'
import type { EnergyCondition, DailyCheckIn } from '../types'

interface EnergyState {
  currentCheckIn: DailyCheckIn | null
  isCheckInModalOpen: boolean
  openCheckInModal: () => void
  closeCheckInModal: () => void
  setDailyEnergy: (condition: EnergyCondition, note?: string) => void
  hasCheckedInToday: () => boolean
}

const CHECKIN_STORAGE_KEY = 'luumi_daily_checkin'

function getSavedCheckIn(): DailyCheckIn | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CHECKIN_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useEnergyStore = create<EnergyState>((set, get) => ({
  currentCheckIn: getSavedCheckIn(),
  isCheckInModalOpen: false,

  openCheckInModal: () => set({ isCheckInModalOpen: true }),
  closeCheckInModal: () => set({ isCheckInModalOpen: false }),

  setDailyEnergy: (condition: EnergyCondition, note?: string) => {
    const today = new Date().toISOString().split('T')[0]
    const checkIn: DailyCheckIn = {
      date: today,
      condition,
      note,
      checkedInAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(checkIn))
    }

    set({
      currentCheckIn: checkIn,
      isCheckInModalOpen: false,
    })
  },

  hasCheckedInToday: () => {
    const today = new Date().toISOString().split('T')[0]
    const checkIn = get().currentCheckIn
    return checkIn?.date === today
  },
}))
