export type AuthProvider = 'LOCAL' | 'GOOGLE'

export interface User {
  id: string
  email: string
  fullName: string
  authProvider: AuthProvider
  createdAt?: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

export interface GoogleOAuthRequest {
  email: string
  fullName: string
  googleId: string
}

export type EnergyLevel = 'AMPLIFY' | 'BALANCE' | 'RESTORE'
export type TimePeriod = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME'
export type DashboardViewMode = 'DAILY' | 'UNSCHEDULED' | 'PROFILE' | 'BACKLOG'

export interface SubTask {
  id?: string
  title: string
  isCompleted: boolean
  orderIndex?: number
  createdAt?: string
}

export interface Task {
  id: string
  title: string
  targetDate?: string | null
  timePref: TimePeriod
  energy: EnergyLevel
  isCompleted: boolean
  createdAt?: string
  updatedAt?: string
  subTasks: SubTask[]
}

export interface CreateTaskRequest {
  title: string
  targetDate?: string | null
  timePref?: TimePeriod
  energy?: EnergyLevel
  subTaskTitles?: string[]
}

export interface UpdateTaskRequest {
  title?: string
  targetDate?: string | null
  timePref?: TimePeriod
  energy?: EnergyLevel
  isCompleted?: boolean
  subTaskTitles?: string[]
}

export interface GenerateTaskAiRequest {
  goal: string
  targetDate?: string | null
  timePref?: TimePeriod
}

export interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  completionRate: number
  amplifyCount: number
  balanceCount: number
  restoreCount: number
}

export type EnergyCondition = 'HIGH' | 'MEDIUM' | 'LOW'

export interface DailyCheckIn {
  date: string
  condition: EnergyCondition
  note?: string
  checkedInAt: string
}
