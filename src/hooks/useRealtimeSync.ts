'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useTaskStore } from '../store/useTaskStore'
import { getAuthToken } from '../lib/api'
import type { Task } from '../types'

interface RealtimeEventPayload {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_TOGGLED' | 'TASK_DELETED' | 'TASKS_SYNCED'
  userId: string
  payload: Task | Task[] | string
  timestamp: string
}

export const useRealtimeSync = () => {
  const { isAuthenticated } = useAuthStore()
  const { upsertTaskFromRealtime, deleteTaskFromRealtime, setTasksFromRealtime, fetchTasks } = useTaskStore()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      return
    }

    const token = getAuthToken()
    if (!token) return

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const streamUrl = `${baseUrl}/api/v1/realtime/stream?token=${encodeURIComponent(token)}`

    const connect = () => {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }

        const es = new EventSource(streamUrl)
        eventSourceRef.current = es

        es.addEventListener('TASK_CREATED', (e) => {
          try {
            const data: RealtimeEventPayload = JSON.parse(e.data)
            if (data.payload && typeof data.payload === 'object') {
              upsertTaskFromRealtime(data.payload as Task)
            }
          } catch (_) {}
        })

        es.addEventListener('TASK_UPDATED', (e) => {
          try {
            const data: RealtimeEventPayload = JSON.parse(e.data)
            if (data.payload && typeof data.payload === 'object') {
              upsertTaskFromRealtime(data.payload as Task)
            }
          } catch (_) {}
        })

        es.addEventListener('TASK_TOGGLED', (e) => {
          try {
            const data: RealtimeEventPayload = JSON.parse(e.data)
            if (data.payload && typeof data.payload === 'object') {
              upsertTaskFromRealtime(data.payload as Task)
            }
          } catch (_) {}
        })

        es.addEventListener('TASK_DELETED', (e) => {
          try {
            const data: RealtimeEventPayload = JSON.parse(e.data)
            if (data.payload && typeof data.payload === 'string') {
              deleteTaskFromRealtime(data.payload)
            }
          } catch (_) {}
        })

        es.addEventListener('TASKS_SYNCED', (e) => {
          try {
            const data: RealtimeEventPayload = JSON.parse(e.data)
            if (Array.isArray(data.payload)) {
              setTasksFromRealtime(data.payload as Task[])
            } else {
              fetchTasks()
            }
          } catch (_) {}
        })

        es.onerror = () => {
          es.close()
          eventSourceRef.current = null
          // Exponential backoff reconnect
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = setTimeout(connect, 4000)
        }
      } catch (_) {}
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [isAuthenticated, upsertTaskFromRealtime, deleteTaskFromRealtime, setTasksFromRealtime, fetchTasks])
}
