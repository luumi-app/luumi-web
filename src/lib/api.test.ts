import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api, getAuthToken, setAuthToken, removeAuthToken } from './api'

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('manages auth tokens in localStorage', () => {
    expect(getAuthToken()).toBeNull()
    setAuthToken('bearer-token-123')
    expect(getAuthToken()).toBe('bearer-token-123')
    removeAuthToken()
    expect(getAuthToken()).toBeNull()
  })

  it('attaches Bearer token in Authorization header', async () => {
    setAuthToken('token-abc')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1' }),
    })
    globalThis.fetch = mockFetch

    await api.get('/api/v1/users/me')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/users/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-abc',
        }),
      })
    )
  })

  it('throws descriptive backend message when error occurs', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid credentials' }),
    })

    await expect(api.post('/api/v1/auth/login', {})).rejects.toThrow('Invalid credentials')
  })
})
