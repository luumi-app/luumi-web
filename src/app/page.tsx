'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { AuthScreen, Dashboard } from '@/features'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, loadProfile } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    loadProfile()
  }, [loadProfile])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-sm animate-pulse">
          L
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return <Dashboard />
}

