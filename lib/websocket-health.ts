/**
 * WebSocket health check utilities for Convex connection debugging
 */

export interface WebSocketHealthResult {
  success: boolean
  error?: string
  details?: unknown
  connectionTime?: number
}

/**
 * Test WebSocket connection to Convex endpoint
 */
export async function testWebSocketConnection(convexUrl: string): Promise<WebSocketHealthResult> {
  const startTime = Date.now()

  // Convert HTTP URL to WebSocket URL
  const wsUrl = convexUrl.replace('https://', 'wss://').replace('http://', 'ws://')
  const fullWsUrl = `${wsUrl}/api/1.27.0/sync`

  return new Promise((resolve) => {
    let ws: WebSocket | null = null
    const timeout = setTimeout(() => {
      if (ws) {
        ws.close()
      }
      resolve({
        success: false,
        error: 'WebSocket connection timeout after 10 seconds',
        connectionTime: Date.now() - startTime,
      })
    }, 10000)

    try {
      ws = new WebSocket(fullWsUrl)

      ws.onopen = () => {
        clearTimeout(timeout)
        const connectionTime = Date.now() - startTime
        console.log(`WebSocket connection established in ${connectionTime}ms`)

        if (ws) {
          ws.close()
        }

        resolve({
          success: true,
          details: 'WebSocket connection established successfully',
          connectionTime,
        })
      }

      ws.onerror = (event) => {
        clearTimeout(timeout)
        const connectionTime = Date.now() - startTime
        console.error('WebSocket error:', event)

        resolve({
          success: false,
          error: `WebSocket error: ${event.type || 'Unknown error'}`,
          details: event,
          connectionTime,
        })
      }

      ws.onclose = (event) => {
        clearTimeout(timeout)
        const connectionTime = Date.now() - startTime

        if (event.code !== 1000 && event.code !== 1005) {
          // 1000 = Normal closure, 1005 = No status received
          console.warn(`WebSocket closed with code ${event.code}: ${event.reason}`)

          resolve({
            success: false,
            error: `WebSocket closed with code ${event.code}: ${event.reason}`,
            details: event,
            connectionTime,
          })
        }
      }
    } catch (error) {
      clearTimeout(timeout)
      const connectionTime = Date.now() - startTime

      resolve({
        success: false,
        error: `Failed to create WebSocket: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
        connectionTime,
      })
    }
  })
}

/**
 * Test network connectivity to Convex HTTP endpoint
 */
export async function testHttpConnectivity(convexUrl: string): Promise<{
  success: boolean
  status?: number
  error?: string
  responseTime?: number
}> {
  const startTime = Date.now()

  try {
    const response = await fetch(`${convexUrl}/api/1.27.0/sync`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    })

    const responseTime = Date.now() - startTime

    return {
      success: true,
      status: response.status,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    return {
      success: false,
      error: `HTTP connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime,
    }
  }
}

/**
 * Get network information for debugging
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNetworkInfo(): {
  online: boolean
  connectionType?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connection =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).connection ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).mozConnection ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).webkitConnection

  return {
    online: navigator.onLine,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectionType: (connection as any)?.type,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    effectiveType: (connection as any)?.effectiveType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    downlink: (connection as any)?.downlink,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rtt: (connection as any)?.rtt,
  }
}

/**
 * Comprehensive connection diagnostics
 */
export async function runConnectionDiagnostics(convexUrl: string): Promise<{
  network: ReturnType<typeof getNetworkInfo>
  http: Awaited<ReturnType<typeof testHttpConnectivity>>
  websocket: Awaited<ReturnType<typeof testWebSocketConnection>>
  timestamp: string
}> {
  console.log('Running connection diagnostics...')

  const network = getNetworkInfo()
  const http = await testHttpConnectivity(convexUrl)
  const websocket = await testWebSocketConnection(convexUrl)

  const result = {
    network,
    http,
    websocket,
    timestamp: new Date().toISOString(),
  }

  console.log('Connection diagnostics result:', result)

  return result
}
