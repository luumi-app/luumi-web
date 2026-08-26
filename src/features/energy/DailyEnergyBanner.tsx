'use client'

import React, { useState } from 'react'
import { useEnergyStore, useAuthStore } from '@/store'
import type { EnergyCondition } from '@/types'
import { BatteryCharging, Sparkles, X, ChevronRight } from 'lucide-react'

export const DailyEnergyBanner: React.FC = () => {
  const { currentCheckIn, setDailyEnergy, openCheckInModal, hasCheckedInToday } = useEnergyStore()
  const { user } = useAuthStore()
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't render if already checked in today or dismissed
  if (hasCheckedInToday() || isDismissed) {
    return null
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.fullName?.split(' ')[0] || 'there'

  const handleSelect = (condition: EnergyCondition) => {
    setDailyEnergy(condition)
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E4E4E7] p-4 sm:p-5 shadow-xs animate-fadeIn relative overflow-hidden">
      {/* Accent Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-zinc-100 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#111111] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              <BatteryCharging className="w-3 h-3" />
              Daily Alignment
            </span>
            <span className="text-xs text-[#71717A] font-medium hidden sm:inline">
              • Calibrate your day
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-[#111111] tracking-tight">
            {getGreeting()}, {firstName}. How is your focus battery today?
          </h2>
          <p className="text-xs text-[#71717A] max-w-xl">
            Select your capacity to tailor your task pace and prevent burnout.
          </p>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-[#A1A1AA] hover:text-[#111111] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
          title="Dismiss for now"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Quick 1-Tap Energy Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 relative z-10">
        <button
          onClick={() => handleSelect('HIGH')}
          className="flex flex-col p-3 rounded-xl border border-[#E4E4E7] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white text-left transition-all group cursor-pointer hover:shadow-2xs active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111111] group-hover:text-black">
              ● Deep
            </span>
            <span className="text-[10px] font-mono font-bold text-[#71717A]">
              100%
            </span>
          </div>
          <span className="text-[11px] text-[#71717A] mt-1 line-clamp-1">
            Deep strategic work & complex focus
          </span>
        </button>

        <button
          onClick={() => handleSelect('MEDIUM')}
          className="flex flex-col p-3 rounded-xl border border-[#E4E4E7] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white text-left transition-all group cursor-pointer hover:shadow-2xs active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111111] group-hover:text-black">
              ◐ Steady
            </span>
            <span className="text-[10px] font-mono font-bold text-[#71717A]">
              70%
            </span>
          </div>
          <span className="text-[11px] text-[#71717A] mt-1 line-clamp-1">
            Standard flow, routine tasks & delivery
          </span>
        </button>

        <button
          onClick={() => handleSelect('LOW')}
          className="flex flex-col p-3 rounded-xl border border-[#E4E4E7] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white text-left transition-all group cursor-pointer hover:shadow-2xs active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111111] group-hover:text-black">
              ○ Light
            </span>
            <span className="text-[10px] font-mono font-bold text-[#71717A]">
              40%
            </span>
          </div>
          <span className="text-[11px] text-[#71717A] mt-1 line-clamp-1">
            Recharging & lightweight essentials
          </span>
        </button>
      </div>

      {/* Footer subtle link */}
      <div className="mt-3 flex items-center justify-end relative z-10">
        <button
          onClick={openCheckInModal}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#71717A] hover:text-[#111111] transition-colors cursor-pointer"
        >
          <span>Add detailed reflection / notes</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
