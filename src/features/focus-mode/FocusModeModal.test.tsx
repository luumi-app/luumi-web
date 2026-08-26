import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FocusModeModal } from './FocusModeModal'
import { useFocusStore } from '../../store/useFocusStore'
import type { Task } from '../../types'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))


describe('FocusModeModal (Hero Subtask Focus Circle)', () => {
  const mockTask: Task = {
    id: 't-focus-1',
    title: 'Strategic Planning Session',
    targetDate: '2026-08-24',
    timePref: 'MORNING',
    energy: 'AMPLIFY',
    isCompleted: false,
    subTasks: [
      { id: 'st-1', title: 'Review Q2 OKRs and milestones', isCompleted: false },
      { id: 'st-2', title: 'Draft Q3 Priorities and deliverables', isCompleted: false },
    ],
  }

  it('renders large central hero subtask inside focus ring with top play/pause and bottom countdown', () => {
    useFocusStore.setState({
      isFocusModalOpen: true,
      activeTask: mockTask,
      currentSubtaskIndex: 0,
      secondsRemaining: 1500,
      durationSeconds: 1500,
      isRunning: false,
      isCompleted: false,
    })

    render(<FocusModeModal />)

    expect(screen.getByLabelText(/Start timer/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument()
    expect(screen.getByText('Review Q2 OKRs and milestones')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText(/Complete Step/i)).toBeInTheDocument()
  })

  it('progresses to next subtask when complete button is clicked', () => {
    const completeSpy = vi.spyOn(useFocusStore.getState(), 'completeCurrentSubtask')

    useFocusStore.setState({
      isFocusModalOpen: true,
      activeTask: mockTask,
      currentSubtaskIndex: 0,
      secondsRemaining: 1500,
      durationSeconds: 1500,
      isRunning: false,
      isCompleted: false,
    })

    render(<FocusModeModal />)
    fireEvent.click(screen.getByText(/Complete Step/i))

    expect(completeSpy).toHaveBeenCalled()
  })

  it('renders post-focus energy pulse on completion and updates energy', () => {
    useFocusStore.setState({
      isFocusModalOpen: true,
      activeTask: mockTask,
      currentSubtaskIndex: 0,
      secondsRemaining: 0,
      durationSeconds: 1500,
      isRunning: false,
      isCompleted: true,
    })

    render(<FocusModeModal />)

    expect(screen.getByText(/Objective Completed!/i)).toBeInTheDocument()
    expect(screen.getByText(/Post-Focus Energy Pulse/i)).toBeInTheDocument()
    expect(screen.getByText(/Ready for more/i)).toBeInTheDocument()
  })
})

