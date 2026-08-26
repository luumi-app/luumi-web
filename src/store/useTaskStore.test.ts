import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTaskStore } from './useTaskStore'
import type { Task } from '../types'

describe('useTaskStore', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      selectedDate: '2026-08-26',
      viewMode: 'DAILY',
      isLoading: false,
      analytics: null,
    })
    vi.restoreAllMocks()
  })

  it('filters tasks strictly for selected date in daily mode', () => {
    const mockTasks: Task[] = [
      {
        id: 't-1',
        title: 'Today Task',
        targetDate: '2026-08-26',
        timePref: 'MORNING',
        energy: 'AMPLIFY',
        isCompleted: false,
        subTasks: [],
      },
      {
        id: 't-2',
        title: 'Tomorrow Task',
        targetDate: '2026-08-27',
        timePref: 'AFTERNOON',
        energy: 'BALANCE',
        isCompleted: false,
        subTasks: [],
      },
      {
        id: 't-3',
        title: 'Unscheduled Task',
        targetDate: undefined,
        timePref: 'ANYTIME',
        energy: 'BALANCE',
        isCompleted: false,
        subTasks: [],
      },
    ]

    useTaskStore.setState({ tasks: mockTasks, selectedDate: '2026-08-26' })

    const dailyTasks = useTaskStore.getState().getDailyTasks()
    expect(dailyTasks).toHaveLength(1)
    expect(dailyTasks[0].title).toBe('Today Task')

    const unscheduled = useTaskStore.getState().getUnscheduledTasks()
    expect(unscheduled).toHaveLength(1)
    expect(unscheduled[0].title).toBe('Unscheduled Task')
  })

  it('supports updating time block, subtasks, and rebalancing tasks', () => {
    const initialTask: Task = {
      id: 'task-1',
      title: 'Initial Task',
      targetDate: '2026-08-26',
      timePref: 'MORNING',
      energy: 'AMPLIFY',
      isCompleted: false,
      subTasks: [{ id: 'st-1', title: 'Step 1', isCompleted: false }],
    }

    useTaskStore.setState({ tasks: [initialTask] })

    // Update time block
    useTaskStore.getState().updateTaskTimeBlock('task-1', 'EVENING')
    expect(useTaskStore.getState().tasks[0].timePref).toBe('EVENING')

    // Add subtask
    useTaskStore.getState().addSubtask('task-1', 'Step 2')
    expect(useTaskStore.getState().tasks[0].subTasks).toHaveLength(2)
    expect(useTaskStore.getState().tasks[0].subTasks[1].title).toBe('Step 2')

    // Remove subtask
    useTaskStore.getState().removeSubtask('task-1', 0)
    expect(useTaskStore.getState().tasks[0].subTasks).toHaveLength(1)
    expect(useTaskStore.getState().tasks[0].subTasks[0].title).toBe('Step 2')

    // Rebalance tasks to Anytime
    useTaskStore.getState().rebalanceTasks(['task-1'])
    expect(useTaskStore.getState().tasks[0].targetDate).toBeNull()
    expect(useTaskStore.getState().tasks[0].timePref).toBe('ANYTIME')
  })
})
