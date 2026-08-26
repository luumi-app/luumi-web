'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useFocusStore } from '../store/useFocusStore'

interface UseFocusPipReturn {
  isPipActive: boolean
  isSupported: boolean
  autoPipEnabled: boolean
  pipContainer: HTMLElement | null
  toggleAutoPip: () => void
  openPip: () => Promise<void>
  closePip: () => void
}

export function useFocusPictureInPicture(): UseFocusPipReturn {
  const { isFocusModalOpen, isRunning, activeTask } = useFocusStore()
  const [isPipActive, setIsPipActive] = useState(false)
  const [autoPipEnabled, setAutoPipEnabled] = useState(true)
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null)
  const pipWindowRef = useRef<Window | null>(null)

  const isDocumentPipSupported =
    typeof window !== 'undefined' && 'documentPictureInPicture' in window

  const isSupported = isDocumentPipSupported

  const closePip = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close()
      pipWindowRef.current = null
    }
    setPipContainer(null)
    setIsPipActive(false)
  }, [])

  const openPip = useCallback(async () => {
    if (!isDocumentPipSupported) return

    try {
      // Close any existing PiP window
      if (pipWindowRef.current) {
        pipWindowRef.current.close()
      }

      const pipWindow = await (window as unknown as {
        documentPictureInPicture: {
          requestWindow: (options: { width: number; height: number }) => Promise<Window>
        }
      }).documentPictureInPicture.requestWindow({
        width: 350,
        height: 260,
      })

      pipWindowRef.current = pipWindow

      // Copy stylesheets from main document to PiP window
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          const cssRules = Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('')
          const style = document.createElement('style')
          style.textContent = cssRules
          pipWindow.document.head.appendChild(style)
        } catch {
          if (styleSheet.href) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.type = styleSheet.type
            link.href = styleSheet.href
            pipWindow.document.head.appendChild(link)
          }
        }
      })

      // Injected base styling
      pipWindow.document.body.style.margin = '0'
      pipWindow.document.body.style.padding = '0'
      pipWindow.document.body.style.backgroundColor = '#FBFBFA'
      pipWindow.document.title = 'Luumi Focus Mini'

      // Listen for when the user closes the PiP window directly
      pipWindow.addEventListener('pagehide', () => {
        setIsPipActive(false)
        setPipContainer(null)
        pipWindowRef.current = null
      })

      setPipContainer(pipWindow.document.body)
      setIsPipActive(true)
    } catch {
      // Handled if user denies permission or browser cancels
      setIsPipActive(false)
    }
  }, [isDocumentPipSupported])

  // Listen for browser minimize / tab switch (visibilitychange)
  useEffect(() => {
    if (!autoPipEnabled || !isFocusModalOpen || !activeTask) return

    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isPipActive && isDocumentPipSupported) {
        openPip()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [autoPipEnabled, isFocusModalOpen, isRunning, isPipActive, activeTask, isDocumentPipSupported, openPip])

  // Clean up when Focus Mode modal is closed
  useEffect(() => {
    if (!isFocusModalOpen && isPipActive) {
      closePip()
    }
  }, [isFocusModalOpen, isPipActive, closePip])

  const toggleAutoPip = () => setAutoPipEnabled((prev) => !prev)

  return {
    isPipActive,
    isSupported,
    autoPipEnabled,
    pipContainer,
    toggleAutoPip,
    openPip,
    closePip,
  }
}
