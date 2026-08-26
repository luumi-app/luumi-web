import { describe, it, expect } from 'vitest'
import {
  isTaskEnergyAllowed,
  filterTasksByEnergy,
  sortTasksByEnergy,
} from './energyFilter'
import type { Task } from '../types'

describe('energyFilter', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-high',
      title: 'Deep Architecture Design',
      energy: 'AMPLIFY',
      timePref: 'MORNING',
      isCompleted: false,
      subTasks: [],
    },
    {
      id: 'task-med',
      title: 'Code Review & Sprint Planning',
      energy: 'BALANCE',
      timePref: 'AFTERNOON',
      isCompleted: false,
      subTasks: [],
    },
    {
      id: 'task-low',
      title: 'Organize Workspace & Read Notes',
      energy: 'RESTORE',
      timePref: 'EVENING',
      isCompleted: false,
      subTasks: [],
    },
  ]

  describe('isTaskEnergyAllowed', () => {
    it('allows all energy levels when condition is HIGH or null', () => {
      expect(isTaskEnergyAllowed('AMPLIFY', 'HIGH')).toBe(true)
      expect(isTaskEnergyAllowed('BALANCE', 'HIGH')).toBe(true)
      expect(isTaskEnergyAllowed('RESTORE', 'HIGH')).toBe(true)
      expect(isTaskEnergyAllowed('AMPLIFY', null)).toBe(true)
    })

    it('allows only Medium (BALANCE) and Low (RESTORE) tasks when condition is MEDIUM', () => {
      expect(isTaskEnergyAllowed('AMPLIFY', 'MEDIUM')).toBe(false)
      expect(isTaskEnergyAllowed('BALANCE', 'MEDIUM')).toBe(true)
      expect(isTaskEnergyAllowed('RESTORE', 'MEDIUM')).toBe(true)
    })

    it('allows ONLY Low (RESTORE) tasks when condition is LOW', () => {
      expect(isTaskEnergyAllowed('AMPLIFY', 'LOW')).toBe(false)
      expect(isTaskEnergyAllowed('BALANCE', 'LOW')).toBe(false)
      expect(isTaskEnergyAllowed('RESTORE', 'LOW')).toBe(true)
    })
  })

  describe('filterTasksByEnergy', () => {
    it('returns all 3 tasks when condition is HIGH', () => {
      const result = filterTasksByEnergy(mockTasks, 'HIGH')
      expect(result).toHaveLength(3)
    })

    it('returns only Medium and Low tasks (2 tasks) when condition is MEDIUM', () => {
      const result = filterTasksByEnergy(mockTasks, 'MEDIUM')
      expect(result).toHaveLength(2)
      expect(result.map((t) => t.id)).toEqual(['task-med', 'task-low'])
      expect(result.some((t) => t.energy === 'AMPLIFY')).toBe(false)
    })

    it('returns only Low task (1 task) when condition is LOW', () => {
      const result = filterTasksByEnergy(mockTasks, 'LOW')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('task-low')
      expect(result[0].energy).toBe('RESTORE')
    })
  })

  describe('sortTasksByEnergy', () => {
    it('always sorts High (AMPLIFY) before Medium (BALANCE) and Low (RESTORE)', () => {
      const shuffled: Task[] = [
        mockTasks[2], // RESTORE (Low)
        mockTasks[0], // AMPLIFY (High)
        mockTasks[1], // BALANCE (Med)
      ]

      const sorted = sortTasksByEnergy(shuffled)
      expect(sorted[0].energy).toBe('AMPLIFY')
      expect(sorted[1].energy).toBe('BALANCE')
      expect(sorted[2].energy).toBe('RESTORE')
    })
  })
})
