import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UnscheduledView } from './UnscheduledView'
import type { Task } from '../../types'

describe('UnscheduledView', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Deep Refactoring Session',
      energy: 'AMPLIFY',
      timePref: 'ANYTIME',
      isCompleted: false,
      subTasks: [],
    },
    {
      id: 'task-2',
      title: 'Update Dependencies',
      energy: 'BALANCE',
      timePref: 'ANYTIME',
      isCompleted: false,
      subTasks: [],
    },
    {
      id: 'task-3',
      title: 'Read Documentation',
      energy: 'RESTORE',
      timePref: 'ANYTIME',
      isCompleted: false,
      subTasks: [],
    },
  ]

  it('renders energy divider headers separating High, Medium, and Low tasks', () => {
    render(
      <UnscheduledView
        tasks={mockTasks}
        onToggle={vi.fn()}
        onFocus={vi.fn()}
        onAddTask={vi.fn()}
      />
    )

    expect(screen.getByText('Anytime & Unscheduled')).toBeDefined()
    expect(screen.getByText(/^Deep$/i)).toBeDefined()
    expect(screen.getByText(/^Steady$/i)).toBeDefined()
    expect(screen.getByText(/^Light$/i)).toBeDefined()
    expect(screen.getByText('Deep Refactoring Session')).toBeDefined()
    expect(screen.getByText('Update Dependencies')).toBeDefined()
    expect(screen.getByText('Read Documentation')).toBeDefined()
  })
})
