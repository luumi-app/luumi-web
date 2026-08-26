'use client'

import React, { useState } from 'react'
import type { Task, SubTask, TimePeriod } from '@/types'
import { useTaskStore } from '@/store'
import {
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  Trash2,
  Plus,
  X,
  Edit3,
} from 'lucide-react'

interface TaskItemProps {
  task: Task
  onToggle: (taskId: string) => void
  onSubtaskToggle?: (taskId: string, index: number) => void
  onFocus: (task: Task) => void
  onDelete?: (taskId: string) => void
  onEdit?: (task: Task) => void
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onSubtaskToggle,
  onFocus,
  onDelete,
  onEdit,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  const { updateTaskTimeBlock, addSubtask, removeSubtask } = useTaskStore()

  const completedSubtasks =
    task.subTasks?.filter((st) => st.isCompleted).length || 0
  const totalSubtasks = task.subTasks?.length || 0

  const getEnergyBadge = (energy: string) => {
    switch (energy) {
      case 'AMPLIFY':
        return {
          label: '● Deep',
          classes: 'border-[#111111] bg-[#111111] text-white',
        }
      case 'RESTORE':
        return {
          label: '○ Light',
          classes: 'border-[#D4D4D8] bg-[#FAFAFA] text-[#71717A]',
        }
      case 'BALANCE':
      default:
        return {
          label: '◐ Steady',
          classes: 'border-[#A1A1AA] bg-[#F4F4F5] text-[#18181B]',
        }
    }
  }

  const badge = getEnergyBadge(task.energy)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(task.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(task)
    }
  }

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    addSubtask(task.id, newSubtaskTitle.trim())
    setNewSubtaskTitle('')
    setIsAddingSubtask(false)
  }

  const handleTimeBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTaskTimeBlock(task.id, e.target.value as TimePeriod)
  }

  return (
    <div
      className={`luumi-card p-4.5 rounded-2xl transition-all ${
        task.isCompleted
          ? 'bg-[#FAFAFA] opacity-60 border-[#E4E4E7]'
          : 'bg-[#FFFFFF] hover:border-[#D4D4D8]'
      }`}
    >
      <div className="flex items-start justify-between gap-3.5">
        {/* Checkbox and Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            role="checkbox"
            aria-checked={task.isCompleted}
            onClick={() => onToggle(task.id)}
            className={`mt-0.5 w-5 h-5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
              task.isCompleted
                ? 'bg-[#111111] border-[#111111] text-white'
                : 'border-[#D4D4D8] hover:border-[#111111] bg-white'
            }`}
          >
            {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-semibold tracking-tight transition-all leading-snug ${
                task.isCompleted ? 'line-through text-[#A1A1AA]' : 'text-[#111111]'
              }`}
            >
              {task.title}
            </h3>

            {/* Tags & Quick Controls line */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Minimalist Monochrome Energy Tag */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider border ${badge.classes}`}
              >
                {badge.label}
              </span>

              {/* Quick Time block Selector */}
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-[#71717A] bg-[#F4F4F5] border border-[#E4E4E7]">
                <Clock className="w-3 h-3 text-[#71717A]" />
                <select
                  value={task.timePref || 'ANYTIME'}
                  onChange={handleTimeBlockChange}
                  className="bg-transparent text-[10px] font-semibold text-[#52525B] focus:outline-none cursor-pointer"
                  title="Change time block"
                >
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                  <option value="ANYTIME">Anytime</option>
                </select>
              </div>

              {/* Subtasks Accordion Trigger */}
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-[#52525B] hover:text-[#111111] bg-[#F4F4F5] hover:bg-[#E4E4E7] border border-[#E4E4E7] transition-colors cursor-pointer"
              >
                <span>
                  {completedSubtasks} / {totalSubtasks} steps
                </span>
                {expanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions: Focus Mode, Edit, & Delete Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!task.isCompleted && (
            <button
              onClick={() => onFocus(task)}
              title="Start Focus Mode"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111111] hover:bg-[#27272A] text-white text-[11px] font-bold tracking-wide transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Focus</span>
            </button>
          )}

          {/* Edit Task Button */}
          {onEdit && (
            <button
              aria-label="Edit Task"
              onClick={handleEdit}
              title="Edit Task"
              className="p-1.5 rounded-xl hover:bg-neutral-100 text-[#A1A1AA] hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              aria-label="Delete Task"
              onClick={handleDelete}
              title="Delete Task"
              className="p-1.5 rounded-xl hover:bg-neutral-100 text-[#A1A1AA] hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Subtask List & Quick-Add Editor */}
      {expanded && (
        <div className="mt-3.5 pt-3 border-t border-[#F4F4F5] space-y-1.5 animate-smooth-fade">
          {task.subTasks && task.subTasks.length > 0 ? (
            task.subTasks.map((subtask: SubTask, index: number) => (
              <div
                key={subtask.id || index}
                className={`group flex items-center justify-between gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                  subtask.isCompleted
                    ? 'bg-[#FAFAFA] text-[#A1A1AA]'
                    : 'hover:bg-[#F4F4F5] text-[#3F3F46]'
                }`}
              >
                <div
                  onClick={() =>
                    onSubtaskToggle && onSubtaskToggle(task.id, index)
                  }
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      subtask.isCompleted
                        ? 'bg-[#111111] border-[#111111] text-white'
                        : 'border-[#D4D4D8]'
                    }`}
                  >
                    {subtask.isCompleted && (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    )}
                  </div>
                  <span
                    className={`flex-1 truncate ${
                      subtask.isCompleted ? 'line-through' : ''
                    }`}
                  >
                    {subtask.title}
                  </span>
                </div>

                {/* Delete subtask step button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSubtask(task.id, index)
                  }}
                  title="Remove subtask"
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#A1A1AA] hover:text-red-600 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-[#A1A1AA] italic py-1">
              No steps defined yet.
            </p>
          )}

          {/* Inline Subtask Quick Add */}
          {isAddingSubtask ? (
            <form
              onSubmit={handleAddSubtaskSubmit}
              className="flex items-center gap-2 pt-2 animate-smooth-fade"
            >
              <input
                type="text"
                autoFocus
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Step title (e.g. Draft initial outline)..."
                className="flex-1 text-xs bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#111111] focus:bg-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-bold shadow-2xs hover:bg-[#27272A] cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubtask(false)
                  setNewSubtaskTitle('')
                }}
                className="px-2 py-1.5 text-xs text-[#71717A] hover:text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingSubtask(true)}
              className="inline-flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-[#71717A] hover:text-[#111111] transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add step manually</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
