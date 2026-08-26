import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SmartRebalanceModal } from './SmartRebalanceModal'
import type { Task } from '../../types'

const mockRebalanceTasks = vi.fn()

const mockDailyTasks: Task[] = [
  {
    id: 'heavy-task-1',
    title: 'Design Microservices Cluster',
    energy: 'AMPLIFY',
    timePref: 'MORNING',
    isCompleted: false,
    subTasks: [],
  },
  {
    id: 'light-task-2',
    title: 'Review Inbox & Clear Spam',
    energy: 'RESTORE',
    timePref: 'AFTERNOON',
    isCompleted: false,
    subTasks: [],
  },
]

vi.mock('../../store/useTaskStore', () => ({
  useTaskStore: () => ({
    getDailyTasks: () => mockDailyTasks,
    rebalanceTasks: mockRebalanceTasks,
  }),
}))

vi.mock('../../store/useEnergyStore', () => ({
  useEnergyStore: () => ({
    currentCheckIn: {
      date: '2026-08-26',
      condition: 'LOW',
      checkedInAt: '2026-08-26T10:00:00Z',
    },
  }),
}))

describe('SmartRebalanceModal', () => {
  it('identifies heavy task on LOW energy and allows applying rebalance', () => {
    const handleClose = vi.fn()
    render(
      <SmartRebalanceModal
        isOpen={true}
        onClose={handleClose}
      />
    )

    expect(screen.getByText('Smart Pace Rebalancer')).toBeDefined()
    expect(screen.getByText('Design Microservices Cluster')).toBeDefined()
    expect(screen.getByText('Apply Smart Rebalance')).toBeDefined()

    fireEvent.click(screen.getByText('Apply Smart Rebalance'))
    expect(mockRebalanceTasks).toHaveBeenCalledWith(['heavy-task-1'])
  })
})
