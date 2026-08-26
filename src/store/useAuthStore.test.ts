import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './useAuthStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
    vi.restoreAllMocks()
  })

  it('authenticates with email and password via login', async () => {
    const mockUser = {
      id: '123',
      email: 'azzam@luumi.app',
      fullName: 'Azzam Fathurrahman',
      authProvider: 'LOCAL' as const,
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'mock-jwt-token',
        tokenType: 'Bearer',
        user: mockUser,
      }),
    })

    await useAuthStore.getState().login({
      email: 'azzam@luumi.app',
      password: 'password123',
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe('mock-jwt-token')
  })

  it('registers a new account via register', async () => {
    const mockUser = {
      id: '456',
      email: 'newuser@luumi.app',
      fullName: 'New User',
      authProvider: 'LOCAL' as const,
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'mock-reg-token',
        tokenType: 'Bearer',
        user: mockUser,
      }),
    })

    await useAuthStore.getState().register({
      fullName: 'New User',
      email: 'newuser@luumi.app',
      password: 'password123',
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe('mock-reg-token')
  })

  it('clears state on logout', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'test@luumi.app', fullName: 'Test', authProvider: 'LOCAL' },
      token: 'jwt-token',
      isAuthenticated: true,
    })

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
  })
})
