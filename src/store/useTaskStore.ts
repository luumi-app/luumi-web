import { create } from 'zustand'
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  GenerateTaskAiRequest,
  TaskAnalytics,
  DashboardViewMode,
  TimePeriod,
} from '../types'
import { api } from '../lib/api'

interface TaskState {
  tasks: Task[]
  selectedDate: string
  viewMode: DashboardViewMode
  isLoading: boolean
  isAiGenerating: boolean
  analytics: TaskAnalytics | null
  setSelectedDate: (date: string) => void
  setViewMode: (mode: DashboardViewMode) => void
  fetchTasks: () => Promise<void>
  createTask: (payload: CreateTaskRequest) => Promise<Task>
  updateTask: (taskId: string, payload: UpdateTaskRequest) => Promise<Task>
  generateAiTask: (payload: GenerateTaskAiRequest) => Promise<Task>
  toggleTask: (taskId: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  updateTaskTimeBlock: (taskId: string, timePref: TimePeriod) => void
  rescheduleTask: (taskId: string, targetDate: string | null) => void
  addSubtask: (taskId: string, title: string) => void
  removeSubtask: (taskId: string, subtaskIndex: number) => void
  rebalanceTasks: (taskIdsToMoveToAnytime: string[]) => void
  toggleSubtask: (taskId: string, subtaskIndex: number) => void
  getDailyTasks: () => Task[]
  getUnscheduledTasks: () => Task[]
  getBacklogTasks: () => Task[]
}

const getTodayString = () => new Date().toISOString().split('T')[0]

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedDate: getTodayString(),
  viewMode: 'DAILY',
  isLoading: false,
  isAiGenerating: false,
  analytics: null,

  setSelectedDate: (date: string) => set({ selectedDate: date }),
  setViewMode: (mode: DashboardViewMode) => set({ viewMode: mode }),

  fetchTasks: async () => {
    set({ isLoading: true })
    try {
      const [tasks, analytics] = await Promise.all([
        api.get<Task[]>('/api/v1/tasks'),
        api.get<TaskAnalytics>('/api/v1/tasks/analytics'),
      ])
      set({ tasks, analytics, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  createTask: async (payload: CreateTaskRequest) => {
    const newTask = await api.post<Task>('/api/v1/tasks', payload)
    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }))
    // Refresh analytics in background
    api
      .get<TaskAnalytics>('/api/v1/tasks/analytics')
      .then((analytics) => set({ analytics }))
      .catch(() => {})
    return newTask
  },

  updateTask: async (taskId: string, payload: UpdateTaskRequest) => {
    const previousTasks = get().tasks
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId) return t
        return {
          ...t,
          title: payload.title !== undefined ? payload.title : t.title,
          targetDate:
            payload.targetDate !== undefined ? payload.targetDate : t.targetDate,
          timePref:
            payload.timePref !== undefined ? payload.timePref : t.timePref,
          energy: payload.energy !== undefined ? payload.energy : t.energy,
          isCompleted:
            payload.isCompleted !== undefined
              ? payload.isCompleted
              : t.isCompleted,
          subTasks: payload.subTaskTitles
            ? payload.subTaskTitles.map((title, i) => ({
                id: `st-${i}-${Date.now()}`,
                title,
                isCompleted: false,
                orderIndex: i + 1,
              }))
            : t.subTasks,
        }
      }),
    }))

    try {
      const updatedTask = await api.put<Task>(
        `/api/v1/tasks/${taskId}`,
        payload
      )
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }))
      api
        .get<TaskAnalytics>('/api/v1/tasks/analytics')
        .then((analytics) => set({ analytics }))
        .catch(() => {})
      return updatedTask
    } catch (error) {
      set({ tasks: previousTasks })
      throw error
    }
  },

  generateAiTask: async (payload: GenerateTaskAiRequest) => {
    set({ isAiGenerating: true })
    try {
      const newTask = await api.post<Task>('/api/v1/tasks/ai-generate', payload)
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isAiGenerating: false,
      }))
      api
        .get<TaskAnalytics>('/api/v1/tasks/analytics')
        .then((analytics) => set({ analytics }))
        .catch(() => {})
      return newTask
    } catch (error) {
      set({ isAiGenerating: false })
      throw error
    }
  },

  toggleTask: async (taskId: string) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }))

    try {
      await api.patch(`/api/v1/tasks/${taskId}/toggle`)
      api
        .get<TaskAnalytics>('/api/v1/tasks/analytics')
        .then((analytics) => set({ analytics }))
        .catch(() => {})
    } catch {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        ),
      }))
    }
  },

  deleteTask: async (taskId: string) => {
    // Optimistically remove from state
    const previousTasks = get().tasks
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }))

    try {
      await api.delete(`/api/v1/tasks/${taskId}`)
      api
        .get<TaskAnalytics>('/api/v1/tasks/analytics')
        .then((analytics) => set({ analytics }))
        .catch(() => {})
    } catch {
      // Revert if failed
      set({ tasks: previousTasks })
    }
  },

  updateTaskTimeBlock: (taskId: string, timePref: TimePeriod) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, timePref } : t)),
    }))
  },

  rescheduleTask: (taskId: string, targetDate: string | null) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, targetDate: targetDate || null } : t
      ),
    }))
  },

  addSubtask: (taskId: string, title: string) => {
    if (!title.trim()) return
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId) return t
        const newSubtask = {
          id: `st-local-${Date.now()}`,
          title: title.trim(),
          isCompleted: false,
          orderIndex: (t.subTasks?.length || 0) + 1,
        }
        return {
          ...t,
          subTasks: [...(t.subTasks || []), newSubtask],
        }
      }),
    }))
  },

  removeSubtask: (taskId: string, subtaskIndex: number) => {
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId || !t.subTasks) return t
        const newSubTasks = t.subTasks.filter((_, i) => i !== subtaskIndex)
        return { ...t, subTasks: newSubTasks }
      }),
    }))
  },

  rebalanceTasks: (taskIdsToMoveToAnytime: string[]) => {
    const idSet = new Set(taskIdsToMoveToAnytime)
    set((state) => ({
      tasks: state.tasks.map((t) =>
        idSet.has(t.id) ? { ...t, targetDate: null, timePref: 'ANYTIME' } : t
      ),
    }))
  },

  toggleSubtask: (taskId: string, subtaskIndex: number) => {
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId || !t.subTasks) return t
        const newSubTasks = [...t.subTasks]
        newSubTasks[subtaskIndex] = {
          ...newSubTasks[subtaskIndex],
          isCompleted: !newSubTasks[subtaskIndex].isCompleted,
        }
        return { ...t, subTasks: newSubTasks }
      }),
    }))
  },

  getDailyTasks: () => {
    const { tasks, selectedDate } = get()
    return tasks.filter((t) => t.targetDate === selectedDate)
  },

  getUnscheduledTasks: () => {
    const { tasks } = get()
    return tasks.filter((t) => !t.targetDate || t.targetDate.trim() === '')
  },

  getBacklogTasks: () => {
    const { tasks } = get()
    return tasks
  },
}))
