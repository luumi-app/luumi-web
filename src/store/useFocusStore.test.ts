import { describe, it, expect, beforeEach } from 'vitest'
import { useFocusStore } from './useFocusStore'
import type { Task } from '../types'

describe('useFocusStore', () => {
  const mockTask: Task = {
    id: 't-focus-1',
    title: 'Write Technical Documentation',
    targetDate: '2026-08-24',
    timePref: 'MORNING',
    energy: 'AMPLIFY',
    isCompleted: false,
    subTasks: [
      { id: 'st-1', title: 'Draft API overview', isCompleted: false },
      { id: 'st-2', title: 'Add code examples', isCompleted: false },
    ],
  }

  beforeEach(() => {
    useFocusStore.setState({
      isFocusModalOpen: false,
      activeTask: null,
      currentSubtaskIndex: 0,
      durationSeconds: 1500,
      secondsRemaining: 1500,
      isRunning: false,
      isCompleted: false,
    })
  })

  it('initializes focus mode with target task and first subtask', () => {
    useFocusStore.getState().openFocusMode(mockTask)

    const state = useFocusStore.getState()
    expect(state.isFocusModalOpen).toBe(true)
    expect(state.activeTask?.title).toBe('Write Technical Documentation')
    expect(state.currentSubtaskIndex).toBe(0)
    expect(state.secondsRemaining).toBe(1500)
  })

  it('steps through subtasks sequentially and completes task on final step', () => {
    useFocusStore.getState().openFocusMode(mockTask)

    // Complete first subtask
    useFocusStore.getState().completeCurrentSubtask()
    expect(useFocusStore.getState().currentSubtaskIndex).toBe(1)
    expect(useFocusStore.getState().isCompleted).toBe(false)

    // Complete second (last) subtask
    useFocusStore.getState().completeCurrentSubtask()
    expect(useFocusStore.getState().isCompleted).toBe(true)
    expect(useFocusStore.getState().isRunning).toBe(false)
  })

  it('controls play, pause, and tick of focus timer', () => {
    useFocusStore.getState().openFocusMode(mockTask)
    useFocusStore.getState().startTimer()
    expect(useFocusStore.getState().isRunning).toBe(true)

    useFocusStore.getState().tick()
    expect(useFocusStore.getState().secondsRemaining).toBe(1499)

    useFocusStore.getState().pauseTimer()
    expect(useFocusStore.getState().isRunning).toBe(false)
  })
})
