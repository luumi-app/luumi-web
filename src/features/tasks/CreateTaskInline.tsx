'use client'

import React, { useState } from 'react'
import type { GenerateTaskAiRequest, TimePeriod } from '../../types'
import { Plus, Clock, Calendar } from 'lucide-react'

interface CreateTaskInlineProps {
  selectedDate?: string | null
  onSubmit: (payload: GenerateTaskAiRequest) => Promise<unknown> | void
  placeholderText?: string
}

export const CreateTaskInline: React.FC<CreateTaskInlineProps> = ({
  selectedDate,
  onSubmit,
  placeholderText = 'Add an objective or task...',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [goal, setGoal] = useState('')
  const [timePref, setTimePref] = useState<TimePeriod>('ANYTIME')
  const [taskDate, setTaskDate] = useState<string>(selectedDate || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim()) return

    const payload: GenerateTaskAiRequest = {
      goal: goal.trim(),
      targetDate: taskDate ? taskDate : undefined,
      timePref,
    }

    setGoal('')
    setIsOpen(false)

    // Trigger AI task generation (which sets isAiGenerating: true and renders unified list loading card)
    onSubmit(payload)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setTaskDate(selectedDate || '')
          setTimePref('ANYTIME')
          setIsOpen(true)
        }}
        className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#E4E4E7] hover:border-[#111111] bg-transparent hover:bg-[#FFFFFF] text-xs font-semibold text-[#71717A] hover:text-[#111111] transition-all flex items-center justify-between cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#111111]" />
          <span>{placeholderText}</span>
        </div>
        <span className="text-[10px] text-[#A1A1AA] font-normal hidden sm:inline">
          Auto-structured into steps
        </span>
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="luumi-card p-4.5 rounded-2xl border border-[#111111] bg-[#FFFFFF] shadow-sm space-y-3.5 animate-fadeIn"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#111111]">
            Add Objective
          </span>
        </div>
        <span className="text-[10px] text-[#71717A]">
          Subtasks & energy structured automatically
        </span>
      </div>

      <input
        type="text"
        required
        autoFocus
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="What do you want to accomplish? (e.g. Prepare project brief & review milestones)"
        className="w-full text-xs font-semibold text-[#111111] placeholder-[#A1A1AA] bg-transparent focus:outline-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F4F4F5]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Optional Date */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#71717A]" />
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="bg-[#F4F4F5] border border-[#E4E4E7] rounded-lg px-2 py-0.5 text-[11px] font-semibold text-[#52525B] focus:outline-none cursor-pointer"
            />
            {taskDate && (
              <button
                type="button"
                onClick={() => setTaskDate('')}
                className="text-[10px] text-[#71717A] hover:text-[#111111] px-1 py-0.5 bg-[#F4F4F5] rounded"
                title="Clear date (make anytime/unscheduled)"
              >
                No Date
              </button>
            )}
          </div>

          {/* Time Block (default: Anytime) */}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#71717A]" />
            <select
              value={timePref}
              onChange={(e) => setTimePref(e.target.value as TimePeriod)}
              className="bg-[#F4F4F5] border border-[#E4E4E7] rounded-lg px-2 py-0.5 text-[11px] font-semibold text-[#52525B] focus:outline-none cursor-pointer"
            >
              <option value="ANYTIME">Anytime</option>
              <option value="MORNING">Morning</option>
              <option value="AFTERNOON">Afternoon</option>
              <option value="EVENING">Evening</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 text-xs font-semibold text-[#71717A] hover:text-[#111111] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!goal.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#111111] hover:bg-[#27272A] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </form>
  )
}
