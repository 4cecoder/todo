'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ReactNode, useEffect, useState, useCallback } from 'react'
import { validateConvexUrl } from '@/lib/convex-connection'
import {
  testWebSocketConnection,
  getNetworkInfo,
  runConnectionDiagnostics,
  type WebSocketHealthResult,
} from '@/lib/websocket-health'

interface ConvexClientWrapperProps {
  children: ReactNode
}

export function ConvexClientWrapper({ children }: ConvexClientWrapperProps) {
  const [convex, setConvex] = useState<ConvexReactClient | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'initializing' | 'connected' | 'error'>(
    'initializing'
  )
  const [diagnostics, setDiagnostics] = useState<{
    network: ReturnType<typeof getNetworkInfo>
    websocket: WebSocketHealthResult
    timestamp: string
  } | null>(null)

  const initializeConvex = useCallback(async () => {
    try {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

      // Validate URL format
      const validation = validateConvexUrl(convexUrl || '')
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid Convex URL')
      }

      // Run connection diagnostics
      console.log('Running connection diagnostics...')
      const networkInfo = getNetworkInfo()
      console.log('Network info:', networkInfo)

      // Test WebSocket connection specifically
      const wsTest = await testWebSocketConnection(convexUrl!)
      console.log('WebSocket test result:', wsTest)

      if (!wsTest.success) {
        console.warn('WebSocket test failed, but continuing with HTTP fallback')
        setDiagnostics({
          network: networkInfo,
          websocket: wsTest,
          timestamp: new Date().toISOString(),
        })
      }

      // Initialize Convex client with basic configuration
      // Note: ConvexReactClient has limited configuration options
      const client = new ConvexReactClient(convexUrl!)

      // Set up connection monitoring
      if ('on' in client) {
        // @ts-expect-error - ConvexReactClient may have event listeners
        client.on('connectionStateChange', (state: string) => {
          console.log('Convex connection state:', state)
          if (state === 'disconnected') {
            setConnectionStatus('error')
            setConnectionError('Connection lost')
          }
        })

        // @ts-expect-error - ConvexReactClient may have error events
        client.on('error', (error: Error) => {
          console.error('Convex connection error:', error)
          setConnectionError(`Connection error: ${error.message || 'Unknown error'}`)
          setConnectionStatus('error')
        })
      }

      // Set the client immediately
      setConvex(client)
      setConnectionError(null)
      setConnectionStatus('connected')
      setIsRetrying(false)

      console.log('Convex client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Convex client:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Convex'
      setConnectionError(errorMessage)
      setConnectionStatus('error')
    }
  }, [])

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout

    const handleReconnect = () => {
      if (isRetrying) return

      setIsRetrying(true)
      setConnectionStatus('initializing')

      retryTimeout = setTimeout(() => {
        console.log('Attempting to reconnect to Convex...')
        initializeConvex()
      }, 5000) // Increased retry delay to 5 seconds
    }

    // Only initialize if not already connected or retrying
    if (connectionStatus === 'initializing' && !convex && !isRetrying) {
      initializeConvex()
    } else if (connectionStatus === 'error' && !isRetrying) {
      handleReconnect()
    }

    // Cleanup on unmount
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      if (convex) {
        convex.close()
      }
    }
  }, [connectionStatus, convex, isRetrying, initializeConvex])

  if (connectionStatus === 'error' && connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="w-12 h-12 border-4 border-destructive border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-foreground">Connection Issue</h2>
          <p className="text-muted-foreground">{connectionError}</p>
          {isRetrying && <p className="text-sm text-primary">Retrying connection...</p>}
          {diagnostics && (
            <div className="mt-4 p-3 bg-muted rounded-md text-left">
              <h4 className="font-semibold text-sm mb-2">Connection Diagnostics:</h4>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Network:</strong> {diagnostics.network?.online ? 'Online' : 'Offline'}
                </p>
                <p>
                  <strong>Connection Type:</strong>{' '}
                  {diagnostics.network?.effectiveType || 'Unknown'}
                </p>
                <p>
                  <strong>WebSocket:</strong>{' '}
                  {diagnostics.websocket?.success ? 'Connected' : 'Failed'}
                </p>
                {diagnostics.websocket?.error && (
                  <p>
                    <strong>WebSocket Error:</strong> {diagnostics.websocket.error}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => setIsRetrying(true)}
              disabled={isRetrying}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {isRetrying ? 'Retrying...' : 'Retry Now'}
            </button>
            <button
              onClick={async () => {
                const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
                if (convexUrl) {
                  const fullDiagnostics = await runConnectionDiagnostics(convexUrl)
                  setDiagnostics(fullDiagnostics)
                  console.log('Full diagnostics:', fullDiagnostics)
                }
              }}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
            >
              Run Diagnostics
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (connectionStatus === 'initializing' || !convex) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">
            {isRetrying ? 'Reconnecting to Convex...' : 'Initializing connection...'}
          </p>
        </div>
      </div>
    )
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
