'use client'

import React from 'react'
import type { Task } from '@/types'
import { useAuthStore } from '@/store'
import {
  LogOut,
  Zap,
  CheckCircle2,
  Clock,
  BatteryCharging,
  FolderArchive,
  ArrowRight,
} from 'lucide-react'

interface UserProfileViewProps {
  tasks: Task[]
  onOpenBacklog: () => void
  onToggle: (taskId: string) => void
  onSubtaskToggle?: (taskId: string, index: number) => void
  onFocus: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  tasks,
  onOpenBacklog,
}) => {
  const { user, logout } = useAuthStore()

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.isCompleted).length
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const amplifyCount = tasks.filter((t) => t.energy === 'AMPLIFY').length
  const balanceCount = tasks.filter((t) => t.energy === 'BALANCE').length
  const restoreCount = tasks.filter((t) => t.energy === 'RESTORE').length

  const firstName = user?.fullName || 'Azzam Fathurrahman'
  const userEmail = user?.email || 'azzam.developer@gmail.com'

  return (
    <div className="space-y-6 animate-smooth-fade">
      {/* 1. User Identity & Account Card */}
      <div className="luumi-card p-6 rounded-2xl bg-white border border-[#E4E4E7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#111111] text-white flex items-center justify-center text-xl font-bold tracking-tight shadow-sm">
            {firstName.charAt(0)}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
              {firstName}
            </h1>
            <p className="text-xs text-[#71717A] mt-0.5">{userEmail}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#A1A1AA]">
              <span>Mindful energy productivity enabled</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#E4E4E7] hover:border-red-500 text-xs font-semibold text-[#71717A] hover:text-red-600 transition-colors cursor-pointer bg-white"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. Energy Rhythm & Focus Insights */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#111111]" />
          <h2 className="text-sm font-bold text-[#111111] tracking-tight">
            Energy Rhythm & Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Completion Rate */}
          <div className="p-4 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Completion Rate
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#111111]" />
            </div>
            <div className="text-2xl font-extrabold text-[#111111] tracking-tight">
              {completionRate}%
            </div>
            <p className="text-[10px] text-[#71717A]">
              {completedTasks} of {totalTasks} total tasks finished
            </p>
          </div>

          {/* Focus Load Intensity */}
          <div className="p-4 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Focus Intensity
              </span>
              <BatteryCharging className="w-4 h-4 text-[#111111]" />
            </div>
            <div className="text-2xl font-extrabold text-[#111111] tracking-tight">
              {amplifyCount}{' '}
              <span className="text-xs font-normal text-[#71717A]">Deep</span> /{' '}
              {balanceCount}{' '}
              <span className="text-xs font-normal text-[#71717A]">Steady</span>
            </div>
            <p className="text-[10px] text-[#71717A]">
              {restoreCount} Light restorative tasks
            </p>
          </div>

          {/* Focus Momentum */}
          <div className="p-4 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Focus Momentum
              </span>
              <Clock className="w-4 h-4 text-[#111111]" />
            </div>
            <div className="text-2xl font-extrabold text-[#111111] tracking-tight">
              {completedTasks * 25}{' '}
              <span className="text-xs font-normal text-[#71717A]">mins</span>
            </div>
            <p className="text-[10px] text-[#71717A]">
              Estimated deep flow time logged
            </p>
          </div>
        </div>
      </div>

      {/* 3. Dedicated Gateway to Master Backlog Archive Page */}
      <div className="p-5 rounded-2xl bg-white border border-[#E4E4E7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] text-[#111111] flex items-center justify-center shrink-0">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#111111] tracking-tight">
                Master Task Backlog & Archive
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F4F5] text-[10px] font-mono font-bold text-[#71717A]">
                {totalTasks} Total
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5 max-w-md">
              View your complete chronological archive structured by month and separated by day.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBacklog}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#111111] hover:bg-[#27272A] text-white transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <span>Open Backlog Archive</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
