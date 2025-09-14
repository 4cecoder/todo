/**
 * Test Convex connection and return connection status
 */
export async function testConvexConnection(convexUrl: string): Promise<{
  success: boolean
  error?: string
  latency?: number
}> {
  try {
    if (!convexUrl) {
      return {
        success: false,
        error: 'Convex URL is not configured',
      }
    }

    const startTime = Date.now()

    // Simple URL validation test first
    try {
      new URL(convexUrl)
    } catch {
      return {
        success: false,
        error: 'Invalid Convex URL format',
      }
    }

    // Test HTTP endpoint accessibility with AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    let response
    try {
      response = await fetch(`${convexUrl.replace('.cloud', '.cloud/api/1.27.0/sync')}`, {
        method: 'HEAD',
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          success: false,
          error: 'Connection timeout',
        }
      }
      throw fetchError
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response || !response.ok) {
      return {
        success: false,
        error: response
          ? `HTTP ${response.status}: ${response.statusText}`
          : 'Cannot reach Convex server',
      }
    }

    const latency = Date.now() - startTime

    return {
      success: true,
      latency,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connection error',
    }
  }
}

/**
 * Get WebSocket URL from Convex HTTP URL
 */
export function getWebSocketUrl(convexUrl: string): string {
  return convexUrl.replace('https://', 'wss://').replace('.cloud', '.cloud/api/1.27.0/sync')
}

/**
 * Validate Convex URL format
 */
export function validateConvexUrl(url: string): {
  valid: boolean
  error?: string
} {
  if (!url) {
    return {
      valid: false,
      error: 'URL is required',
    }
  }

  try {
    new URL(url)
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    }
  }

  if (!url.includes('.convex.cloud')) {
    return {
      valid: false,
      error: 'URL must be a Convex cloud URL',
    }
  }

  if (!url.startsWith('https://')) {
    return {
      valid: false,
      error: 'URL must use HTTPS',
    }
  }

  return {
    valid: true,
  }
}
