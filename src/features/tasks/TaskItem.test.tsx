import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskItem } from './TaskItem'
import type { Task } from '../../types'

describe('TaskItem Component', () => {
  const mockTask: Task = {
    id: 't-1',
    title: 'Deploy Production Release',
    targetDate: '2026-08-24',
    timePref: 'MORNING',
    energy: 'AMPLIFY',
    isCompleted: false,
    subTasks: [
      { id: 'st-1', title: 'Verify migrations', isCompleted: true },
      { id: 'st-2', title: 'Run smoke test', isCompleted: false },
    ],
  }

  it('renders task title, energy tag, time block, and subtasks counter', () => {
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onFocus={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Deploy Production Release')).toBeInTheDocument()
    expect(screen.getByText(/Deep/i)).toBeInTheDocument()
    expect(screen.getByText(/1 \/ 2 steps/i)).toBeInTheDocument()
  })

  it('triggers onFocus when Focus button is clicked', () => {
    const handleFocus = vi.fn()
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onFocus={handleFocus} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByText(/Focus/i))
    expect(handleFocus).toHaveBeenCalledWith(mockTask)
  })

  it('triggers onDelete when Delete button is clicked', () => {
    const handleDelete = vi.fn()
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onFocus={vi.fn()} onDelete={handleDelete} />)

    const deleteBtn = screen.getByLabelText(/Delete Task/i)
    fireEvent.click(deleteBtn)
    expect(handleDelete).toHaveBeenCalledWith('t-1')
  })
})
