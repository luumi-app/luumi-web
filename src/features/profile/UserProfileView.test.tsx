import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UserProfileView } from './UserProfileView'
import type { Task } from '../../types'

vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'u-1',
      fullName: 'Azzam Fathurrahman',
      email: 'azzam.developer@gmail.com',
      authProvider: 'GOOGLE',
    },
    logout: vi.fn(),
  }),
}))

describe('UserProfileView', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Build Master Architectural Design',
      targetDate: '2026-08-26',
      energy: 'AMPLIFY',
      timePref: 'MORNING',
      isCompleted: true,
      subTasks: [],
    },
  ]

  it('renders user info, energy insights, and triggers onOpenBacklog', () => {
    const handleOpenBacklog = vi.fn()
    render(
      <UserProfileView
        tasks={mockTasks}
        onOpenBacklog={handleOpenBacklog}
        onToggle={vi.fn()}
        onFocus={vi.fn()}
      />
    )

    expect(screen.getByText('Azzam Fathurrahman')).toBeDefined()
    expect(screen.getByText('azzam.developer@gmail.com')).toBeDefined()
    expect(screen.getByText('Master Task Backlog & Archive')).toBeDefined()

    const openBtn = screen.getByText('Open Backlog Archive')
    expect(openBtn).toBeDefined()

    fireEvent.click(openBtn)
    expect(handleOpenBacklog).toHaveBeenCalledTimes(1)
  })
})
