'use client'

import React, { useState } from 'react'
import type { Task, EnergyLevel } from '@/types'
import { TaskItem } from '@/features/tasks'
import { sortTasksByEnergy } from '@/lib/energyFilter'
import {
  ArrowLeft,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  FolderArchive,
} from 'lucide-react'

interface BacklogArchiveViewProps {
  tasks: Task[]
  onBack: () => void
  onToggle: (taskId: string) => void
  onSubtaskToggle?: (taskId: string, index: number) => void
  onFocus: (task: Task) => void
  onDelete?: (taskId: string) => void
  onEdit?: (task: Task) => void
}

interface DayGroup {
  dateKey: string
  dateLabel: string
  tasks: Task[]
}

interface MonthGroup {
  monthKey: string
  monthLabel: string
  days: DayGroup[]
  totalTasks: number
}

function formatDayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatMonthLabel(monthKey: string): string {
  if (monthKey === 'UNSCHEDULED') return 'Flexible / Anytime Pool'
  try {
    const [year, month] = monthKey.split('-')
    const d = new Date(Number(year), Number(month) - 1, 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } catch {
    return monthKey
  }
}

function groupTasksByMonthAndDay(tasks: Task[]): MonthGroup[] {
  const monthMap = new Map<string, Map<string, Task[]>>()

  tasks.forEach((task) => {
    let monthKey = 'UNSCHEDULED'
    let dayKey = 'UNSCHEDULED'

    if (task.targetDate && task.targetDate.trim() !== '') {
      dayKey = task.targetDate.trim()
      monthKey = dayKey.substring(0, 7) // 'YYYY-MM'
    }

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, new Map<string, Task[]>())
    }
    const dayMap = monthMap.get(monthKey)!
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, [])
    }
    dayMap.get(dayKey)!.push(task)
  })

  // Sort months descending (newest first, unscheduled at the end)
  const sortedMonthKeys = Array.from(monthMap.keys()).sort((a, b) => {
    if (a === 'UNSCHEDULED') return 1
    if (b === 'UNSCHEDULED') return -1
    return b.localeCompare(a)
  })

  return sortedMonthKeys.map((monthKey) => {
    const dayMap = monthMap.get(monthKey)!
    const sortedDayKeys = Array.from(dayMap.keys()).sort((a, b) => {
      if (a === 'UNSCHEDULED') return 1
      if (b === 'UNSCHEDULED') return -1
      return b.localeCompare(a)
    })

    const days: DayGroup[] = sortedDayKeys.map((dayKey) => ({
      dateKey: dayKey,
      dateLabel:
        dayKey === 'UNSCHEDULED' ? 'Anytime / No Date' : formatDayLabel(dayKey),
      tasks: sortTasksByEnergy(dayMap.get(dayKey)!),
    }))

    const totalTasks = days.reduce((sum, d) => sum + d.tasks.length, 0)

    return {
      monthKey,
      monthLabel: formatMonthLabel(monthKey),
      days,
      totalTasks,
    }
  })
}

export const BacklogArchiveView: React.FC<BacklogArchiveViewProps> = ({
  tasks,
  onBack,
  onToggle,
  onSubtaskToggle,
  onFocus,
  onDelete,
  onEdit,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | 'ALL'>('ALL')
  // Initially all months are hidden (collapsed)
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})

  // Filter tasks by search query and energy filter
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subTasks?.some((st) =>
        st.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesEnergy =
      selectedEnergy === 'ALL' || t.energy === selectedEnergy
    return matchesSearch && matchesEnergy
  })

  // Group filtered tasks by Month -> Day
  const groupedMonths = groupTasksByMonthAndDay(filteredTasks)

  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }))
  }

  return (
    <div className="space-y-6 animate-smooth-fade">
      {/* Header with Back Navigation */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E4E7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-[#E4E4E7] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white text-[#71717A] hover:text-[#111111] transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Back to User Profile"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-[#111111]" />
              <h1 className="text-sm sm:text-base font-bold text-[#111111] tracking-tight">
                Master Task Backlog & Archive
              </h1>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Chronological archive organized by month with daily dividers. Click a month to view tasks.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#71717A] font-medium shrink-0 pl-11 sm:pl-0">
          <span>
            <strong className="text-[#111111]">{filteredTasks.length}</strong> of{' '}
            <strong className="text-[#111111]">{tasks.length}</strong> tasks
          </span>
        </div>
      </div>

      {/* Search & Energy Level Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all backlog tasks and subtasks..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#111111] placeholder-[#A1A1AA] focus:outline-none focus:border-[#111111]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'ALL', label: 'ALL' },
              { key: 'AMPLIFY', label: '● Deep' },
              { key: 'BALANCE', label: '◐ Steady' },
              { key: 'RESTORE', label: '○ Light' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedEnergy(item.key as EnergyLevel | 'ALL')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
                selectedEnergy === item.key
                  ? 'bg-[#111111] text-white shadow-2xs'
                  : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:text-[#111111] hover:border-[#111111]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Groups with Daily Dividers */}
      {groupedMonths.length === 0 ? (
        <div className="luumi-card p-10 text-center border border-[#E4E4E7] space-y-2 animate-smooth-fade">
          <p className="text-xs font-semibold text-[#111111]">
            No tasks match your archive search.
          </p>
          <p className="text-[11px] text-[#71717A]">
            Try clearing your search query or energy filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedMonths.map((month) => {
            const isExpanded = !!expandedMonths[month.monthKey]
            return (
              <div
                key={month.monthKey}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-[#111111] bg-white p-4.5 space-y-4 shadow-sm'
                    : 'border-[#E4E4E7] hover:border-[#D4D4D8] bg-white p-4 shadow-2xs'
                }`}
              >
                {/* Month Header (Click to Expand / Collapse) */}
                <div
                  onClick={() => toggleMonthExpansion(month.monthKey)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isExpanded
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F4F4F5] text-[#71717A]'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111111] tracking-tight">
                        {month.monthLabel}
                      </h3>
                      <span className="text-[10px] text-[#71717A] block font-mono">
                        {month.totalTasks} task{month.totalTasks === 1 ? '' : 's'} archived
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#71717A] hidden sm:inline">
                      {isExpanded ? 'Collapse' : 'View tasks'}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded-lg text-[#71717A] hover:text-[#111111] transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Days within this Month (Smooth Animation when Expanded) */}
                {isExpanded && (
                  <div className="space-y-5 pt-3 border-t border-[#F4F4F5] animate-smooth-fade">
                    {month.days.map((day) => (
                      <div key={day.dateKey} className="space-y-2.5">
                        {/* Daily Divider Header */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A]">
                            {day.dateLabel}
                          </span>
                          <span className="text-[9px] font-mono text-[#A1A1AA]">
                            ({day.tasks.length})
                          </span>
                          <div className="h-px bg-[#E4E4E7] flex-1 ml-1" />
                        </div>

                        {/* Tasks under this Day */}
                        <div className="space-y-2.5">
                          {day.tasks.map((task) => (
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
          })}
        </div>
      )}
    </div>
  )
}
