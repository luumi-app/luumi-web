'use client'

import React, { useState } from 'react'
import type { EnergyCondition } from '@/types'
import { useEnergyStore } from '@/store'
import { X, Sparkles } from 'lucide-react'

interface DailyCheckInModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({ isOpen, onClose }) => {
  const { setDailyEnergy } = useEnergyStore()
  const [selectedCondition, setSelectedCondition] = useState<EnergyCondition | null>(null)
  const [note, setNote] = useState('')

  if (!isOpen) return null

  const handleSelectCondition = (condition: EnergyCondition) => {
    setSelectedCondition(condition)
    setDailyEnergy(condition, note.trim() || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] w-full max-w-md rounded-2xl p-6 border border-[#E4E4E7] shadow-xl relative text-[#111111]">
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-[#E4E4E7]">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#71717A] uppercase">
              Morning Alignment
            </span>
            <h2 className="text-lg font-bold text-[#111111] mt-0.5">
              Daily Energy Check-In
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#111111] p-1.5 rounded-lg hover:bg-[#F4F4F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#52525B] mb-5 leading-relaxed">
          How is your physical and mental capacity today? Luumi adjusts your focus capacity to prevent burnout.
        </p>

        {/* 3 Minimalist Energy Condition Cards */}
        <div className="space-y-2.5 mb-5">
          {/* DEEP */}
          <button
            onClick={() => handleSelectCondition('HIGH')}
            className="w-full text-left p-3.5 rounded-xl border border-[#E4E4E7] hover:border-[#111111] bg-[#FAFAFA] hover:bg-[#FFFFFF] transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111111]">
                  [ ● Deep ]
                </span>
                <span className="text-[10px] text-[#71717A] font-medium font-mono">100% Capacity</span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">
                Ready for deep strategic work, complex execution, and heavy cognitive focus.
              </p>
            </div>
          </button>

          {/* STEADY */}
          <button
            onClick={() => handleSelectCondition('MEDIUM')}
            className="w-full text-left p-3.5 rounded-xl border border-[#E4E4E7] hover:border-[#111111] bg-[#FAFAFA] hover:bg-[#FFFFFF] transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111111]">
                  [ ◐ Steady ]
                </span>
                <span className="text-[10px] text-[#71717A] font-medium font-mono">70% Capacity</span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">
                Good baseline flow. Ideal for structured delivery, meetings, and routine tasks.
              </p>
            </div>
          </button>

          {/* LIGHT */}
          <button
            onClick={() => handleSelectCondition('LOW')}
            className="w-full text-left p-3.5 rounded-xl border border-[#E4E4E7] hover:border-[#111111] bg-[#FAFAFA] hover:bg-[#FFFFFF] transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111111]">
                  [ ○ Light ]
                </span>
                <span className="text-[10px] text-[#71717A] font-medium font-mono">40% Capacity</span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">
                Low energy or recharging. Focus only on essential, lightweight action items.
              </p>
            </div>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-[11px] text-[#71717A] hover:text-[#111111] font-medium underline underline-offset-4"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
