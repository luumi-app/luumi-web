'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { AuthScreen, Dashboard } from '@/features'

export default function HomePage() {
  const { isAuthenticated, loadProfile } = useAuthStore()

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return <Dashboard />
}
