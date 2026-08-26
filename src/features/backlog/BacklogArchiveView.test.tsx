import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BacklogArchiveView } from './BacklogArchiveView'
import type { Task } from '../../types'

describe('BacklogArchiveView', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-aug-1',
      title: 'Setup Database Migrations',
      targetDate: '2026-08-26',
      energy: 'AMPLIFY',
      timePref: 'MORNING',
      isCompleted: true,
      subTasks: [],
    },
    {
      id: 'task-aug-2',
      title: 'Run Integration Tests',
      targetDate: '2026-08-25',
      energy: 'BALANCE',
      timePref: 'AFTERNOON',
      isCompleted: false,
      subTasks: [],
    },
    {
      id: 'task-anytime-3',
      title: 'Read System Architecture Book',
      targetDate: undefined,
      energy: 'RESTORE',
      timePref: 'ANYTIME',
      isCompleted: false,
      subTasks: [],
    },
  ]

  it('renders collapsed months initially and expands tasks on month click', () => {
    const handleBack = vi.fn()
    render(
      <BacklogArchiveView
        tasks={mockTasks}
        onBack={handleBack}
        onToggle={vi.fn()}
        onFocus={vi.fn()}
      />
    )

    expect(screen.getByText('Master Task Backlog & Archive')).toBeDefined()
    expect(screen.getByText('August 2026')).toBeDefined()
    expect(screen.getByText('Flexible / Anytime Pool')).toBeDefined()

    // Tasks are collapsed initially
    expect(screen.queryByText('Setup Database Migrations')).toBeNull()
    expect(screen.queryByText('Read System Architecture Book')).toBeNull()

    // Click on August 2026 month card to expand
    fireEvent.click(screen.getByText('August 2026'))

    // Now August tasks are visible
    expect(screen.getByText('Setup Database Migrations')).toBeDefined()
    expect(screen.getByText('Run Integration Tests')).toBeDefined()

    // Click back button
    fireEvent.click(screen.getByTitle('Back to User Profile'))
    expect(handleBack).toHaveBeenCalledTimes(1)
  })
})
