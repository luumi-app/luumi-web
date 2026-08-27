'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore, useTaskStore, useEnergyStore, useFocusStore } from '@/store'
import { DateNavigator } from './DateNavigator'
import {
  TaskItem,
  CreateTaskInline,
  AiDecomposeModal,
  SmartRebalanceModal,
  EditTaskModal,
} from '@/features/tasks'
import { UnscheduledView } from '@/features/unscheduled'
import { UserProfileView } from '@/features/profile'
import { BacklogArchiveView } from '@/features/backlog'
import { DailyCheckInModal, DailyEnergyBanner } from '@/features/energy'
import { FocusModeModal } from '@/features/focus-mode'
import { filterTasksByEnergy, sortTasksByEnergy } from '@/lib/energyFilter'
import {
  Sparkles,
  Calendar,
  Clock,
  Compass,
  SlidersHorizontal,
  Zap,
} from 'lucide-react'
import type { TimePeriod, Task } from '../../types'

const TIME_BLOCKS: { key: TimePeriod; label: string }[] = [
  { key: 'MORNING', label: 'Morning' },
  { key: 'AFTERNOON', label: 'Afternoon' },
  { key: 'EVENING', label: 'Evening' },
  { key: 'ANYTIME', label: 'Anytime' },
]

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const {
    selectedDate,
    viewMode,
    isLoading,
    setSelectedDate,
    setViewMode,
    fetchTasks,
    createTask,
    updateTask,
    generateAiTask,
    toggleTask,
    deleteTask,
    toggleSubtask,
    getDailyTasks,
    getUnscheduledTasks,
    getBacklogTasks,
  } = useTaskStore()

  const {
    currentCheckIn,
    isCheckInModalOpen,
    openCheckInModal,
    closeCheckInModal,
  } = useEnergyStore()

  const { openFocusMode } = useFocusStore()

  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showAllEnergyOverride, setShowAllEnergyOverride] = useState(false)

  // Fetch tasks on initial load
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // All unfiltered daily, anytime, and backlog tasks
  const allDailyTasks = getDailyTasks()
  const allUnscheduledTasks = getUnscheduledTasks()
  const backlogTasks = getBacklogTasks()

  // Apply energy filtering based on daily check-in (LOW -> only Low, MEDIUM -> Medium & Low, HIGH -> all)
  const activeCondition = currentCheckIn?.condition || null
  const dailyTasks = showAllEnergyOverride
    ? allDailyTasks
    : filterTasksByEnergy(allDailyTasks, activeCondition)
  const hiddenDailyCount = allDailyTasks.length - dailyTasks.length

  const unscheduledTasks = showAllEnergyOverride
    ? allUnscheduledTasks
    : filterTasksByEnergy(allUnscheduledTasks, activeCondition)
  const hiddenUnscheduledCount = allUnscheduledTasks.length - unscheduledTasks.length

  const completedDailyCount = dailyTasks.filter((t) => t.isCompleted).length
  const totalDailyCount = dailyTasks.length

  const groupedDailyTasks = TIME_BLOCKS.map(({ key, label }) => ({
    key,
    label,
    tasks: sortTasksByEnergy(
      dailyTasks.filter((t) => (t.timePref || 'ANYTIME') === key)
    ),
  })).filter((group) => group.tasks.length > 0)

  const getEnergyConditionBadge = () => {
    if (!currentCheckIn) {
      return {
        label: 'Energy: Unset',
        classes: 'border-[#E4E4E7] text-[#71717A]',
      }
    }
    switch (currentCheckIn.condition) {
      case 'HIGH':
        return {
          label: '● Deep',
          classes: 'border-[#111111] bg-[#111111] text-white',
        }
      case 'LOW':
        return {
          label: '○ Light',
          classes: 'border-[#D4D4D8] bg-[#FAFAFA] text-[#71717A]',
        }
      case 'MEDIUM':
      default:
        return {
          label: '◐ Steady',
          classes: 'border-[#A1A1AA] bg-[#F4F4F5] text-[#18181B]',
        }
    }
  }

  const energyBadge = getEnergyConditionBadge()
  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111111] pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E4E4E7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & 2-Tab Main Switcher */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setViewMode('DAILY')}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <img
                src="/logo.png"
                alt="Luumi Logo"
                className="w-8 h-8 rounded-xl object-contain shadow-2xs"
              />
              <span className="font-bold text-base tracking-tight text-[#111111]">
                Luumi
              </span>
            </button>

            {/* Desktop 2-Tab View Mode Switcher: Daily Focus & Anytime */}
            <div className="hidden sm:flex items-center bg-[#F4F4F5] p-1 rounded-xl border border-[#E4E4E7]">
              <button
                onClick={() => setViewMode('DAILY')}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'DAILY'
                    ? 'bg-[#FFFFFF] text-[#111111] shadow-xs'
                    : 'text-[#71717A] hover:text-[#111111]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Daily Focus</span>
              </button>

              <button
                onClick={() => setViewMode('UNSCHEDULED')}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'UNSCHEDULED'
                    ? 'bg-[#FFFFFF] text-[#111111] shadow-xs'
                    : 'text-[#71717A] hover:text-[#111111]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Anytime ({allUnscheduledTasks.length})</span>
              </button>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {/* Daily Energy State Pill */}
            <button
              onClick={openCheckInModal}
              title="Click to change today's energy alignment"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${energyBadge.classes}`}
            >
              {energyBadge.label}
            </button>

            {/* User Profile Avatar Button (Navigates to dedicated Profile & Backlog page) */}
            <button
              onClick={() => setViewMode('PROFILE')}
              title="Open Profile & Energy Rhythm"
              className={`flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-xl border transition-all cursor-pointer ${
                viewMode === 'PROFILE' || viewMode === 'BACKLOG'
                  ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                  : 'border-[#E4E4E7] bg-white text-[#111111] hover:border-[#111111]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                  viewMode === 'PROFILE' || viewMode === 'BACKLOG'
                    ? 'bg-white text-[#111111]'
                    : 'bg-[#111111] text-white'
                }`}
              >
                {userInitial}
              </div>
              <span className="hidden md:inline text-xs font-bold">
                {user?.fullName?.split(' ')[0] || 'Profile'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Morning Ritual / First-Visit 1-Tap Energy Banner */}
        {viewMode !== 'PROFILE' && viewMode !== 'BACKLOG' && <DailyEnergyBanner />}

        {/* Mobile 2-Tab View Switcher */}
        <div className="flex sm:hidden items-center justify-center bg-[#F4F4F5] p-1 rounded-xl border border-[#E4E4E7]">
          <button
            onClick={() => setViewMode('DAILY')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'DAILY'
                ? 'bg-[#FFFFFF] text-[#111111] shadow-xs'
                : 'text-[#71717A]'
            }`}
          >
            Daily Focus
          </button>
          <button
            onClick={() => setViewMode('UNSCHEDULED')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'UNSCHEDULED'
                ? 'bg-[#FFFFFF] text-[#111111] shadow-xs'
                : 'text-[#71717A]'
            }`}
          >
            Anytime ({allUnscheduledTasks.length})
          </button>
          <button
            onClick={() => setViewMode('PROFILE')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'PROFILE' || viewMode === 'BACKLOG'
                ? 'bg-[#FFFFFF] text-[#111111] shadow-xs'
                : 'text-[#71717A]'
            }`}
          >
            Profile
          </button>
        </div>

        {viewMode === 'DAILY' ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Date Navigator Header */}
            <DateNavigator
              selectedDate={selectedDate}
              onDateChange={(date) => setSelectedDate(date)}
            />

            {/* Animated Date Focus Content */}
            <div key={selectedDate} className="space-y-6 animate-smooth-fade">
              {/* Daily Status & Actions Toolbar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs text-[#71717A] font-medium">
                  {totalDailyCount > 0 ? (
                    <span>
                      <strong className="text-[#111111]">
                        {completedDailyCount}
                      </strong>{' '}
                      of{' '}
                      <strong className="text-[#111111]">
                        {totalDailyCount}
                      </strong>{' '}
                      completed
                    </span>
                  ) : (
                    <span>No tasks scheduled for this day</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Smart Rebalance Action Button */}
                  <button
                    onClick={() => setIsRebalanceModalOpen(true)}
                    title="Analyze and balance workload against your energy capacity"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E4E7] bg-white hover:border-[#111111] text-[#52525B] hover:text-[#111111] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#111111]" />
                    <span className="hidden sm:inline">Smart Rebalance</span>
                  </button>

                  {/* Decompose Goal Button */}
                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#111111] hover:bg-[#27272A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Decompose Goal</span>
                  </button>
                </div>
              </div>

              {/* Energy Filter Active Info Banner */}
              {hiddenDailyCount > 0 && !showAllEnergyOverride && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-2xs text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#111111]" />
                    <span className="text-[#52525B] font-medium">
                      {activeCondition === 'LOW'
                        ? `Light Filter: Showing Light tasks only (${hiddenDailyCount} hidden)`
                        : `Steady Filter: Showing Steady & Light tasks (${hiddenDailyCount} hidden)`}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAllEnergyOverride(true)}
                    className="text-[11px] font-bold text-[#111111] hover:underline cursor-pointer"
                  >
                    Show all ({allDailyTasks.length})
                  </button>
                </div>
              )}

              {/* Override Active Banner */}
              {showAllEnergyOverride && activeCondition && activeCondition !== 'HIGH' && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] text-xs animate-fadeIn">
                  <span className="text-[#71717A] text-[11px]">
                    Showing all tasks regardless of daily energy alignment.
                  </span>
                  <button
                    onClick={() => setShowAllEnergyOverride(false)}
                    className="text-[11px] font-bold text-[#111111] hover:underline cursor-pointer"
                  >
                    Re-apply energy filter
                  </button>
                </div>
              )}

              {/* Inline Fast Add (Placed at Top of Daily Focus) */}
              <CreateTaskInline
                selectedDate={selectedDate}
                onSubmit={generateAiTask}
              />

              {/* Daily Task List Grouped by Time Blocks */}
              {isLoading && dailyTasks.length === 0 ? (
                <div className="space-y-3">
                  <div className="h-16 rounded-2xl skeleton-shimmer border border-[#E4E4E7]" />
                  <div className="h-16 rounded-2xl skeleton-shimmer border border-[#E4E4E7]" />
                </div>
              ) : dailyTasks.length === 0 ? (
                <div className="luumi-card p-10 text-center border border-[#E4E4E7] space-y-2">
                  <p className="text-xs font-semibold text-[#111111]">
                    {hiddenDailyCount > 0
                      ? 'No tasks matching your current energy level for this day.'
                      : 'No tasks scheduled for this day.'}
                  </p>
                  <p className="text-[11px] text-[#71717A] max-w-sm mx-auto">
                    {hiddenDailyCount > 0
                      ? `${hiddenDailyCount} task(s) exist on this day but require higher energy. Click 'Show all' above or add a lighter task.`
                      : 'Add an objective above to automatically break it down into actionable subtasks.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedDailyTasks.map((group) => (
                    <div key={group.key} className="space-y-2.5">
                      {/* Time Block Divider Header */}
                      <div className="flex items-center gap-2 pt-1 pb-0.5">
                        <Clock className="w-3 h-3 text-[#71717A]" />
                        <span className="text-[11px] font-bold text-[#71717A] tracking-wider uppercase">
                          {group.label}
                        </span>
                        <span className="text-[10px] text-[#A1A1AA] font-mono">
                          ({group.tasks.length})
                        </span>
                        <div className="h-px bg-[#E4E4E7] flex-1 ml-1" />
                      </div>

                      {/* Tasks in this Time Block */}
                      <div className="space-y-3">
                        {group.tasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onSubtaskToggle={toggleSubtask}
                            onFocus={openFocusMode}
                            onDelete={deleteTask}
                            onEdit={(t) => setEditingTask(t)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'UNSCHEDULED' ? (
          /* Dedicated Anytime / Unscheduled View */
          <UnscheduledView
            tasks={unscheduledTasks}
            hiddenCount={hiddenUnscheduledCount}
            isFilterActive={
              !showAllEnergyOverride &&
              activeCondition !== 'HIGH' &&
              activeCondition !== null
            }
            energyCondition={activeCondition}
            onToggleOverride={() =>
              setShowAllEnergyOverride(!showAllEnergyOverride)
            }
            onToggle={toggleTask}
            onSubtaskToggle={toggleSubtask}
            onFocus={openFocusMode}
            onDelete={deleteTask}
            onEdit={(t) => setEditingTask(t)}
            onAddTask={generateAiTask}
          />
        ) : viewMode === 'PROFILE' ? (
          /* Dedicated User Profile & Energy Rhythm Page (Gateway to Backlog) */
          <UserProfileView
            tasks={backlogTasks}
            onOpenBacklog={() => setViewMode('BACKLOG')}
            onToggle={toggleTask}
            onSubtaskToggle={toggleSubtask}
            onFocus={openFocusMode}
            onDelete={deleteTask}
          />
        ) : (
          /* Dedicated Master Backlog Archive Page (Accessed via Profile) */
          <BacklogArchiveView
            tasks={backlogTasks}
            onBack={() => setViewMode('PROFILE')}
            onToggle={toggleTask}
            onSubtaskToggle={toggleSubtask}
            onFocus={openFocusMode}
            onDelete={deleteTask}
            onEdit={(t) => setEditingTask(t)}
          />
        )}
      </main>

      {/* Modals */}
      <DailyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={closeCheckInModal}
      />

      <AiDecomposeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSubmit={generateAiTask}
        selectedDate={selectedDate}
      />

      <SmartRebalanceModal
        isOpen={isRebalanceModalOpen}
        onClose={() => setIsRebalanceModalOpen(false)}
      />

      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={updateTask}
      />

      <FocusModeModal />
    </div>
  )
}
