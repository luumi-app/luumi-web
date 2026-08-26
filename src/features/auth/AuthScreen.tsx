'use client'

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store'
import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from 'lucide-react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: unknown) => void
        }
        oauth2: {
          initTokenClient: (config: unknown) => { requestAccessToken: () => void }
        }
      }
    }
  }
}

export const AuthScreen: React.FC = () => {
  const { login, register, loginWithGoogle, isLoading } = useAuthStore()

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleName, setGoogleName] = useState('')

  // Load Google Identity Services Script if Google Client ID is configured
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId && typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (response.credential) {
                try {
                  const base64Url = response.credential.split('.')[1]
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                  const jsonPayload = decodeURIComponent(
                    atob(base64)
                      .split('')
                      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                      .join('')
                  )
                  const payload = JSON.parse(jsonPayload)
                  await loginWithGoogle({
                    email: payload.email,
                    fullName: payload.name || payload.given_name || 'Google User',
                    googleId: payload.sub,
                  })
                } catch {
                  setError('Failed to process Google sign in.')
                }
              }
            },
          })
        }
      }
      document.body.appendChild(script)
    }
  }, [loginWithGoogle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setError('Please fill in all required fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      if (mode === 'LOGIN') {
        await login({
          email: normalizedEmail,
          password,
        })
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name.')
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.')
          return
        }
        await register({
          fullName: fullName.trim(),
          email: normalizedEmail,
          password,
        })
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Authentication failed. Please check your credentials.')
      }
    }
  }

  const handleGoogleClick = () => {
    setError(null)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    } else {
      setIsGoogleModalOpen(true)
    }
  }

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const normalizedGoogleEmail = googleEmail.trim().toLowerCase()

    if (!normalizedGoogleEmail || !googleName.trim()) {
      setError('Please enter your Google email and name.')
      return
    }

    try {
      await loginWithGoogle({
        email: normalizedGoogleEmail,
        fullName: googleName.trim(),
        googleId: `GOOGLE_${normalizedGoogleEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      })
      setIsGoogleModalOpen(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Google sign in failed.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-4 sm:p-6 text-[#111111] animate-smooth-fade">
      <div className="w-full max-w-md luumi-card p-6 sm:p-8 border border-[#E4E4E7] shadow-sm space-y-5">
        {/* Minimalist Logo & App Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-white flex items-center justify-center mx-auto font-bold text-xl tracking-tight shadow-xs">
            L
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            Luumi
          </h1>
          <p className="text-xs text-[#71717A] max-w-xs mx-auto">
            Energy-aware productivity & distraction-free deep focus.
          </p>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* 1. Prominent Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E4E4E7] bg-white hover:border-[#111111] hover:bg-[#FAFAFA] text-[#111111] text-xs font-semibold tracking-wide transition-all shadow-2xs disabled:opacity-50 cursor-pointer active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px bg-[#E4E4E7] flex-1" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            or continue with email
          </span>
          <div className="h-px bg-[#E4E4E7] flex-1" />
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex items-center bg-[#F4F4F5] p-1 rounded-xl border border-[#E4E4E7]">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN')
              setError(null)
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-white text-[#111111] shadow-2xs'
                : 'text-[#71717A] hover:text-[#111111]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER')
              setError(null)
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-white text-[#111111] shadow-2xs'
                : 'text-[#71717A] hover:text-[#111111]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Local Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name field (Register only) */}
          {mode === 'REGISTER' && (
            <div className="space-y-1.5 animate-smooth-fade">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Azzam Fathurrahman"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] placeholder-[#A1A1AA] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          )}

          {/* Email Address field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] placeholder-[#A1A1AA] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'REGISTER' ? 'Minimum 6 characters' : 'Enter your password'}
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] placeholder-[#A1A1AA] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#111111] p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-[#27272A] disabled:opacity-50 text-white text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{mode === 'LOGIN' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'LOGIN' ? 'Sign In with Email' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#E4E4E7] text-center text-[10px] font-mono text-[#A1A1AA]">
          Direct Database Sync • Secure BCrypt Hash • JWT Bearer
        </div>
      </div>

      {/* Google Account Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 border border-[#E4E4E7] shadow-xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="text-xs font-bold text-[#111111]">Sign in with Google</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="text-[#71717A] hover:text-[#111111] p-1 rounded-lg hover:bg-[#F4F4F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                  Google Account Name
                </label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Azzam Fathurrahman"
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#111111] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                  Google Email
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#111111] font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#111111] hover:bg-[#27272A] text-white text-xs font-bold transition-all cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue with Google</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
