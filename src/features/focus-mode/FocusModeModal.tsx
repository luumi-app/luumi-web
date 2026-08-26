'use client'

import React, { useEffect, useState } from 'react'
import { useFocusStore, useEnergyStore } from '@/store'
import { useFocusPictureInPicture } from '@/lib/useFocusPictureInPicture'
import { FocusPipWindow } from './FocusPipWindow'
import type { EnergyCondition } from '@/types'
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Check,
  CheckCircle2,
  ArrowRight,
  PictureInPicture,
  Minimize2,
} from 'lucide-react'
import confetti from 'canvas-confetti'

export const FocusModeModal: React.FC = () => {
  const {
    isFocusModalOpen,
    activeTask,
    currentSubtaskIndex,
    secondsRemaining,
    durationSeconds,
    isRunning,
    isCompleted,
    closeFocusMode,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    tick,
    completeCurrentSubtask,
  } = useFocusStore()

  const { currentCheckIn, setDailyEnergy } = useEnergyStore()
  const [postEnergySaved, setPostEnergySaved] = useState(false)

  const {
    isPipActive,
    isSupported: isPipSupported,
    autoPipEnabled,
    pipContainer,
    toggleAutoPip,
    openPip,
    closePip,
  } = useFocusPictureInPicture()

  const handlePostFocusEnergy = (condition: EnergyCondition) => {
    setDailyEnergy(condition, 'Post-focus re-calibration')
    setPostEnergySaved(true)
  }

  // Interval timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning) {
      interval = setInterval(() => {
        tick()
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, tick])

  // Fire confetti on completion
  useEffect(() => {
    if (isCompleted) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#111111', '#52525B', '#A1A1AA', '#E4E4E7'],
        })
      } catch {
        // Fallback
      }
    }
  }, [isCompleted])

  if (!isFocusModalOpen || !activeTask) return null

  const subtasks = activeTask.subTasks || []
  const currentSubtask = subtasks[currentSubtaskIndex]
  const totalSubtasks = subtasks.length

  // Timer format MM:SS
  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Large SVG Circular Ring calculations (360x360)
  const size = 360
  const strokeWidth = 7
  const center = size / 2
  const radius = center - strokeWidth - 8
  const circumference = 2 * Math.PI * radius
  const progressRatio = durationSeconds > 0 ? (durationSeconds - secondsRemaining) / durationSeconds : 0
  const strokeDashoffset = circumference - progressRatio * circumference

  return (
    <>
      {/* Picture-in-Picture Portal Window if active */}
      {isPipActive && pipContainer && (
        <FocusPipWindow container={pipContainer} onClose={closePip} />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FBFBFA]/95 backdrop-blur-md animate-fadeIn text-[#111111]">
        <div className="w-full max-w-lg luumi-card p-6 sm:p-8 border border-[#E4E4E7] shadow-2xl relative">
          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E4E7]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#71717A]">
                Focus Mode
              </span>

              {/* PiP Active Indicator */}
              {isPipActive && (
                <span className="text-[10px] font-mono font-bold text-white bg-[#111111] px-2 py-0.5 rounded-md">
                  POPUP ACTIVE
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Picture-in-Picture Pop-out button */}
              {isPipSupported && (
                <button
                  type="button"
                  onClick={isPipActive ? closePip : openPip}
                  title={isPipActive ? 'Close Floating Popup' : 'Pop out into Floating Mini Window'}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    isPipActive
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#111111] hover:text-[#111111]'
                  }`}
                >
                  {isPipActive ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Dock</span>
                    </>
                  ) : (
                    <>
                      <PictureInPicture className="w-3.5 h-3.5" />
                      <span>Pop Out</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={closeFocusMode}
                className="p-1.5 rounded-lg hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#111111] transition-colors cursor-pointer"
                title="Close Focus Mode"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Completed State with Post-Focus Energy Re-calibration */}
          {isCompleted ? (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-[#111111] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight">
                  Objective Completed!
                </h2>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto mt-1 leading-relaxed">
                  Great job maintaining deep focus through every step.
                </p>
              </div>

              {/* Dynamic Midday / Post-Session Energy Calibration */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A]">
                    Post-Focus Energy Pulse
                  </span>
                  <span className="text-[10px] text-[#A1A1AA]">
                    {postEnergySaved ? '✓ Energy updated' : 'Calibrate next pace'}
                  </span>
                </div>
                <p className="text-xs text-[#111111] font-semibold">
                  How is your focus battery feeling after this session?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePostFocusEnergy('HIGH')}
                    className={`p-2.5 rounded-lg text-center border transition-all cursor-pointer ${
                      currentCheckIn?.condition === 'HIGH'
                        ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                        : 'border-[#E4E4E7] bg-white text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    <span className="text-[11px] font-bold block">● High Focus</span>
                    <span
                      className={`text-[9px] block mt-0.5 ${
                        currentCheckIn?.condition === 'HIGH' ? 'text-zinc-300' : 'text-[#71717A]'
                      }`}
                    >
                      Ready for more
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePostFocusEnergy('MEDIUM')}
                    className={`p-2.5 rounded-lg text-center border transition-all cursor-pointer ${
                      currentCheckIn?.condition === 'MEDIUM'
                        ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                        : 'border-[#E4E4E7] bg-white text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    <span className="text-[11px] font-bold block">◐ Steady</span>
                    <span
                      className={`text-[9px] block mt-0.5 ${
                        currentCheckIn?.condition === 'MEDIUM' ? 'text-zinc-300' : 'text-[#71717A]'
                      }`}
                    >
                      Standard flow
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePostFocusEnergy('LOW')}
                    className={`p-2.5 rounded-lg text-center border transition-all cursor-pointer ${
                      currentCheckIn?.condition === 'LOW'
                        ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                        : 'border-[#E4E4E7] bg-white text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    <span className="text-[11px] font-bold block">○ Restorative</span>
                    <span
                      className={`text-[9px] block mt-0.5 ${
                        currentCheckIn?.condition === 'LOW' ? 'text-zinc-300' : 'text-[#71717A]'
                      }`}
                    >
                      Take lighter pace
                    </span>
                  </button>
                </div>
              </div>

              <button
                onClick={closeFocusMode}
                className="mt-2 w-full max-w-md mx-auto py-2.5 px-6 rounded-xl bg-[#111111] hover:bg-[#27272A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Task Parent Title */}
              <div className="text-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A]">
                  Main Objective
                </span>
                <h1 className="text-sm sm:text-base font-bold text-[#111111] tracking-tight mt-0.5 max-w-md mx-auto line-clamp-2">
                  {activeTask.title}
                </h1>
              </div>

              {/* ENLARGED HERO CIRCLE: Top: Icon-only Play/Pause | Middle: Step Counter + Subtask | Bottom: Countdown */}
              <div className="relative w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                  {/* Background Track */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#E4E4E7"
                    strokeWidth={strokeWidth}
                    fill="#FFFFFF"
                  />
                  {/* Active Rotating Countdown Ring */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#111111"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* Centered Content with Generous Vertical Margins */}
                <div className="absolute inset-0 flex flex-col items-center justify-between py-10 px-6 sm:py-12 sm:px-8 text-center select-none">
                  {/* 1. TOP: Icon-Only Start / Pause Button */}
                  <button
                    type="button"
                    onClick={isRunning ? pauseTimer : startTimer}
                    title={isRunning ? 'Pause' : 'Start Timer'}
                    aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                    className="w-9 h-9 rounded-full border border-[#111111] hover:bg-[#F4F4F5] text-[#111111] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-90 shrink-0"
                  >
                    {isRunning ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* 2. MIDDLE: Minimalist Step Counter (Gray) + Active Subtask Title */}
                  <div className="px-2 max-w-[230px] sm:max-w-[260px] flex flex-col items-center justify-center my-auto">
                    {totalSubtasks > 0 && (
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1.5">
                        Step {currentSubtaskIndex + 1} of {totalSubtasks}
                      </span>
                    )}
                    <h2 className="text-sm sm:text-base font-extrabold text-[#111111] leading-snug line-clamp-3">
                      {currentSubtask ? currentSubtask.title : activeTask.title}
                    </h2>
                  </div>

                  {/* 3. BOTTOM: Countdown Timer Display */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
                        {formattedTime}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRunning ? 'bg-emerald-500 animate-ping' : 'bg-[#A1A1AA]'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] uppercase font-bold text-[#A1A1AA] tracking-wider mt-0.5">
                      {isRunning ? 'Deep Focus' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Big Complete Step & Next Button */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={completeCurrentSubtask}
                  className="w-full max-w-sm flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#111111] hover:bg-[#27272A] text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    {currentSubtaskIndex + 1 === totalSubtasks || totalSubtasks === 0
                      ? 'Complete Objective'
                      : 'Complete Step & Next'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Auxiliary Controls (Reset & Presets + Auto PiP option) */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={resetTimer}
                    title="Reset Timer"
                    className="p-1.5 rounded-xl border border-[#E4E4E7] hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Presets */}
                  <div className="flex items-center gap-1 pl-2 border-l border-[#E4E4E7]">
                    {[15, 25, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setDuration(mins)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          durationSeconds === mins * 60
                            ? 'bg-[#111111] text-white'
                            : 'bg-[#F4F4F5] text-[#71717A] hover:text-[#111111]'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>

                  {/* Auto-PiP on Minimize Toggle */}
                  {isPipSupported && (
                    <button
                      type="button"
                      onClick={toggleAutoPip}
                      title="Automatically pop out when minimizing browser or switching tabs"
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ml-1 ${
                        autoPipEnabled
                          ? 'border-[#111111] bg-[#F4F4F5] text-[#111111]'
                          : 'border-[#E4E4E7] text-[#A1A1AA]'
                      }`}
                    >
                      <PictureInPicture className="w-3 h-3" />
                      <span>Auto pop-out: {autoPipEnabled ? 'On' : 'Off'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
