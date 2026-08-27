'use client'

import React from 'react'
import type { Task, GenerateTaskAiRequest, EnergyCondition, EnergyLevel } from '@/types'
import { TaskItem, CreateTaskInline } from '@/features/tasks'
import { Inbox, Compass, SlidersHorizontal, Loader2 } from 'lucide-react'
import { sortTasksByEnergy } from '@/lib/energyFilter'

interface UnscheduledViewProps {
  tasks: Task[]
  hiddenCount?: number
  isFilterActive?: boolean
  energyCondition?: EnergyCondition | null
  onToggleOverride?: () => void
  onToggle: (taskId: string) => void
  onSubtaskToggle?: (taskId: string, index: number) => void
  onFocus: (task: Task) => void
  onDelete?: (taskId: string) => void
  onEdit?: (task: Task) => void
  onAddTask: (payload: GenerateTaskAiRequest) => Promise<unknown> | void
  isAiGenerating?: boolean
  generatingGoal?: string | null
}

const ENERGY_SECTIONS: { key: EnergyLevel; label: string; symbol: string }[] = [
  { key: 'AMPLIFY', label: 'Deep', symbol: '●' },
  { key: 'BALANCE', label: 'Steady', symbol: '◐' },
  { key: 'RESTORE', label: 'Light', symbol: '○' },
]

export const UnscheduledView: React.FC<UnscheduledViewProps> = ({
  tasks,
  hiddenCount = 0,
  isFilterActive = false,
  energyCondition = null,
  onToggleOverride,
  onToggle,
  onSubtaskToggle,
  onFocus,
  onDelete,
  onEdit,
  onAddTask,
  isAiGenerating = false,
  generatingGoal = null,
}) => {
  const completedCount = tasks.filter((t) => t.isCompleted).length
  const totalCount = tasks.length

  const sortedTasks = sortTasksByEnergy(tasks)

  // Group sorted tasks into Energy Sections with hairline dividers
  const groupedEnergySections = ENERGY_SECTIONS.map(({ key, label, symbol }) => ({
    key,
    label,
    symbol,
    tasks: sortedTasks.filter((t) => (t.energy || 'BALANCE') === key),
  })).filter((group) => group.tasks.length > 0)

  return (
    <div className="space-y-6 animate-smooth-fade">
      {/* Header Info */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#111111]" />
            <h2 className="text-sm font-bold text-[#111111] tracking-tight">
              Anytime & Unscheduled
            </h2>
          </div>
          <p className="text-xs text-[#71717A] mt-0.5">
            Flexible tasks without a scheduled date, organized by energy intensity.
          </p>
        </div>

        <div className="text-xs text-[#71717A] font-medium shrink-0">
          {totalCount > 0 ? (
            <span>
              <strong className="text-[#111111]">{completedCount}</strong> of{' '}
              <strong className="text-[#111111]">{totalCount}</strong> done
            </span>
          ) : (
            <span>0 tasks</span>
          )}
        </div>
      </div>

      {/* Energy Filter Active Info Banner */}
      {hiddenCount > 0 && isFilterActive && onToggleOverride && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-2xs text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#111111]" />
            <span className="text-[#52525B] font-medium">
              {energyCondition === 'LOW'
                ? `Light Filter: Showing Light tasks only (${hiddenCount} hidden)`
                : `Steady Filter: Showing Steady & Light tasks (${hiddenCount} hidden)`}
            </span>
          </div>
          <button
            onClick={onToggleOverride}
            className="text-[11px] font-bold text-[#111111] hover:underline cursor-pointer"
          >
            Show all ({tasks.length + hiddenCount})
          </button>
        </div>
      )}

      {/* Inline Fast Add (Dateless by default) */}
      <CreateTaskInline
        selectedDate={null}
        onSubmit={onAddTask}
        placeholderText="Add an unscheduled / anytime task..."
      />

      {/* Inline Loading Card When Decomposition is Generating */}
      {isAiGenerating && (
        <div className="luumi-card p-4 rounded-2xl border border-[#E4E4E7] bg-[#FFFFFF] shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-[#111111] shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#111111]">
                Structuring objective & steps...
              </h4>
              {generatingGoal && (
                <p className="text-[11px] text-[#71717A] truncate mt-0.5 font-medium">
                  {generatingGoal}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2 pt-1 border-t border-[#F4F4F5]">
            <div className="h-8 rounded-xl skeleton-shimmer border border-[#E4E4E7]" />
            <div className="h-8 rounded-xl skeleton-shimmer border border-[#E4E4E7]" />
          </div>
        </div>
      )}

      {/* Task List Grouped by Energy with Dividers */}
      {tasks.length === 0 ? (
        <div className="luumi-card p-10 text-center border border-[#E4E4E7] space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#F4F4F5] text-[#71717A] flex items-center justify-center mx-auto mb-2">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#111111]">
            {hiddenCount > 0
              ? 'No unscheduled tasks matching current energy level.'
              : 'No unscheduled tasks.'}
          </p>
          <p className="text-[11px] text-[#71717A] max-w-sm mx-auto">
            {hiddenCount > 0
              ? `${hiddenCount} task(s) require higher energy. Click 'Show all' or add a restorative task.`
              : 'Add tasks here that you want to complete without fixing a specific calendar date.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEnergySections.map((section) => (
            <div key={section.key} className="space-y-2.5">
              {/* Energy Level Divider Header */}
              <div className="flex items-center gap-2 pt-1 pb-0.5">
                <span className="text-xs font-bold text-[#111111]">
                  {section.symbol}
                </span>
                <span className="text-[11px] font-bold text-[#71717A] tracking-wider uppercase">
                  {section.label}
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-mono">
                  ({section.tasks.length})
                </span>
                <div className="h-px bg-[#E4E4E7] flex-1 ml-1" />
              </div>

              {/* Tasks in this Energy Level */}
              <div className="space-y-3">
                {section.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onSubtaskToggle={onSubtaskToggle}
                    onFocus={onFocus}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
