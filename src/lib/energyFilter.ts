import type { EnergyCondition, EnergyLevel, Task } from '../types'

export const ENERGY_ORDER: Record<EnergyLevel, number> = {
  AMPLIFY: 1,
  BALANCE: 2,
  RESTORE: 3,
}

/**
 * Determines whether a task's energy level is compatible with the user's current energy condition.
 *
 * Rules:
 * - HIGH (or unset): All tasks (AMPLIFY, BALANCE, RESTORE) are visible.
 * - MEDIUM: Only Medium (BALANCE) and Low (RESTORE) tasks are visible. High (AMPLIFY) tasks are hidden.
 * - LOW: Only Low (RESTORE) tasks are visible. High (AMPLIFY) and Medium (BALANCE) tasks are hidden.
 */
export function isTaskEnergyAllowed(
  taskEnergy?: EnergyLevel | null,
  condition?: EnergyCondition | null
): boolean {
  if (!condition || condition === 'HIGH') {
    return true
  }

  const energy = taskEnergy || 'BALANCE'

  if (condition === 'MEDIUM') {
    return energy === 'BALANCE' || energy === 'RESTORE'
  }

  if (condition === 'LOW') {
    return energy === 'RESTORE'
  }

  return true
}

/**
 * Filters a list of tasks according to the user's energy condition.
 */
export function filterTasksByEnergy(
  tasks: Task[],
  condition?: EnergyCondition | null
): Task[] {
  if (!condition || condition === 'HIGH') {
    return tasks
  }
  return tasks.filter((task) => isTaskEnergyAllowed(task.energy, condition))
}

/**
 * Sorts tasks so that High (AMPLIFY) always appears higher/above Medium (BALANCE) and Low (RESTORE).
 */
export function sortTasksByEnergy(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const rankA = ENERGY_ORDER[a.energy] || 2
    const rankB = ENERGY_ORDER[b.energy] || 2
    return rankA - rankB
  })
}
