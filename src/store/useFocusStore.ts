import { create } from 'zustand'
import type { Task } from '../types'
import { useTaskStore } from './useTaskStore'

interface FocusState {
  isFocusModalOpen: boolean
  activeTask: Task | null
  currentSubtaskIndex: number
  durationSeconds: number
  secondsRemaining: number
  isRunning: boolean
  isCompleted: boolean

  openFocusMode: (task: Task, initialDurationMinutes?: number) => void
  closeFocusMode: () => void
  setDuration: (minutes: number) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tick: () => void
  completeCurrentSubtask: () => void
}

export const useFocusStore = create<FocusState>((set, get) => ({
  isFocusModalOpen: false,
  activeTask: null,
  currentSubtaskIndex: 0,
  durationSeconds: 25 * 60,
  secondsRemaining: 25 * 60,
  isRunning: false,
  isCompleted: false,

  openFocusMode: (task: Task, initialDurationMinutes = 25) => {
    // Find first incomplete subtask index if available
    let firstIncomplete = 0
    if (task.subTasks && task.subTasks.length > 0) {
      const idx = task.subTasks.findIndex((st) => !st.isCompleted)
      if (idx >= 0) firstIncomplete = idx
    }

    set({
      isFocusModalOpen: true,
      activeTask: task,
      currentSubtaskIndex: firstIncomplete,
      durationSeconds: initialDurationMinutes * 60,
      secondsRemaining: initialDurationMinutes * 60,
      isRunning: false,
      isCompleted: false,
    })
  },

  closeFocusMode: () => {
    set({
      isFocusModalOpen: false,
      isRunning: false,
    })
  },

  setDuration: (minutes: number) => {
    set({
      durationSeconds: minutes * 60,
      secondsRemaining: minutes * 60,
      isRunning: false,
    })
  },

  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),
  resetTimer: () => set((state) => ({ secondsRemaining: state.durationSeconds, isRunning: false })),

  tick: () => {
    const { secondsRemaining, isRunning } = get()
    if (!isRunning) return
    if (secondsRemaining > 0) {
      set({ secondsRemaining: secondsRemaining - 1 })
    } else {
      set({ isRunning: false })
    }
  },

  completeCurrentSubtask: () => {
    const { activeTask, currentSubtaskIndex } = get()
    if (!activeTask) return

    const subtasks = activeTask.subTasks || []
    if (subtasks.length === 0) {
      // Direct complete parent task
      useTaskStore.getState().toggleTask(activeTask.id)
      set({ isCompleted: true, isRunning: false })
      return
    }

    // Toggle current subtask in task store
    useTaskStore.getState().toggleSubtask(activeTask.id, currentSubtaskIndex)

    // Check if more subtasks remain
    const nextIndex = currentSubtaskIndex + 1
    if (nextIndex < subtasks.length) {
      set({ currentSubtaskIndex: nextIndex })
    } else {
      // All subtasks finished! Auto-complete parent task
      useTaskStore.getState().toggleTask(activeTask.id)
      set({ isCompleted: true, isRunning: false })
    }
  },
}))
