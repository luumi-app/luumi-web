'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { useFocusStore } from '../../store/useFocusStore'
import {
  Play,
  Pause,
  Check,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Minimize2,
} from 'lucide-react'

interface FocusPipWindowProps {
  container: HTMLElement
  onClose: () => void
}

export const FocusPipWindow: React.FC<FocusPipWindowProps> = ({ container, onClose }) => {
  const {
    activeTask,
    currentSubtaskIndex,
    secondsRemaining,
    durationSeconds,
    isRunning,
    isCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    completeCurrentSubtask,
  } = useFocusStore()

  if (!activeTask) return null

  const subtasks = activeTask.subTasks || []
  const currentSubtask = subtasks[currentSubtaskIndex]
  const totalSubtasks = subtasks.length

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const progressPercent =
    durationSeconds > 0
      ? Math.min(100, Math.round(((durationSeconds - secondsRemaining) / durationSeconds) * 100))
      : 0

  return createPortal(
    <div className="w-full h-full min-h-[250px] bg-[#FBFBFA] text-[#111111] font-sans p-3.5 flex flex-col justify-between select-none box-border">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-[#A1A1AA]'}`} />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#71717A] truncate">
            {activeTask.title}
          </span>
        </div>

        <button
          onClick={onClose}
          title="Return to Main Window"
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#E4E4E7] bg-white hover:border-[#111111] text-[10px] font-bold text-[#52525B] hover:text-[#111111] transition-all cursor-pointer shrink-0 ml-2"
        >
          <Minimize2 className="w-3 h-3" />
          <span>Dock</span>
        </button>
      </div>

      {isCompleted ? (
        <div className="py-4 text-center space-y-2 my-auto animate-fadeIn">
          <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#111111] tracking-tight">
              Objective Completed!
            </h2>
            <p className="text-[10px] text-[#71717A]">
              Great job maintaining deep focus.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-1.5 px-3 rounded-xl bg-[#111111] text-white text-[11px] font-bold cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* Active Subtask & Timer Block */}
          <div className="my-auto py-1 space-y-1.5">
            {/* Step Counter & Subtask Title */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {totalSubtasks > 0 && (
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-[#A1A1AA] block">
                    Step {currentSubtaskIndex + 1} of {totalSubtasks}
                  </span>
                )}
                <h2 className="text-xs sm:text-sm font-extrabold text-[#111111] leading-snug line-clamp-2">
                  {currentSubtask ? currentSubtask.title : activeTask.title}
                </h2>
              </div>

              {/* Countdown Time Display */}
              <div className="text-right shrink-0">
                <div className="font-mono text-xl font-black text-[#111111] tracking-tight leading-none">
                  {formattedTime}
                </div>
                <span className="text-[8px] uppercase font-bold text-[#A1A1AA] tracking-wider block mt-0.5">
                  {isRunning ? 'Focus' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#E4E4E7] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#111111] h-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Bottom Bar: Pilihan Waktu + Controls */}
          <div className="space-y-2 pt-1.5 border-t border-[#E4E4E7]">
            {/* Pilihan Waktu (Duration Presets) */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {[15, 25, 45].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all cursor-pointer ${
                      durationSeconds === mins * 60
                        ? 'bg-[#111111] text-white shadow-2xs'
                        : 'bg-[#F4F4F5] text-[#71717A] hover:text-[#111111]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetTimer}
                  title="Reset Timer"
                  className="p-1 rounded-md border border-[#E4E4E7] hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isRunning ? pauseTimer : startTimer}
                title={isRunning ? 'Pause' : 'Start'}
                className="w-8 h-8 rounded-xl border border-[#111111] hover:bg-[#F4F4F5] text-[#111111] flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                {isRunning ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={completeCurrentSubtask}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#111111] hover:bg-[#27272A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="truncate">
                  {currentSubtaskIndex + 1 === totalSubtasks || totalSubtasks === 0
                    ? 'Complete Objective'
                    : 'Next Step'}
                </span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>,
    container
  )
}
