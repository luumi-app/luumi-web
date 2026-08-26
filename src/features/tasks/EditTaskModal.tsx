'use client'

import React, { useState, useEffect } from 'react'
import type { Task, EnergyLevel, TimePeriod, UpdateTaskRequest } from '../../types'
import {
  X,
  Calendar,
  Clock,
  Zap,
  Plus,
  Trash2,
  Check,
  Edit3,
} from 'lucide-react'

interface EditTaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: string, payload: UpdateTaskRequest) => Promise<unknown> | void
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('')
  const [energy, setEnergy] = useState<EnergyLevel>('BALANCE')
  const [timePref, setTimePref] = useState<TimePeriod>('ANYTIME')
  const [targetDate, setTargetDate] = useState<string>('')
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [newSubtaskInput, setNewSubtaskInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setEnergy(task.energy || 'BALANCE')
      setTimePref(task.timePref || 'ANYTIME')
      setTargetDate(task.targetDate || '')
      setSubtasks(task.subTasks?.map((st) => st.title) || [])
      setNewSubtaskInput('')
    }
  }, [task, isOpen])

  if (!isOpen || !task) return null

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskInput.trim()) return
    setSubtasks([...subtasks, newSubtaskInput.trim()])
    setNewSubtaskInput('')
  }

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  const handleSubtaskChange = (index: number, val: string) => {
    const updated = [...subtasks]
    updated[index] = val
    setSubtasks(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSaving(true)
    try {
      const payload: UpdateTaskRequest = {
        title: title.trim(),
        energy,
        timePref,
        targetDate: targetDate.trim() ? targetDate.trim() : null,
        subTaskTitles: subtasks.filter((s) => s.trim() !== ''),
      }
      await onSave(task.id, payload)
      onClose()
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn text-[#111111]">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-[#E4E4E7] shadow-xl relative max-h-[90vh] overflow-y-auto space-y-5 animate-smooth-fade">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#71717A] block">
                Task Editor
              </span>
              <h2 className="text-sm font-bold text-[#111111]">
                Edit Task Details
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to accomplish?"
              className="w-full text-xs font-semibold px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-[#111111] placeholder-[#A1A1AA] focus:outline-none focus:border-[#111111] focus:bg-white transition-all"
            />
          </div>

          {/* Energy Level Selector (Deep, Steady, Light) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
              Energy Demand
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEnergy('AMPLIFY')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  energy === 'AMPLIFY'
                    ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:border-[#111111]'
                }`}
              >
                ● Deep
              </button>
              <button
                type="button"
                onClick={() => setEnergy('BALANCE')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  energy === 'BALANCE'
                    ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:border-[#111111]'
                }`}
              >
                ◐ Steady
              </button>
              <button
                type="button"
                onClick={() => setEnergy('RESTORE')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  energy === 'RESTORE'
                    ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:border-[#111111]'
                }`}
              >
                ○ Light
              </button>
            </div>
          </div>

          {/* Time Block & Target Date in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Time Block */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                Time Block
              </label>
              <div className="relative">
                <select
                  value={timePref}
                  onChange={(e) => setTimePref(e.target.value as TimePeriod)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                  <option value="ANYTIME">Anytime</option>
                </select>
              </div>
            </div>

            {/* Target Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                  Scheduled Date
                </label>
                {targetDate && (
                  <button
                    type="button"
                    onClick={() => setTargetDate('')}
                    className="text-[10px] font-bold text-[#71717A] hover:text-[#111111] hover:underline cursor-pointer"
                  >
                    Clear (Anytime)
                  </button>
                )}
              </div>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-white transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                Actionable Steps ({subtasks.length})
              </label>
            </div>

            {/* Subtasks List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {subtasks.map((subtaskTitle, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]"
                >
                  <span className="text-[10px] font-mono font-bold text-[#A1A1AA] pl-1.5 w-5">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    className="flex-1 text-xs text-[#111111] bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="p-1 text-[#A1A1AA] hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove step"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Subtask Input */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubtask(e)
                  }
                }}
                placeholder="Add a step and press Enter..."
                className="flex-1 text-xs px-3 py-2 bg-white border border-[#E4E4E7] rounded-xl text-[#111111] placeholder-[#A1A1AA] focus:outline-none focus:border-[#111111]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#111111] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E4E4E7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#71717A] hover:text-[#111111] rounded-xl hover:bg-[#F4F4F5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#111111] hover:bg-[#27272A] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
