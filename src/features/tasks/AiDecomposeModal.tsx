'use client'

import React, { useState, useEffect } from 'react'
import type { GenerateTaskAiRequest, TimePeriod } from '../../types'
import { X, Calendar, Clock, Loader2 } from 'lucide-react'

interface AiDecomposeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: GenerateTaskAiRequest) => Promise<unknown> | void
  selectedDate?: string | null
}

export const AiDecomposeModal: React.FC<AiDecomposeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
}) => {
  const [goal, setGoal] = useState('')
  const [targetDate, setTargetDate] = useState<string>(selectedDate || '')
  const [timePref, setTimePref] = useState<TimePeriod>('ANYTIME')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTargetDate(selectedDate || '')
      setTimePref('ANYTIME')
      setGoal('')
    }
  }, [isOpen, selectedDate])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim()) return

    setIsProcessing(true)
    try {
      await onSubmit({
        goal: goal.trim(),
        targetDate: targetDate ? targetDate : undefined,
        timePref,
      })
      setGoal('')
      setTargetDate('')
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn text-[#111111]">
      <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl p-6 border border-[#E4E4E7] shadow-xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E4E4E7]">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#71717A] uppercase">
              Objective Breakdown
            </span>
            <h2 className="text-lg font-bold text-[#111111] mt-0.5">
              Decompose Goal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#111111] p-1.5 rounded-lg hover:bg-[#F4F4F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isProcessing ? (
          <div className="py-8 space-y-4 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center mx-auto shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">
                Structuring Steps & Energy Profile...
              </h3>
              <p className="text-xs text-[#71717A] max-w-xs mx-auto">
                Analyzing &ldquo;{goal}&rdquo; into structured actionable steps.
              </p>
            </div>

            {/* Skeleton Shimmer Loaders */}
            <div className="space-y-2.5 pt-3">
              <div className="h-11 rounded-xl skeleton-shimmer border border-[#E4E4E7]" />
              <div className="h-11 rounded-xl skeleton-shimmer border border-[#E4E4E7]" />
              <div className="h-11 rounded-xl skeleton-shimmer border border-[#E4E4E7]" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                What objective do you want to accomplish? *
              </label>
              <textarea
                required
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Launch product marketing campaign and coordinate deliverables"
                className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] placeholder-[#A1A1AA] focus:outline-none focus:border-[#111111] focus:bg-[#FFFFFF] transition-all resize-none"
              />
              <p className="text-[11px] text-[#71717A] mt-1.5">
                Subtasks and energy intensity will be structured automatically.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#71717A]" />
                    Target Date
                  </span>
                  <span className="text-[10px] text-[#A1A1AA] font-normal">Optional</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-[#FFFFFF]"
                  />
                  {targetDate && (
                    <button
                      type="button"
                      onClick={() => setTargetDate('')}
                      className="px-2 py-2 text-[10px] bg-[#F4F4F5] rounded-xl text-[#71717A] hover:text-[#111111]"
                      title="Clear date"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                  Time Block
                </label>
                <select
                  value={timePref}
                  onChange={(e) => setTimePref(e.target.value as TimePeriod)}
                  className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-[#FFFFFF]"
                >
                  <option value="ANYTIME">Anytime</option>
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E4E4E7]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#71717A] hover:text-[#111111] rounded-xl hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!goal.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#111111] hover:bg-[#27272A] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40 cursor-pointer"
              >
                <span>Decompose Goal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
