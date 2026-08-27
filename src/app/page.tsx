'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { AuthScreen, Dashboard } from '@/features'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'

export default function HomePage() {
  const { isAuthenticated, loadProfile } = useAuthStore()

  // Activate zero-latency cross-device realtime synchronization
  useRealtimeSync()

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return <Dashboard />
}
