'use client'

import React, { useState } from 'react'
import { useTaskStore, useEnergyStore } from '@/store'
import type { Task } from '@/types'
import { X, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react'

interface SmartRebalanceModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SmartRebalanceModal: React.FC<SmartRebalanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { getDailyTasks, rebalanceTasks } = useTaskStore()
  const { currentCheckIn } = useEnergyStore()
  const [isApplied, setIsApplied] = useState(false)

  if (!isOpen) return null

  const dailyTasks = getDailyTasks()
  const activeCondition = currentCheckIn?.condition || 'HIGH'

  // Identify overload tasks based on energy condition
  const getTasksToRebalance = (): Task[] => {
    if (activeCondition === 'LOW') {
      // On Low energy, move all AMPLIFY (High) and BALANCE (Medium) tasks to Anytime
      return dailyTasks.filter(
        (t) => (t.energy === 'AMPLIFY' || t.energy === 'BALANCE') && !t.isCompleted
      )
    }
    if (activeCondition === 'MEDIUM') {
      // On Medium energy, move all AMPLIFY (High) tasks to Anytime
      return dailyTasks.filter((t) => t.energy === 'AMPLIFY' && !t.isCompleted)
    }
    // On High energy, check if total uncompleted is > 5
    const pending = dailyTasks.filter((t) => !t.isCompleted)
    if (pending.length > 5) {
      return pending.slice(5)
    }
    return []
  }

  const tasksToRebalance = getTasksToRebalance()
  const tasksToKeep = dailyTasks.filter(
    (t) => !tasksToRebalance.some((r) => r.id === t.id)
  )

  const handleApply = () => {
    const ids = tasksToRebalance.map((t) => t.id)
    rebalanceTasks(ids)
    setIsApplied(true)
    setTimeout(() => {
      setIsApplied(false)
      onClose()
    }, 1200)
  }

  const getReasoningText = () => {
    if (activeCondition === 'LOW') {
      return 'Your daily energy is in Light mode today. To prevent cognitive fatigue and burnout, we recommend moving Deep and Steady tasks to your Anytime pool and focusing only on Light essentials.'
    }
    if (activeCondition === 'MEDIUM') {
      return 'Your daily energy is set to Steady. Moving Deep focus tasks to Anytime keeps your workload aligned with a sustainable, balanced flow today.'
    }
    return 'Your daily workload is calibrated for Deep focus. We can help trim any excess if you want to stay laser-focused.'
  }

  const getDiagnosisLabel = () => {
    if (activeCondition === 'LOW') return 'Light'
    if (activeCondition === 'MEDIUM') return 'Steady'
    return 'Deep'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn text-[#111111]">
      <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl p-6 border border-[#E4E4E7] shadow-xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#71717A] block">
                Energy Intelligence
              </span>
              <h2 className="text-sm font-bold text-[#111111]">
                Smart Pace Rebalancer
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#111111] p-1.5 rounded-lg hover:bg-[#F4F4F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isApplied ? (
          <div className="py-8 text-center space-y-2 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-bold text-[#111111]">
              Workload Rebalanced!
            </h3>
            <p className="text-xs text-[#71717A]">
              Demanding tasks moved to Anytime pool. Your day is now calibrated.
            </p>
          </div>
        ) : (
          <>
            {/* Reasoning Card */}
            <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E4E4E7] space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                <span>Pace Diagnosis: {getDiagnosisLabel()} Energy</span>
              </div>
              <p className="text-[#71717A] leading-relaxed">
                {getReasoningText()}
              </p>
            </div>

            {/* Rebalance Plan Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                <span>Proposed Adjustments</span>
                <span className="text-[11px] font-mono text-[#71717A]">
                  {tasksToRebalance.length} task(s) to move
                </span>
              </div>

              {tasksToRebalance.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-[#E4E4E7] text-center text-xs text-[#71717A]">
                  ✨ Your scheduled tasks are already perfectly balanced for today!
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {tasksToRebalance.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-[#111111] truncate block">
                          {task.title}
                        </span>
                        <span className="text-[10px] text-[#71717A] font-mono">
                          [{task.energy}] • {task.timePref}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#71717A] bg-white border border-[#E4E4E7] px-2 py-1 rounded-lg shrink-0">
                        <span>To Anytime</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E4E4E7]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#71717A] hover:text-[#111111] rounded-xl hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                Close
              </button>
              {tasksToRebalance.length > 0 && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#111111] hover:bg-[#27272A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Smart Rebalance</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
