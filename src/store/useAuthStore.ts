import { create } from 'zustand'
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GoogleOAuthRequest,
} from '../types'
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  loginWithGoogle: (payload: GoogleOAuthRequest) => Promise<void>
  loadProfile: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getAuthToken(),
  isAuthenticated: !!getAuthToken(),
  isLoading: false,

  login: async (payload: LoginRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/login', payload)
      setAuthToken(response.accessToken)
      set({
        token: response.accessToken,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (payload: RegisterRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/register', payload)
      setAuthToken(response.accessToken)
      set({
        token: response.accessToken,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  loginWithGoogle: async (payload: GoogleOAuthRequest) => {
    set({ isLoading: true })
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/google', payload)
      setAuthToken(response.accessToken)
      set({
        token: response.accessToken,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  loadProfile: async () => {
    const token = getAuthToken()
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false })
      return
    }

    try {
      set({ isLoading: true })
      const user = await api.get<User>('/api/v1/users/me')
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      removeAuthToken()
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  logout: () => {
    removeAuthToken()
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
