import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditTaskModal } from './EditTaskModal'
import type { Task } from '../../types'

describe('EditTaskModal', () => {
  const mockTask: Task = {
    id: 'task-123',
    title: 'Deploy to Kubernetes',
    energy: 'AMPLIFY',
    timePref: 'MORNING',
    targetDate: '2026-08-26',
    isCompleted: false,
    subTasks: [
      { id: 'st-1', title: 'Prepare Helm charts', isCompleted: false },
      { id: 'st-2', title: 'Run dry run', isCompleted: false },
    ],
  }

  it('renders form pre-filled with task data and submits edited values', () => {
    const handleSave = vi.fn()
    const handleClose = vi.fn()

    render(
      <EditTaskModal
        task={mockTask}
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
      />
    )

    expect(screen.getByText('Edit Task Details')).toBeDefined()
    expect(screen.getByDisplayValue('Deploy to Kubernetes')).toBeDefined()
    expect(screen.getByDisplayValue('Prepare Helm charts')).toBeDefined()
    expect(screen.getByDisplayValue('Run dry run')).toBeDefined()

    // Change title
    const titleInput = screen.getByPlaceholderText('What do you want to accomplish?')
    fireEvent.change(titleInput, { target: { value: 'Deploy to Cloud Cluster' } })

    // Change energy to Steady (BALANCE)
    fireEvent.click(screen.getByText(/◐ Steady/i))

    // Click Save Changes
    fireEvent.click(screen.getByText(/Save Changes/i))

    expect(handleSave).toHaveBeenCalledWith('task-123', {
      title: 'Deploy to Cloud Cluster',
      energy: 'BALANCE',
      timePref: 'MORNING',
      targetDate: '2026-08-26',
      subTaskTitles: ['Prepare Helm charts', 'Run dry run'],
    })
  })
})
